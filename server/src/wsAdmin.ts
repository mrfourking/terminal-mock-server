import { WebSocketServer, WebSocket, RawData } from "ws"

type ClientId = string

interface AdminMessage {
  type: "send" | "broadcast" | "ping"
  clientId?: ClientId
  payload: unknown
}

// Сокеты для админки
class WsAdmin {
  private wss: WebSocketServer
  private adminClients: Set<WebSocket>

  constructor(
    private clients: Map<ClientId, WebSocket>,
    // private log: Logger,
  ) {
    this.wss = new WebSocketServer({ noServer: true })
    this.adminClients = new Set()

    this.setup()
  }

  // Настройка сервера
  private setup() {
    this.wss.on("connection", (ws) => this.handleConnection(ws))
  }

  // Обработка соединения сокетов
  private handleConnection(ws: WebSocket) {
    console.log("here")
    this.adminClients.add(ws)

    ws.on("close", () => {
      console.log("client disconnected")
      this.adminClients.delete(ws)
    })

    ws.on("message", (message) => {
      this.handleMessage(ws, message)
    })
  }

  // Обработка сообщений сокетов
  private handleMessage(ws: WebSocket, message: RawData) {
    try {
      const data: AdminMessage = JSON.parse(message.toString())
      // console.log("message", data)

      if (data.type === "send" && data.clientId) {
        const client = this.clients.get(data.clientId)

        if (client) {
          client.send(JSON.stringify(data.payload))
          this.log(`ADMIN → ${data.clientId}: ${JSON.stringify(data.payload)}`)
        }
      }

      if (data.type === "broadcast") {
        this.clients.forEach((c) => c.send(JSON.stringify(data.payload)))

        this.log(`ADMIN BROADCAST: ${JSON.stringify(data.payload)}`)
      }

      if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }))
      }
    } catch {
      this.log("Invalid admin message")
    }
  }

  public log(message: string): void {
    console.log(message)

    console.log("adminClients log:", this.adminClients.size)

    const payload = JSON.stringify({
      type: "log",
      message,
      time: new Date().toISOString(),
    })

    this.adminClients.forEach((ws) => ws.send(payload))
  }

  // Доступ к экзепляру сервера
  public getWSS() {
    return this.wss
  }
}

export default WsAdmin
