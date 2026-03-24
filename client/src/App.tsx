import { useEffect, useMemo, useRef, useState } from "react"

import { DarkModeToggle } from "./components/toggle"

import Logo from "./assets/logo.png"
import { Badge, BadgeTypeEnum } from "./components/Badge"

enum ConnectionStatus {
  connecting = "connecting",
  disconnected = "disconnected",
  connected = "connected",
}

type Log = {
  message: string
  time: string
}

function App() {
  const [logs, setLogs] = useState<Log[]>([])
  const [, /*clients*/ setClients] = useState<string[]>([])
  const [selectedClient /*setSelectedClient*/] = useState<string>("")
  const [message /*setMessage*/] = useState('{\n  "type": "test"\n}')
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.connecting)

  const wsRef = useRef<WebSocket | null>(null)

  const connectionStatus = useMemo(() => {
    switch (status) {
      case ConnectionStatus.connecting:
        return BadgeTypeEnum.warning
      case ConnectionStatus.connected:
        return BadgeTypeEnum.success
      case ConnectionStatus.disconnected:
      default:
        return BadgeTypeEnum.danger
    }
  }, [status])

  const send = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: "send",
        clientId: selectedClient,
        payload: JSON.parse(message),
      }),
    )
  }

  const broadcast = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: "broadcast",
        payload: JSON.parse(message),
      }),
    )
  }

  const connect = () => {
    if (wsRef.current) return

    setStatus(ConnectionStatus.connecting)

    const ws = new WebSocket(`ws://localhost:8080/admin-ws`)
    wsRef.current = ws

    let heartbeatInterval: any
    let lastPong = Date.now()

    ws.onopen = () => {
      setStatus(ConnectionStatus.connected)

      // ❤️ heartbeat
      heartbeatInterval = setInterval(() => {
        if (Date.now() - lastPong > 5000) {
          setStatus(ConnectionStatus.disconnected)
          ws.close()
          return
        }

        ws.send(JSON.stringify({ type: "ping" }))
      }, 2000)
    }

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data.type === "pong") {
        lastPong = Date.now()
        return
      }

      if (data.type === "log") {
        setLogs((prev) => [...prev, data])

        if (data.message.includes("Client connected")) {
          const id = data.message.split(": ")[1]
          setClients((prev) => [...prev, id])
        }

        if (data.message.includes("Client disconnected")) {
          const id = data.message.split(": ")[1]
          setClients((prev) => prev.filter((c) => c !== id))
        }
      }
    }

    ws.onclose = () => {
      setStatus(ConnectionStatus.disconnected)
      clearInterval(heartbeatInterval)
      wsRef.current = null
      setTimeout(connect, 1000) // reconnect
    }
  }

  // WS connect
  useEffect(() => {
    connect()
    return () => {
      console.log("disconnected")
      wsRef.current?.close()
    }
  }, [])

  return (
    <section className="h-screen flex flex-col gap-5 bg-indigo-100 dark:bg-gray-950 dark:text-gray-200 text-black">
      <div className="text-white p-4 border-b border-l border-r border-gray-400 dark:border-gray-800 flex items-center justify-between rounded-b-3xl bg-indigo-950 ">
        <div>
          <img className="h-12" src={Logo} alt="WS Admin" />
        </div>
        <div className="flex items-center gap-4">
          {status && (
            <div>
              {" "}
              Статус подключения: <Badge text={status} type={connectionStatus} />
            </div>
          )}
          <DarkModeToggle
            checked={document.documentElement.classList.contains("dark")}
            onChange={() => {
              document.documentElement.classList.toggle("dark")
              localStorage.setItem(
                "theme",
                document.documentElement.classList.contains("dark") ? "dark" : "light",
              )
            }}
          />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden gap-4 px-2">
        <div className="w-64  dark:bg-gray-950 border border-gray-400 dark:border-gray-800 p-2 overflow-auto rounded-lg">
          клиенты
        </div>
        <div className="flex-1  dark:bg-gray-950 border p-2 border-gray-400 dark:border-gray-800 overflow-auto text-sm font-mono rounded-lg">
          {logs.length > 0 ? (
            logs.map((log) => (
              <p key={log.time}>
                {log.time} - {log.message}
              </p>
            ))
          ) : (
            <p>Логов пока что нет...</p>
          )}
        </div>
      </div>
      <div className="px-2 min-h-1/4">
        <div className="h-full flex border-t border-r border-gray-400 dark:border-gray-800  dark:bg-gray-950 border-l rounded-t-lg p-3">
          <div className="flex flex-col">
            <button onClick={send}>Send to client</button>
            <button onClick={broadcast}>Broadcast</button>
          </div>
          <div></div>
        </div>
      </div>
    </section>
  )
}

export default App
