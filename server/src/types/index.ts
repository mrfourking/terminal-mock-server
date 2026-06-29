import { WebSocket } from "ws"

export type ClientId = string

export type Logger = (message: string, type?: string) => void

export type ClientSetter = (
  type: "set" | "update" | "delete",
  id: ClientId,
  client?: WebSocket,
) => void

export type AdminClientSetter = (ws: WebSocket, type: "set" | "delete") => void

export type ClientsMapType = Map<ClientId, WebSocket>
