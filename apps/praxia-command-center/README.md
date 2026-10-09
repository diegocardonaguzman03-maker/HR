# PRAXIA Command Center

> *Turn strategy into adoption.* The operating system PRAXIA uses to run the business: from the target account to cash collected. Built according to PRD v3.0.

**Status:** Phase 0 (foundation) and Phase 1 (end-to-end revenue slice) delivered and reviewed by FIN-01, RISK-01 and QA-01 (their findings were fixed; pending items are in `docs/ROADMAP.md`). See `docs/ROADMAP.md` for what works, what doesn't yet, and the acceptance criteria.

## Principles that the code enforces
- **No invented data.** The base seed only creates configuration: 28 agents, 12 stages, 7 editable services and settings. An empty company shows zeros or "—" with an explanation.
- **Demo data is explicit.** `npm run db:seed:demo` loads fictional records marked `is_demo`. They are hidden from all metrics unless "Demo data" is turned on. When it is on, the app shows a banner and labels every demo record.
- **Every figure says what it is:** Actual, Forecast, Estimate or Goal. The USD 10,000/month goal is a goal, not revenue.
- **Truthful agent status.** Statuses come only from recorded task events. There is no execution engine yet, so idle agents show as *offline*.
- **Nothing is sent outward.** There are no sending integrations. Activities are manual records of things the founder already did. Outbound activity to a contact marked "do not contact" is blocked.
- **Commercial evidence.** "Closed Won" requires a signed contract with evidence or an accepted proposal with evidence. A contract only counts as a booking after its signature is recorded. Proposal pricing requires founder approval before it can be marked as sent.
- **Multi-currency without rewriting history.** Each amount keeps its original currency. A record gets an FX snapshot (rate, source, date) when it is created or issued. If no rate exists, the record is reported as "no FX" and is never counted as zero.
- **Audit.** Every mutation is written to `audit_log` with actor, action, and the record before and after.

## Run locally
```bash
cd apps/praxia-command-center
npm install
cp .env.example .env.local      # set PRAXIA_ADMIN_PASSWORD and PRAXIA_SESSION_SECRET (≥32 chars)
npm run db:seed                  # migrations + base configuration
npm run db:seed:demo             # optional: labelled fictional data
npm run dev                      # http://localhost:3100
```
Without credentials the app requires login and does not serve data. For local development only, `PRAXIA_DEV_OPEN=1` enables a no-login mode (with a "DEV MODE" badge; `npm run dev` binds to 127.0.0.1). The example values in `.env.example` are rejected on purpose. See `docs/SECURITY.md`.

## Tests
```bash
npm run typecheck
npm test                        # 54 unit + integration tests (in-memory SQLite)
PW_CHROMIUM_PATH=/path/to/chromium npm run test:e2e   # 7 Playwright end-to-end tests (production build, fresh DB)
```
The e2e test covers: login → empty dashboard → organization (with duplicate detection) → contact → opportunity → stage validation → proposal with margin → founder approval → sent → acceptance with evidence → signature → revenue recognition → invoice → payment → dashboard figures → agent task → PRAXIA World → audit log.

## Architecture
| Layer | Location | Notes |
|---|---|---|
| Pure business logic | `src/domain/` | Finance, pipeline, FX, decision feed. No I/O; unit tested |
| Data model | `src/server/db/schema.ts` · `drizzle/` | Drizzle ORM on libsql (SQLite file locally; Turso/libsql in the cloud) |
| Services (rules + audit) | `src/server/services/` | All writes go through here; zod validation; `BusinessRuleError` |
| Server actions | `src/app/actions/` | Each one re-checks the founder session (`requireFounder`) |
| UI | `src/app/(app)/**`, `src/components/**` | Next.js 15 App Router, Server Components, Tailwind v4 with PRAXIA tokens |
| PRAXIA World | `src/features/world/` | PixiJS 8 isometric HQ, procedural art, statuses from real events (built by DEV-02) |
| Seeds | `src/server/seed/` | `base.ts` (configuration), `demo.ts` (marked fiction), `agents.json` (28 roles) |

Deviations from the recommended PRD stack: TanStack Query is not used yet (Server Components + server actions cover reads; it will be added with live events in Phase 2). shadcn/ui is replaced by our own components on Radix (Dialog) and cmdk, to follow the PRAXIA design system exactly.
