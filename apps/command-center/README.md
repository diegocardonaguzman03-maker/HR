# Francisco Command Center

A living operating system: an isometric, real-time strategy–style world where **structures are projects**, **units are AI agents** and **movement is work**. You select a unit or a building to see what is happening, open a conversation, assign missions, approve decisions, and watch the world react.

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
| `npm run gateway` | Reference WebSocket gateway for `RealAgentProvider` (see below) |

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
      └──────────────── selection / panels (uiStore) ◀── picks ── GameWorld (PixiJS) ◀── setWorld() ───┘
```

- **Event-sourced state.** Domain state changes *only* by reducing `WorldEvent`s (`src/services/worldState.ts`). The UI never mutates domain state. It dispatches `Command`s to the active provider. Every event carries `source: 'real' | 'simulated' | 'user'`.
- **Game layer is separate from the application layer.** `src/game/**` is plain TypeScript + PixiJS, with no React and no providers. It receives `WorldState` snapshots and the selection, and reports picks through callbacks. `src/components/GameCanvas.tsx` is the only bridge.
- **Agent behaviour is derived, not scripted in the renderer.** `game/agents/behavior.ts` maps state to a destination: *working/researching/reviewing/collaborating* go to the task's structure, *waiting* goes to the Citadel steps, *idle* goes home, and *blocked/paused/completed* hold position. Units walk the road graph (`services/geometry.routeBetween`), going around the Citadel and never through it.
- **Rendering (2.5D isometric, PixiJS v8).** Ground is a single static `Graphics`. Decor uses textures pre-rendered once and drawn as batched `Sprite`s. There is manual viewport culling plus level of detail (labels and small decor hide when you zoom out, territory names appear). Particles are capped (≤ 36 smoke puffs), and *Reduce motion* turns animation off.

### Code map

```
src/
  app/                 Next.js App Router entry (static export)
  components/          Shell (CommandCenter), GameCanvas bridge, ui/ design-system primitives
  game/
    world/             GameWorld (scene, input, culling), terrain + decor, iso draw helpers
    agents/            AgentUnit (unit view + movement), behavior (state → destination)
    buildings/         BuildingView (status visuals, construction), buildingArt (19 original structure types)
    camera/            Camera (pan, zoom-to-cursor, pinch, fly-to, follow, insets)
  features/            agents · projects · chat · missions · activity · command (bar, palette, NL) ·
                       citadel (Command OS) · minimap · nav · notifications · modals
  providers/           AgentProvider interface · mock/MockAgentProvider · real/RealAgentProvider
  services/            worldState (reducer) · geometry · agentRouter · projectFactory · search · actions
  store/               worldStore (domain + provider) · uiStore (selection, panels, camera)
  integrations/        Adapter contracts + /llm/claude, /llm/openai, /google-drive, /gmail, /calendar, …
  data/                Seed data: territories, projects, agents, missions, files, decisions, calendar, inbox
  types/               domain.ts (entities) · events.ts (WorldEvent + Command)
server/gateway.ts      Reference WebSocket gateway (Node, type-stripped TS)
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
- **In seed data:** add an entry in `src/data/agents.ts` (pick a `look` and a `color`; `homeProjectId` decides where the unit lives) and, if it is a real agent, add a persona in `server/gateway.ts`.

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

It works with FastAPI (`websockets`) or NestJS gateways. Persist `events` in PostgreSQL and replay them as a `snapshot` on connect. World-structure commands (projects, files, decisions, priorities) are applied immediately on the client as `source: 'user'` events and also forwarded to you to persist (`providers/real/localCommands.ts`). SSE also fits: replace the transport in `RealAgentProvider` and keep the same event shape.

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
- **Performance:** batched decor sprites, viewport culling, a capped particle count, and `computeTargets` only re-runs when agents change.
- **Responsive:** on mobile the inspector is a bottom sheet with the world visible above; chat and workspaces are full-screen; there is a tab bar; and touch picking uses larger hit radii.
- **Correctness:** client-only rendering (no hydration drift from time-relative seed data), and notifications are marked read immutably.

## Next steps (Phase 2)
PostgreSQL persistence for the event log · authentication · a real router (LLM-based `recommendAgents`) · tool use per agent through the integration adapters · a 3D spatial layer for the Digital Twin Lab (React Three Fiber, only where 3D adds value) · replay and analytics from the event log.
