-- Francisco Command Center — event-sourced persistence.
--
-- `events` is the source of truth (append-only). `snapshots` speed up recovery.
-- Every other table is a *projection*: rebuilt from events, safe to query for
-- history, analytics and audit, never written to directly by the app.

CREATE TABLE IF NOT EXISTS events (
  seq        BIGSERIAL PRIMARY KEY,
  id         TEXT        NOT NULL UNIQUE,
  ts         TIMESTAMPTZ NOT NULL,
  type       TEXT        NOT NULL,
  source     TEXT        NOT NULL CHECK (source IN ('real', 'simulated', 'user')),
  payload    JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_type_idx ON events (type);
CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts);

CREATE TABLE IF NOT EXISTS snapshots (
  seq        BIGINT      PRIMARY KEY,          -- last event seq included
  state      JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ───────────── entity projections (latest state) ─────────────
CREATE TABLE IF NOT EXISTS territories (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  territory_id TEXT NOT NULL,
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  progress INTEGER NOT NULL,
  tile_x REAL NOT NULL,
  tile_y REAL NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_territory_idx ON projects (territory_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects (status);

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  state TEXT NOT NULL,
  territory_id TEXT NOT NULL,
  home_project_id TEXT NOT NULL,
  current_project_id TEXT,
  activity_source TEXT,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_agents (            -- relationships
  project_id TEXT NOT NULL,
  agent_id   TEXT NOT NULL,
  PRIMARY KEY (project_id, agent_id)
);

CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  level TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL,
  deadline DATE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS missions_project_idx ON missions (project_id);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS conversations_agent_idx ON conversations (agent_id);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  agent_id TEXT,
  text TEXT NOT NULL,
  source TEXT,
  ts TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages (conversation_id, ts);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  agent_id TEXT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  simulated BOOLEAN NOT NULL DEFAULT false,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  agent_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL,
  decided_at TIMESTAMPTZ,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  priority TEXT NOT NULL,
  read BOOLEAN NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS squads (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  active BOOLEAN NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ───────────── history projections (append-only, from events) ─────────────
CREATE TABLE IF NOT EXISTS agent_states (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  state TEXT NOT NULL,
  event_id TEXT NOT NULL,
  source TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS agent_states_agent_idx ON agent_states (agent_id, ts);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  project_id TEXT,
  mission_id TEXT,
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'active', 'completed')),
  priority TEXT NOT NULL,
  source TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS tasks_agent_idx ON tasks (agent_id);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL,
  text TEXT NOT NULL,
  event_type TEXT NOT NULL,
  agent_id TEXT,
  project_id TEXT,
  category TEXT NOT NULL,
  critical BOOLEAN NOT NULL,
  waiting_for_me BOOLEAN NOT NULL,
  completed BOOLEAN NOT NULL,
  source TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS activity_logs_ts_idx ON activity_logs (ts DESC);
