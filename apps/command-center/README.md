# Francisco Command Center

A living operating system rendered as a **premium 3D architectural diorama**: a physical-model miniature where **buildings are projects**, **figures are AI agents** and **movement is work**. Cutaway architecture lets you see who is working, where, and on what. You select a unit or a building to see what is happening, open a conversation, assign missions, approve decisions, and watch the world react.

> **Phase 1 — functional prototype.** Everything visible works. Agent activity comes from a **simulated demo engine** (labelled `DEMO · SIMULATED ACTIVITY` / `SIMULATED` everywhere) until you connect a real provider. In live mode, agents are idle unless the backend is actually running something.

![levels](https://img.shields.io/badge/levels-World%20→%20Project%2FAgent%20→%20Workspace%2FChat-e2a54a)

---

## Run locally

```bash
cd apps/command-center
npm install
npm run dev          # http://localhost:3000  (demo engine, no backend needed)
```

Other scripts:

| Script | What it does |
|---|---|
| `npm run build` | Static export to `out/` (the MVP is fully client-side) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest: reducer, routing, router, search, factory and mock-provider scenarios |
| `npm run gateway` | WebSocket gateway for `RealAgentProvider` — PostgreSQL when `DATABASE_URL` is set (see *Persistence*) |
| `npm run db:migrate` / `db:rebuild` / `db:reset -- --yes` | Apply migrations · rebuild projection tables from the event log · drop everything (dev) |

### What to try

1. **Watch.** SCOUT crosses the map to the 3D Digital Twin Lab; FORGE works at the Academy; TALENT gets blocked (red ⚠); PRAXIS works in the Content Studio; LEDGER is idle in the Personal Sanctuary; ATLAS waits on the Citadel steps (yellow !).
2. **Click ATLAS** → panel → **OPEN CHAT** → reply “Approved”. ATLAS goes from *Waiting for input* to *Working* and walks back to the Digital Twin Lab, and FORGE joins it a few seconds later.
3. **Click the Command Citadel** → *Today* view. Or open **Ask ARIA** and type *“What requires my attention?”*, then use **TAKE ME THERE**.
4. **⌘K / Ctrl+K**: try *“Take me to Praxia”*, *“What is SCOUT doing?”*, *“Show critical projects”*, *“OJT”*.
5. **+ PROJECT (P)**: the 7-step wizard. On launch, a structure rises on a free plot, the fog over the Frontier lifts, and the agents walk there.
6. **+ CONVERSATION (N)** → *Auto select agent* → “Benchmark the best digital OJT systems in steel companies.” → **Start with recommended team**, which forms a squad.

Controls: drag or touch to pan · wheel or pinch to zoom · click or tap to select · double-click a territory to focus it · **Esc** goes back one level · **1–7** run the command bar · **H** opens the Command Center · minimap click flies the camera.

---

## Architecture

```
                 Commands (user intent)                      WorldEvents (facts)
  React UI ───────────────────────────────▶ AgentProvider ───────────────────────────▶ reduce() ──▶ WorldState
  (features/*)        dispatch(cmd)          Mock | Real          emit(event)          (pure)        (zustand)
      ▲                                                                                                │
      └──────────────── selection / panels (uiStore) ◀── picks ── DioramaWorld (Three.js) ◀ setWorld() ┘
```

- **Event-sourced state.** Domain state changes *only* by reducing `WorldEvent`s (`src/services/worldState.ts`). The UI never mutates domain state. It dispatches `Command`s to the active provider. Every event carries `source: 'real' | 'simulated' | 'user'`.
- **Game layer is separate from the application layer.** `src/game/**` is plain TypeScript + Three.js, with no React and no providers. It receives `WorldState` snapshots and the selection, and reports picks through callbacks. `src/components/GameCanvas.tsx` is the only bridge.
- **Agent behaviour is derived, not scripted in the renderer.** State maps to a place inside the architecture: *working/researching/reviewing* sit at a workstation of the task's building, *collaborating* agents move to its meeting table, *waiting* and *blocked* stay at their desk with a subtle amber/red marker (and the building shows a "needs Francisco" beacon), *idle* agents relax at home (lounge or entrance), *paused* agents hold position. Figures walk the streets: door → street → district hub → gate → bridges around the Command plaza → … → door.
- **Rendering: a 3D diorama (Three.js).** See [Visual direction](#visual-direction--premium-living-3d-diorama).

## Visual direction — premium living 3D diorama

The world reads like a physical architectural model: four territory plinths (concrete, jungle, garden and survey sand) around a round Command plaza, separated by canals and joined by bridges, with contour-layer hills, model trees, vehicles and small figures.

| Principle | Implementation (`src/game/diorama/`) |
|---|---|
| **Architecture, not sprites** | `recipes.ts` models a micro-environment for each structure type (19 types): an L&D academy with a sawtooth roof and an EAF training mock-up, a 3D Digital Twin Lab with the furnace model under a hologram, a maintenance hangar with a travelling gantry crane and forklift, a glass talent tower with interview rooms, a work-at-heights tower, a jungle strategy temple with a reflection pool, a content studio with a cyclorama, a financial observatory with a cut dome, a house with a pool, a dock with a boat, a prototype hangar with a drone, and more. `shell.ts` provides the parametric architecture: podium, stepped floor plates, columns, back walls with window bands, glass fronts and roofs. |
| **Cutaway sections** | Roofs lift away (fade) when you zoom in or select a building, and walls facing the camera dissolve as you orbit (`Building3D.setLod`). Upper floors step back, so ground-floor workspaces stay visible. |
| **Meaningful workspaces** | Each recipe registers *work*, *meeting* and *idle* spots: desks with monitors, meeting tables, a holo-table, workbenches and lounges. Agents sit, type and gather there. |
| **Activity has consequences** | Screens switch on, with live canvas content (charts, code, CAD, people, kanban, finance, map), when a building is busy. Ceiling lights glow through the glass. Collaboration moves agents to the table. Finished work (`agent.task_completed`, `file.added`) flies as a small glowing parcel to the project's sign. A waiting decision raises an amber beacon. |
| **Live micro-activity** | Haul trucks, a forklift, a gantry crane, a tram at the onboarding station, conveyor boxes, drones, a boat, a cyclist, a runner and people crossing the plaza, all slow and subtle. *Reduce motion* stops them. |
| **Look** | Matte model materials (off-white, concrete, graphite, steel, glass, timber, stone, vegetation) and restrained accents (industrial red, technology cyan, warm amber), with no neon. Soft sky light, warm sun with soft shadows that follow the area of interest, image-based reflections for glass and metal, contact-shadow pads, and distance fog for depth. |
| **Camera** | `CameraRig.ts` gives an elevated architectural view (≈38°, orbit limited to 26–57°), damped pan/zoom/orbit, zoom toward the cursor, pinch and twist on touch, and fly-to of 0.5–1.2 s (ease-in-out, with a slight cinematic pull-back on long hops). Focus is centred in the area not covered by panels. Keys: WASD/arrows to pan, Q/E to orbit, +/− to zoom. |
| **Level of detail** | *Far:* territories, project-state chips and agent beads. *Medium:* buildings, rooms and agents. *Near:* desks, screens, props, and agent name tags. |
| **Labels** | Physical signage on every building, a single floating label for the hovered or selected item (`SCOUT / Translating OJT benchmark / ● ACTIVE`), and small name tags only when close. |
| **Performance** | Static geometry is merged per building, layer and material (`kit.ts`), so a detailed building costs a few draw calls. Vegetation is instanced, screens redraw one at a time at about 8 Hz, the shadow frustum is texel-snapped, and the pixel ratio adapts if frames run long. |

### Code map

```
src/
  app/                 Next.js App Router entry (static export)
  components/          Shell (CommandCenter), GameCanvas bridge, ui/ design-system primitives
  game/
    diorama/           DioramaWorld (scene, input, routing, LOD, labels) · CameraRig · Building3D · Agent3D ·
                       recipes (19 micro-environments) · shell (parametric architecture) · props · kit (merge) ·
                       landscape (plinths, canals, paths, hills, vegetation) · life (vehicles, parcels) · screens · Overlay
    agents/            behavior (state colours and tile-space targets used by tests)
  features/            agents · projects · chat · missions · activity · command (bar, palette, NL) ·
                       citadel (Command OS) · minimap · nav · notifications · modals
  providers/           AgentProvider interface · mock/MockAgentProvider · real/RealAgentProvider
  services/            worldState (reducer) · geometry · agentRouter · projectFactory · search · actions
  store/               worldStore (domain + provider) · uiStore (selection, panels, camera)
  integrations/        Adapter contracts + /llm/claude, /llm/openai, /google-drive, /gmail, /calendar, …
  data/                Seed data: territories, projects, agents, missions, files, decisions, calendar, inbox
  types/               domain.ts (entities) · events.ts (WorldEvent + Command)
server/
  gateway.ts           WebSocket + HTTP gateway (tsx): single writer, broadcasts persisted events
  world/               WorldService (reduce → persist → broadcast) · AgentRuntime (LLM work) · handleCommand
  persistence/         EventStore port · PostgresEventStore · MemoryEventStore · projections · migrations · cli
```

Design-system components: `AgentPanel`, `ProjectPanel`, `ChatPanel`, `MissionCard`, `ActivityEvent`, `NotificationList`/`Toasts`, `CommandPalette`, `StatusIndicator`, `MiniMap`, `BottomCommandBar`, `CreateProjectModal`, `CreateConversationModal`, plus `Btn`, `IconBtn`, `Tabs`, `Progress`, `AgentAvatar` and `Modal`.

---

## Data model

The types in `src/types/domain.ts` map 1:1 to the suggested PostgreSQL tables:

| Entity | Key fields |
|---|---|
| `territories` | id, name, polygon (tile space), hub, palette, free plots |
| `projects` | territory, building type, **tile coordinates**, size, status, priority, progress, agents, missions, files, decisions, dependencies, KPIs |
| `missions` | project, code, level (mission/objective/sub-mission/milestone/critical), status, agents, dependsOn, progress, deadline, outputs |
| `agents` | identity, look, role, skills, tools, home building, state, current task, task queue, conversations, collaborators, memory, activitySource, position, performance |
| `squads` | objective, project, members, dependencies, discussion, outputs |
| `conversations` / `messages` | user → project → agent → conversation; messages carry attachments, actions, source |
| `files`, `decisions`, `notifications`, `calendar`, `inbox` | as named |
| `events` | append-only `WorldEvent` log (history, replay, audit, analytics) |
| `activity` | feed items derived from events (category, critical, waiting-for-me, completed) |

## Agent event system

`src/types/events.ts`:

| Event | World reaction |
|---|---|
| `agent.task_started` | The unit leaves its building and walks to the project; the state ring changes colour |
| `agent.task_progress` | Progress bars update and the building's activity pips pulse |
| `agent.task_completed` | A ✓ appears over the unit, the feed updates and the project progresses |
| `agent.waiting_for_user` | The unit walks to the Citadel steps and shows a yellow **!**; the building gets a badge and the counter in the top bar increases |
| `agent.blocked` | The unit stops and a red ⚠ appears (high-priority toast) |
| `agent.paused` / `resumed` | The unit dims and holds position / resumes |
| `squad.formed` / `disbanded` | Members gather at one structure and are linked by purple lines |
| `project.created` → `construction_finished` | The building rises with scaffolding; Frontier fog lifts |
| `message.sent`, `file.added`, `decision.requested/made`, `mission.*`, `notification.created` | Chat, files, decisions, missions and notifications update |

Commands (UI → provider): `chat.send`, `conversation.start`, `team.start`, `agent.assign_task`, `agent.pause|resume|move|create`, `project.create|archive|set_priority|set_status`, `decision.resolve`, `squad.form`, `deliverable.create`, `file.add`.

---

## How to…

### Create agents
- **At runtime:** Agents → *Create agent* (or ⌘K → “Create agent”). This dispatches `agent.create`.
- **In seed data:** add an entry in `src/data/agents.ts` (pick a `look` and a `color`; `homeProjectId` decides where the unit lives) and, if it is a real agent, add a persona in `server/world/AgentRuntime.ts`.

### Create territories
Add a `Territory` to `src/data/territories.ts` (polygon, center, hub, palette, free plots). Add its gate to `GATES` and `GATE_RING`, extend `territoryAt()`, and add decor in `game/world/terrain.ts → buildDecor`.

### Create projects
- **At runtime:** + PROJECT (7 steps). `services/projectFactory.ts` picks the structure type (Research → Laboratory, Training → Academy, Technology → Tech Lab, Recruiting → Talent Tower, Transformation → Command Center, Analytics → Data Observatory, Strategy → Strategy Temple, Personal → Outpost, Praxia → Innovation Studio, Experimental → Prototype Hangar) and a free plot.
- **In seed data:** add to `src/data/projects.ts` with a `tile` that is clear of other structures.

### Connect a real AI provider
1. `export ANTHROPIC_API_KEY=…` (or `OPENAI_API_KEY`; optionally `AGENT_MODEL`). The Claude adapter (`src/integrations/llm/claude.ts`) uses the official `@anthropic-ai/sdk`, defaults to `claude-opus-5-5`, and enables server-side refusal fallbacks.
2. `npm run gateway`, which starts `ws://localhost:8787`.
3. In the app: **Settings → Live gateway** (or set `NEXT_PUBLIC_AGENT_PROVIDER=real` and `NEXT_PUBLIC_AGENT_WS_URL`, see `.env.example`).

Now chat messages and assigned missions are executed by the LLM. The unit shows *Working* only while a request is in flight, then returns to *Idle*. With no key, the gateway answers honestly that no provider is configured, and every agent stays idle.

### Connect WebSockets (your own backend)
Implement the protocol in `providers/real/RealAgentProvider.ts`:

```jsonc
// client → server
{ "kind": "command", "command": { "type": "chat.send", "conversationId": "…", "agentId": "scout", "text": "…" } }
// server → client
{ "kind": "event", "event": { "id": "…", "ts": 1730000000000, "source": "real", "type": "agent.task_started", "payload": { … } } }
{ "kind": "snapshot", "events": [ … ] }   // optional, on connect
```

On connect the gateway sends `{ kind: 'hello', persistence }` and `{ kind: 'state', state, seq }` (the persisted world), then streams events. The gateway is the **single writer**: the client never applies commands locally; world-structure commands (projects, files, decisions, priorities, pause/resume, notifications read) are turned into `source: 'user'` events server-side by `src/services/structuralCommands.ts`. The same protocol can be served by FastAPI or NestJS; SSE also fits — replace the transport in `RealAgentProvider` and keep the event shape.

### Replace mock agents with real agents
Both providers implement the same `AgentProvider` interface (`start`, `stop`, `dispatch`), so the UI does not change. To migrate one capability at a time:
1. Make the backend emit the same `WorldEvent`s for that capability (e.g. `agent.task_started` → `task_progress` → `task_completed`).
2. Switch the provider (Settings, or `NEXT_PUBLIC_AGENT_PROVIDER=real`). Switching resets the world so simulated and real activity never mix.
3. Remove the matching behaviour from `providers/mock/library.ts` once it is real.

### Integrations
`src/integrations/types.ts` defines vendor-neutral contracts (`LLMAdapter`, `StorageAdapter`, `MailAdapter`, `CalendarAdapter`, `ChatPlatformAdapter`). Adapters live in `/integrations/<id>`: Claude and OpenAI are implemented; Google Drive, Gmail, Calendar, Microsoft 365, Slack, Notion, GitHub and OneDrive are typed stubs. Secrets stay in the gateway and never reach the browser.

---

## Real vs simulated: the rules
- Every event and message carries a `source`. Simulated work is labelled in the top bar, in panels (`SIMULATED`), in chat bubbles and in the feed (`◦sim`).
- `MockAgentProvider` never touches a paused agent, and it leaves idle agents (LEDGER) idle until you assign work.
- `RealAgentProvider` marks every agent idle while disconnected and only reflects backend events.
- Seed KPIs, calendar and inbox are labelled as seed data until an integration feeds them.

## Critical review: what was improved after the first build
- **Camera:** focus targets are centred in the *unobstructed* area (panel insets), a selected moving agent is followed gently, fly-to zooms geometrically, and fling has inertia.
- **Agent movement:** route detours via district hubs removed; units walk around the Citadel on a gate ring; waiting agents line up on its front steps.
- **Visual hierarchy:** larger units, labels shown by zoom level, territory names at world zoom, lighter Frontier fog, and status beacons only for blocked, critical, completed and waiting.
- **Performance:** merged architecture, instanced vegetation, adaptive pixel ratio, and agent targets only re-computed when agents change.
- **Responsive:** on mobile the inspector is a bottom sheet with the world visible above; chat and workspaces are full-screen; there is a tab bar; and touch picking uses larger hit radii.
- **Correctness:** client-only rendering (no hydration drift from time-relative seed data), and notifications are marked read immutably.

## Persistence (Phase 2) — PostgreSQL, event-sourced

```
command ─▶ handleCommand ─▶ events ─▶ WorldService ──reduce──▶ state
                                          │
                                          └─ one transaction: INSERT events + UPDATE projections
                                                              │
                                                              └─▶ broadcast to every client
```

- **Source of truth:** the append-only `events` table (`seq`, `id`, `ts`, `type`, `source`, `payload jsonb`) plus periodic `snapshots` (every `SNAPSHOT_EVERY` events, and on graceful shutdown).
- **Recovery:** on boot the gateway loads the latest snapshot and replays the newer events through the same pure reducer the browser uses. Work cannot survive a restart, so any agent that looked busy is set **idle** with an explicit event — the world stays honest.
- **Projections (queryable SQL):** `territories`, `projects`, `agents`, `project_agents`, `missions`, `conversations`, `messages`, `files`, `decisions`, `notifications`, `squads` (latest state, typed columns + `data jsonb`) and append-only history `agent_states`, `tasks`, `activity_logs`. They are written in the same transaction as the events, never directly by app code, and can be rebuilt any time with `npm run db:rebuild`.
- **Atomicity:** a failed append rolls back the whole commit; the in-memory world is only advanced after the commit succeeds.
- **Audit/replay over HTTP:** `GET /health`, `GET /api/events?after=<seq>&limit=<n>`.
- **No database?** Without `DATABASE_URL` the gateway uses `MemoryEventStore` (same code path, not durable) and says so in the log.

### Run it

```bash
docker compose up -d                                   # or any PostgreSQL 14+
export DATABASE_URL=postgres://fcc:fcc@localhost:5432/fcc
npm run db:migrate                                     # also runs automatically on gateway start
npm run gateway                                        # first start seeds the world (agents idle)
npm run dev                                            # Settings → Live gateway
```

Useful queries:

```sql
SELECT type, source, ts FROM events ORDER BY seq DESC LIMIT 20;           -- what happened
SELECT agent_id, state, ts FROM agent_states ORDER BY ts DESC LIMIT 20;   -- agent timelines
SELECT name, status, priority, progress FROM projects ORDER BY priority;  -- portfolio
SELECT title, status, completed_at FROM tasks WHERE agent_id = 'scout';   -- real work done
```

Tests: `npm test` runs projection and recovery tests in memory; set `TEST_DATABASE_URL` (a throw-away database — the test drops its tables) to also run the PostgreSQL integration suite.

Demo mode (`MockAgentProvider`) is intentionally **not** persisted: simulated activity never reaches the database.

## Next steps
Authentication (before exposing the gateway) · multi-agent squads and agent tool use through the integration adapters on the live gateway · LLM-based router for `recommendAgents` · file content storage (object storage; today only metadata) · a 3D spatial layer for the Digital Twin Lab · analytics and replay UI over the event log.
