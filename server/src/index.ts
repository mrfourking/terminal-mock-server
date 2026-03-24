import express from "express"
import path from "path"
import http from "http"
import wsAdmin from "./wsAdmin"

const app = express()
const server = http.createServer(app)

const clients = new Map()

// ===== ADMIN =====
const adminWSS = new wsAdmin(clients)

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/admin-ws") {
    adminWSS.getWSS().handleUpgrade(req, socket, head, (ws) => {
      adminWSS.getWSS().emit("connection", ws, req)
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
