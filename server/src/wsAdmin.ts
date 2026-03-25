import { WebSocketServer, WebSocket, RawData } from "ws"
import { AdminClientSetter, ClientId, Logger } from "./types"

interface AdminMessage {
  type: "send" | "broadcast" | "ping"
  clientId?: ClientId
  payload: unknown
}

// Сокеты для админки
class WsAdmin {
  private wss: WebSocketServer

  constructor(
    private clients: Map<ClientId, WebSocket>,
    private adminClients: Set<WebSocket>,
    private updateAdminClients: AdminClientSetter,
    private log: Logger,
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
    console.log("admin client connected")
    // this.adminClients.add(ws)
    this.updateAdminClients(ws, "set")

    ws.on("close", () => {
      console.log("admin client disconnected")
      this.updateAdminClients(ws, "delete")
    })

    ws.on("message", (message) => {
      this.handleMessage(ws, message)
    })
  }

  // Обработка сообщений сокетов
  private handleMessage(ws: WebSocket, message: RawData) {
    try {
      const data: AdminMessage = JSON.parse(message.toString())

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

  // Доступ к экзепляру сервера
  public getWSS() {
    return this.wss
  }
}

export default WsAdmin
