import { WebSocket, WebSocketServer } from "ws"
// import { v4 as uuid } from "uuid"
import { ClientSetter, ClientsMapType, Logger } from "./types"

class WsClient {
  private wss: WebSocketServer

  constructor(
    private clients: ClientsMapType,
    private updateClients: ClientSetter,
    private log: Logger,
  ) {
    this.wss = new WebSocketServer({ noServer: true })

    this.setup()
  }

  private setup() {
    this.wss.on("connection", (ws) => this.handleConnection(ws))
  }

  private handleConnection(ws: WebSocket) {
    console.log("client connected")
    const id = `terminal-${this.clients.size + 1}`
    this.updateClients("set", id, ws)

    // ws.send(JSON.stringify({ type: "welcome", id }))

    this.log(`Client connected: ${id}`)

    ws.on("message", (msg) => {
      let parsed

      try {
        parsed = JSON.parse(msg.toString())
      } catch (e) {
        console.error(e)
      }

      if (parsed.type === "ping") {
        this.log(`FROM ${id}: ${msg}`, "heartbeat")
        ws.send(JSON.stringify({ type: "pong" }))
      } else {
        this.log(`FROM ${id}: ${msg}`)
      }
    })

    ws.on("close", () => {
      this.updateClients("delete", id)
      this.log(`Client disconnected: ${id}`)
    })
  }

  public getWSS() {
    return this.wss
  }
}

export default WsClient
