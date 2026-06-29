import { useEffect, useMemo, useRef, useState } from "react"

import { DarkModeToggle } from "./components/toggle"

import Logo from "./assets/logo.png"
import { Badge, BadgeTypeEnum } from "./components/Badge"
import Button from "./components/Button"
import { type Log } from "./components/Logs/LogItem"
import { LogContainer } from "./components/Logs"

enum ConnectionStatus {
  connecting = "connecting",
  disconnected = "disconnected",
  connected = "connected",
}

interface IMock {
  id: string
  name: string
}

function App() {
  const [logs, setLogs] = useState<Log[]>([])
  const [clients, setClients] = useState<string[]>([])
  const [mocks, setMocks] = useState<IMock[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [message, setMessage] = useState(
    '{\n  "type": "app-command", \n  "command": "show-info" \n}',
  )
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.connecting)
  const [parseError, setParseError] = useState("")

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

  const clearLogs = () => {
    setLogs([])
  }

  const send = () => {
    let payload = null
    try {
      payload = JSON.parse(message)
    } catch (e) {
      setParseError("Введен не валидный JSON")
    }

    if (!payload) {
      return
    }

    wsRef.current?.send(
      JSON.stringify({
        type: "send",
        clientId: selectedClient,
        payload,
      }),
    )
  }

  const getMock = (id: string | number) => {
    wsRef.current?.send(
      JSON.stringify({
        type: "mock:get",
        payload: {
          id,
        },
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

      ws.send(JSON.stringify({ type: "mocks:get_list" }))
    }

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data.type === "clients") {
        setClients(data.clients)
      }

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

      if (data.type === "mocks:list") {
        setMocks(data.list)
      }

      if (data.type === "mock:get") {
        setMessage(data.message)
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
        <div className="w-72 dark:bg-gray-950 border border-gray-400 dark:border-gray-800 p-2 overflow-auto rounded-lg">
          {clients.length > 0 &&
            clients.map((client) => (
              <div
                key={client}
                className={`font-mono text-xs mb-1 p-1 rounded ${client === selectedClient ? "bg-indigo-400 dark:bg-indigo-700 text-white" : ""}`}
                onClick={() => setSelectedClient(client)}
              >
                {client}
              </div>
            ))}
        </div>
        <LogContainer logs={logs} clearLogs={clearLogs} />
      </div>
      <div className="px-2 min-h-1/2">
        <div className="h-full flex gap-4 border-t border-r border-gray-400 dark:border-gray-800  dark:bg-gray-950 border-l rounded-t-lg p-3">
          <div className="flex-1 flex flex-col gap-2">
            <div>
              <Button onClick={send}>Send to client</Button>
            </div>
            <h3>Шаблоны сообщений:</h3>
            <div className="grid grid-cols-2 gap-4">
              {mocks.map((mock) => (
                <Button onClick={() => getMock(mock.id)} key={mock.id}>
                  {mock.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              defaultValue={message}
              value={message}
              className="bg-white dark:bg-gray-600 w-full flex-1 rounded-lg dark:outline-white p-2"
              onChange={(e) => {
                setParseError("")
                setMessage(e.target.value)
              }}
            />
            {parseError && <div className="text-red-600">{parseError}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}

export default App
