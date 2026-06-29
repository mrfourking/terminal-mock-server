import { type FC, useEffect, useRef } from "react"
import { type Log, LogItem } from "../LogItem"
import Button from "../../Button"

export const LogContainer: FC<{ logs: Log[]; clearLogs: () => void }> = ({ logs, clearLogs }) => {
  const logEndRef = useRef<HTMLDivElement | null>(null)
  const logsContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (logsContainerRef.current) logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className=" relative dark:bg-gray-950 border p-2 border-gray-400 dark:border-gray-800 overflow-auto text-sm font-mono rounded-lg">
        <Button
          disabled={logs.length === 0}
          className="ml-auto z-10 sticky top-2 right-2"
          onClick={clearLogs}
        >
          Clear logs
        </Button>
      </div>

      <div
        ref={logsContainerRef}
        className=" relative flex-1 dark:bg-gray-950 border p-2 border-gray-400 dark:border-gray-800 overflow-auto text-sm font-mono rounded-lg"
      >
        <div className="w-full flex"></div>
        {logs.length > 0 ? (
          logs.map((log, index) => <LogItem key={log.time + index} log={log} />)
        ) : (
          <p>Логов пока что нет...</p>
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}
