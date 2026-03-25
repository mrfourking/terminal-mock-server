import { WebSocket } from "ws"

export type ClientId = string

export type Logger = (message: string) => void

export type ClientSetter = (type: "set" | "delete", id: ClientId, ws?: WebSocket) => void

export type AdminClientSetter = (ws: WebSocket, type: "set" | "delete") => void
