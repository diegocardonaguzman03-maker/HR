import { Badge, type Tone } from "@/components/ui/primitives";
import type { AgentStatus } from "@/server/db/schema";

const TONE: Record<AgentStatus, Tone> = { available: "ok", working: "indigo", waiting_input: "warn", waiting_approval: "clay", completed: "ok", error: "bad", offline: "neutral" };
export function AgentStatusBadge({ status, title, manual }: { status: AgentStatus; title?: string; manual?: boolean }) {
  return <Badge tone={TONE[status]} title={title}>{status.replace("_", " ")}{manual ? " · manual" : ""}</Badge>;
}
