/**
 * Contract between the Command Center and PRAXIA World.
 * The world renders ONLY what it receives here (real agent registry + statuses derived from task events).
 * It never invents activity: an agent animates as working only when `status === "working"`.
 */
import type { AgentStatus, AvatarConfig } from "@/server/db/schema";

export type { AgentStatus, AvatarConfig };

export type WorldAgent = {
  id: string; // e.g. "SAL-03"
  role: string; // e.g. "Solutions Consultant & Proposal Lead"
  department: string; // one of WORLD_DEPARTMENTS
  status: AgentStatus;
  statusNote: string;
  currentTaskTitle: string | null;
  avatar: AvatarConfig;
};

/** The 11 departments of the agent registry (PRD §13). Each maps to a room in the HQ. */
export const WORLD_DEPARTMENTS = [
  "Executive Leadership",
  "Strategy & Research",
  "Sales & Business Development",
  "Marketing & Public Relations",
  "Client Delivery",
  "Product & Engineering",
  "UX, UI & Creative Design",
  "Operations & Finance",
  "Human Resources & Internal Communications",
  "Customer Success",
  "Data, Quality & Governance",
] as const;

export type PraxiaWorldProps = {
  agents: WorldAgent[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  /** Respect prefers-reduced-motion: no walking/bobbing animations, instant transitions. */
  reducedMotion?: boolean;
};
