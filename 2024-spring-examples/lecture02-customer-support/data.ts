export type Severity = 1 | 2 | 3
export type Status = "unassigned" | "pending-user" | "pending-support" | "closed"

export interface LogEntry {
  timestamp: number
  status: Status
  severity: Severity
  comment: string
}

export interface Case {
  id: number
  summary: string
  log: LogEntry[]
}