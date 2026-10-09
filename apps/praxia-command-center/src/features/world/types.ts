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
  department: string; // one of WORLD_DEPARTMENTS (drives the work animation)
  team: string; // delivery team, e.g. "E3 Marca y Demanda" (drives the room)
  status: AgentStatus;
  statusNote: string;
  currentTaskTitle: string | null;
  /** Recorded progress (0–100) of the current task, or null when there is none. */
  currentTaskProgress?: number | null;
  /** Tasks waiting in the agent's queue (drawn as an inbox tray on the desk). */
  tasksQueued?: number;
  /** Open tasks past their due date (the tray badge turns red). */
  tasksOverdue?: number;
  avatar: AvatarConfig;
};

/** A real task event recorded in `agent_events`. The world plays each one once, as it arrives. */
export type WorldEvent = { id: string; agentId: string; taskId: string | null; type: string; message: string; at: string };

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
  /** New task events to play (each event id is played once). */
  events?: WorldEvent[];
  /** Pan the camera to an agent or a room whenever `focus.nonce` changes. */
  focus?: { kind: "agent" | "area"; id: string; nonce: number } | null;
};
