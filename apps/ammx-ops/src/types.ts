export type ZoneId = 'ta' | 'ld' | 'od' | 'ops' | 'ai' | 'audit' | 'pmo' | 'war' | 'dock' | 'campus';

export type AgentStatus = 'working' | 'waiting' | 'meeting' | 'analyzing' | 'blocked' | 'available';

export type Anim = 'type' | 'screen' | 'talk' | 'phone' | 'present' | 'inspect' | 'idle';

export interface Spot {
  id: string;
  zone: ZoneId;
  pos: [number, number]; // x, z
  face: number; // rotation Y the agent faces when working
}

export interface ZoneDef {
  id: ZoneId;
  name: string;
  short: string;
  center: [number, number];
  size: [number, number];
  door: [number, number];
  side: 'back' | 'front' | 'center' | 'east';
  accent: string;
  floor: string;
  agents: string[];
}

export interface Activity {
  spot: string;
  minutes: number;
  status: AgentStatus;
  anim: Anim;
  task: string;
  project: string;
  next: string;
  feed: string;
}

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  zone: ZoneId;
  virtual: boolean;
  shirt: string;
  pants: string;
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'bun' | 'none';
  height: number;
  focus: string; // one-line mission
  script: Activity[];
}

export type ProjectStatus = 'ontrack' | 'attention' | 'risk' | 'notstarted' | 'blocked';

export interface Milestone { label: string; done: boolean; date?: string }

export interface ProjectDef {
  id: string;
  name: string;
  area: 'Reclutamiento' | 'Capacitación' | 'Desarrollo Organizacional' | 'Digital y analítica';
  owner: string;
  team: string[];
  status: ProjectStatus;
  priority: string; // P1–P5 or '—'
  urgency: 'U0' | 'U1' | 'U2' | 'U3' | 'U4';
  maturity: 'Probado' | 'En piloto' | 'Conceptual' | 'Por confirmar';
  progress: number; // ilustrativo
  due: string;
  objective: string;
  milestones: Milestone[];
  risks: string[];
  decision?: string;
  documents: string[];
  kpis: string[];
  next: string;
  ownerProposed?: boolean;
  featured?: boolean;
}

export type TaskStage = 'queued' | 'working' | 'atlas' | 'aegis' | 'approval' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'U0' | 'U1' | 'U2' | 'U3' | 'U4';
  due: string;
  owner: string;
  supports: string[];
  project: string;
  output: string;
  reviews: { atlas: boolean; aegis: boolean; director: boolean };
  stage: TaskStage;
  progress: number;
  createdAt: number; // sim minute
}

export type AlertLevel = 'critical' | 'attention' | 'info' | 'done';

export interface Alert {
  id: string;
  level: AlertLevel;
  text: string;
  source: 'Cartera' | 'Ilustrativa' | 'Simulación';
  target?: { kind: 'agent' | 'project' | 'zone'; id: string };
  at: number;
}

export interface FeedItem { id: number; at: number; agent?: string; text: string; kind?: 'task' | 'meeting' | 'audit' | 'alert' | 'info' }

export interface Decision {
  id: string;
  title: string;
  context: string;
  options: string[];
  recommendation: string;
  project?: string;
  source: 'Cartera' | 'Tarea';
  taskId?: string;
  resolved?: string;
}

export interface ChatMsg { from: 'user' | 'agent'; text: string; at: number }
