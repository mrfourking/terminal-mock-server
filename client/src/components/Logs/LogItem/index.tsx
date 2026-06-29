import { DateTime } from "luxon"
import { getFormattedJsonFromString } from "../../../utils"
import type { FC } from "react"

export type Log = {
  message: string
  time: string
}

export const LogItem: FC<{ log: Log }> = ({ log }) => {
  const incoming = !log.message.startsWith("ADMIN")
  const jsonPart = log.message.substring(log.message.indexOf("{"))

  return (
    <div
      className={`py-10 px-4 mb-4 relative rounded-lg overflow-hidden ${incoming && "bg-green-100 dark:bg-green-900"} ${!incoming && "bg-red-200 dark:bg-red-900"}`}
    >
      <div
        className={`w-full absolute top-0 left-0 p-1 text-xs ${incoming && "bg-green-500 dark:bg-green-700"} ${!incoming && "bg-red-500 dark:bg-red-700"}`}
      >
        {DateTime.fromISO(log.time).toFormat("dd.MM.yyyy HH:mm:ss")} -{" "}
        {incoming ? "↓↓↓ incoming" : "↑↑↑ outgoing"}
      </div>
      <pre>{getFormattedJsonFromString(jsonPart)}</pre>
    </div>
  )
}
