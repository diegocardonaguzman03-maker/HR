// Core domain model for Francisco Command Center.
// These types mirror the suggested PostgreSQL entities (see README → Data model).

export type ID = string;

/** Where an activity came from. The UI must never present simulated work as real. */
export type ActivitySource = 'real' | 'simulated';

export type TerritoryId = 'industrial' | 'praxia' | 'personal' | 'frontier' | 'citadel';

export interface Territory {
  id: TerritoryId;
  name: string;
  tagline: string;
  represents: string;
  /** Tile-space polygon that outlines the territory (used by world + minimap). */
  polygon: [number, number][];
  /** Tile-space focus point for the camera. */
  center: [number, number];
  /** Tile coordinate of the district hub (road junction). */
  hub: [number, number];
  palette: { ground: number; groundAlt: number; accent: number; road: number };
  /** Free plots where new project structures can be built. */
  plots: [number, number][];
}

export type BuildingType =
  | 'citadel'
  | 'techlab'
  | 'fortress'
  | 'academy'
  | 'forge'
  | 'tower'
  | 'observatory'
  | 'council'
  | 'station'
  | 'laboratory'
  | 'temple'
  | 'studio'
  | 'productlab'
  | 'house'
  | 'grounds'
  | 'library'
  | 'dock'
  | 'hangar'
  | 'outpost';

export type ProjectKind =
  | 'research'
  | 'training'
  | 'technology'
  | 'recruiting'
  | 'transformation'
  | 'analytics'
  | 'strategy'
  | 'personal'
  | 'praxia'
  | 'experimental';

export type ProjectStatus = 'active' | 'paused' | 'blocked' | 'completed' | 'archived' | 'planning';
export type Priority = 'low' | 'normal' | 'high' | 'critical';

export interface Kpi {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'flat';
  good?: boolean;
}

export interface Project {
  id: ID;
  name: string;
  /** Short building name shown on the map, e.g. "Digital Twin Lab". */
  structure: string;
  kind: ProjectKind;
  building: BuildingType;
  territory: TerritoryId;
  /** Tile coordinates of the building anchor (front corner). */
  tile: [number, number];
  /** Footprint in tiles (square). */
  size: number;
  objective: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  owner: string;
  progress: number; // 0..100
  agentIds: ID[];
  missionIds: ID[];
  fileIds: ID[];
  decisionIds: ID[];
  dependencies: ID[];
  kpis: Kpi[];
  /** Sub-areas / programmes inside the structure (e.g. academies). */
  components?: string[];
  createdAt: number;
  /** True while the construction animation should play (new project). */
  underConstruction?: boolean;
}

export type MissionStatus = 'pending' | 'active' | 'review' | 'blocked' | 'done';
export type MissionLevel = 'mission' | 'objective' | 'sub-mission' | 'milestone' | 'critical';

export interface Mission {
  id: ID;
  projectId: ID;
  code: string; // "MISSION 01"
  title: string;
  level: MissionLevel;
  status: MissionStatus;
  agentIds: ID[];
  dependsOn: ID[];
  progress: number;
  deadline: string; // ISO date
  outputs: string[];
}

export type AgentState =
  | 'working'
  | 'researching'
  | 'collaborating'
  | 'waiting'
  | 'reviewing'
  | 'blocked'
  | 'idle'
  | 'completed'
  | 'paused';

export type AgentLook = 'halo' | 'cape' | 'hardhat' | 'visor' | 'tie' | 'cube' | 'leaf' | 'coin' | 'plain';

export interface AgentTask {
  id: ID;
  title: string;
  projectId: ID | null;
  missionId?: ID | null;
  state: Exclude<AgentState, 'idle' | 'paused' | 'completed'>;
  progress: number;
  startedAt: number;
  priority: Priority;
}

