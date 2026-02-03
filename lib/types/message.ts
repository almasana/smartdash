// lib/types/message.ts
export interface Message {
  id: string;
  type: "incoming" | "outgoing";
  content: string;
  timestamp: Date;
  priority: import("@/lib/domain/risk").RiskSeverity;
  status: "pending" | "read" | "delivered";
}
