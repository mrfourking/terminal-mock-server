import { WebSocket, WebSocketServer } from "ws"
import { v4 as uuid } from "uuid"
import { ClientSetter, Logger } from "./types"

class WsClient {
  private wss: WebSocketServer

  constructor(
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
    const id = uuid()
    this.updateClients("set", id, ws)

    ws.send(JSON.stringify({ type: "welcome", id }))

    this.log(`Client connected: ${id}`)

    ws.on("message", (msg) => {
      this.log(`FROM ${id}: ${msg}`)
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