export interface Agent {
  id: ID;
  name: string;
  role: string;
  specialization: string;
  description: string;
  color: number;
  look: AgentLook;
  skills: string[];
  tools: string[];
  homeProjectId: ID; // home building
  territory: TerritoryId;
  state: AgentState;
  /** State before pause, so resume restores it. */
  stateBeforePause?: AgentState;
  currentTask: AgentTask | null;
  taskQueue: AgentTask[];
  conversationIds: ID[];
  collaborators: ID[];
  memory: string[];
  recentActivities: string[];
  /** Where the activity comes from. `null` = nothing is executing. */
  activitySource: ActivitySource | null;
  /** Live position in tile space (owned by the game layer, mirrored for minimap/UI). */
  position: [number, number];
  lastActivityAt: number;
  performance: { missionsCompleted: number; avgCycleHours: number; approvalRate: number };
  squadId?: ID | null;
  /** Pending question for Francisco when state === 'waiting'. */
  waitingFor?: { question: string; decisionId?: ID } | null;
  blockedReason?: string | null;
}

export interface Squad {
  id: ID;
  name: string;
  objective: string;
  projectId: ID;
  agentIds: ID[];
  dependencies: string[];
  outputs: string[];
  discussion: { agentId: ID; text: string; ts: number }[];
  createdAt: number;
  active: boolean;
}

export type MessageRole = 'user' | 'agent' | 'system';

export interface MessageAction {
  label: string;
  /** e.g. focus:project:p-3d · open:project:p-3d · decision:approve:d-1 */
  command: string;
}

export interface Message {
  id: ID;
  conversationId: ID;
  role: MessageRole;
  agentId?: ID;
  text: string;
  ts: number;
  attachments?: { fileId: ID; name: string }[];
  actions?: MessageAction[];
  source?: ActivitySource;
}

export interface Conversation {
  id: ID;
  title: string;
  agentId: ID;
  projectId: ID | null;
  missionId?: ID | null;
  messageIds: ID[];
  updatedAt: number;
}

export interface FileDoc {
  id: ID;
  name: string;
  kind: 'pdf' | 'doc' | 'sheet' | 'deck' | 'image' | 'model' | 'note' | 'other';
  projectId: ID | null;
  agentId: ID | null;
  size: string;
  updatedAt: number;
  summary: string;
  /** Simulated deliverables have no real content behind them. */
  simulated?: boolean;
  /** Text content of a deliverable an agent actually wrote. */
  content?: string;
}

export type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'revision';

export interface Decision {
  id: ID;
  title: string;
  context: string;
  projectId: ID | null;
  agentId: ID | null;
  options: string[];
  recommendation: string;
  status: DecisionStatus;
  requestedAt: number;
  decidedAt?: number;
  dueBy?: string;
}

export type NotificationKind =
  | 'input_needed'
  | 'mission_completed'
  | 'deadline'
  | 'document_ready'
  | 'project_blocked'
  | 'meeting'
  | 'info';

export interface AppNotification {
  id: ID;
  kind: NotificationKind;
  title: string;
  body: string;
  ts: number;
  read: boolean;
  /** High-priority notifications surface in the UI; low ones only in the world. */
  priority: 'low' | 'high';
  target?: { type: 'agent' | 'project' | 'decision'; id: ID };
}

export interface CalendarEvent {
  id: ID;
  title: string;
  start: string; // ISO datetime
  durationMin: number;
  projectId?: ID | null;
  location?: string;
}

export interface InboxItem {
  id: ID;
  from: string;
  subject: string;
  preview: string;
  ts: number;
  projectId?: ID | null;
}

export type ActivityCategory = 'work' | 'praxia' | 'personal' | 'frontier';

export interface ActivityItem {
  id: ID;
  ts: number;
  text: string;
  eventType: string;
  agentId?: ID;
  projectId?: ID;
  category: ActivityCategory;
  critical: boolean;
  waitingForMe: boolean;
  completed: boolean;
  source: ActivitySource | 'user';
}
