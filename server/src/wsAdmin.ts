import path from "path"
import { WebSocketServer, WebSocket, RawData } from "ws"

import { AdminClientSetter, ClientId, ClientsMapType, Logger } from "./types"
import * as fs from "node:fs"

interface AdminMessage {
  type: "send" | "broadcast" | "ping" | "mocks:list" | "mocks:get_list" | "mock:get"
  clientId?: ClientId
  payload?: {
    id?: string | number
  }
}

const MOCKS_DIR = path.join(process.cwd(), "assets/mock-data")

// Сокеты для админки
class WsAdmin {
  private wss: WebSocketServer

  constructor(
    private clients: ClientsMapType,
    private updateAdminClients: AdminClientSetter,
    private log: Logger,
  ) {
    this.wss = new WebSocketServer({ noServer: true })

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
    const clientsList = [...this.clients].map((client) => client[0])
    ws.send(JSON.stringify({ type: "clients", clients: clientsList }))

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

      if (data.type === "mocks:get_list") {
        try {
          fs.readdir(MOCKS_DIR, {}, (err, files) => {
            const mocks = files
              .filter((file) => typeof file === "string" && file.endsWith(".json"))
              .map((file, index) => ({
                id: file,
                name: typeof file === "string" ? file.replace(".json", "") : `file${index}`,
              }))

            if (mocks.length > 0) {
              ws.send(JSON.stringify({ type: "mocks:list", list: mocks }))
            }
          })
        } catch (error) {
          console.error("error")
          console.error(error)
        }
      }

      if (data.type === "mock:get") {
        const filePath = path.join(MOCKS_DIR, data.payload?.id as string)

        fs.readFile(filePath, (err, data) => {
          const strData = data.toString()
          ws.send(JSON.stringify({ type: "mock:get", message: strData }))
        })
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
