import express from "express"
import path from "path"
import http from "http"
import { WebSocket } from "ws"

import wsAdmin from "./wsAdmin"
import WsClient from "./wsClient"
import { ClientId } from "./types"

const app = express()
const server = http.createServer(app)

const clients: Map<ClientId, WebSocket> = new Map()
const adminClients: Set<WebSocket> = new Set()

// ===== UPDATE CLIENTS ======

function updateClients(type: "set" | "delete", id: ClientId, client?: WebSocket) {
  if (type === "set" && client) {
    clients.set(id, client)
  }

  if (type === "delete") {
    clients.delete(id)
  }
}

// ===== UPDATE ADMIN CLIENTS ======

function updateAdminClients(client: WebSocket, type: "set" | "delete") {
  if (type === "set") {
    adminClients.add(client)
  }

  if (type === "delete") {
    adminClients.delete(client)
  }
}

// ===== LOGGER =====
function log(message: string): void {
  console.log("log:", message)

  const payload = JSON.stringify({
    type: "log",
    message,
    time: new Date().toISOString(),
  })

  adminClients.forEach((ws) => ws.send(payload))
}

// ===== CLIENT =====
const clientWSS = new WsClient(updateClients, log)

// ===== ADMIN =====
const adminWSS = new wsAdmin(clients, adminClients, updateAdminClients, log)

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/admin-ws") {
    adminWSS.getWSS().handleUpgrade(req, socket, head, (ws) => {
      adminWSS.getWSS().emit("connection", ws, req)
    })
  } else {
    clientWSS.getWSS().handleUpgrade(req, socket, head, (ws) => {
      clientWSS.getWSS().emit("connection", ws, req)
    })
  }
})

// ===== STATIC =====
const clientPath = path.join(process.cwd(), "./assets/admin")

app.use(express.static(clientPath))

app.use((req, res) => {
  res.sendFile(path.join(clientPath, "index.html"))
})

// ===== START =====
server.listen(8080, () => {
  console.log("ws server start 🚀! Host: http://localhost:8080")
})
