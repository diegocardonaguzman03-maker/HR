# Roadmap and acceptance criteria

> Note: the PRD v3.0 text the founder supplied ends in §20 "Backend". The database, security, acceptance-criteria and roadmap sections were not included. The criteria below are this team's interpretation of the founder's request ("Phase 0 and Phase 1: end-to-end vertical slice with functional navigation, persistent CRM records, financial calculations, an executive dashboard and automated tests") and of PRD §1–19. When the rest of the PRD arrives, we will reconcile against it.

## Phase 0 — Foundation ✅
| Criterion | Evidence |
|---|---|
| Next.js + TypeScript (strict) + Tailwind app with PRAXIA tokens | `src/app/globals.css`, `next.config.ts` |
| Versioned persistent schema and migrations | `src/server/db/schema.ts`, `drizzle/0000_init.sql` |
| Idempotent base seed with only configuration | `src/server/seed/base.ts` · test "seeds configuration only" |
| Founder authentication: HMAC session, attempt limit, production refuses without credentials | `src/server/auth.ts`, `src/middleware.ts` · `tests/unit/auth.test.ts` |
| Shell: collapsible sidebar with the 14 PRD modules, ⌘K palette with global search, notifications, demo mode | `src/components/shell/*` |
| Testing infrastructure (vitest + Playwright) | `vitest.config.ts`, `playwright.config.ts` |

## Phase 1 — Revenue vertical slice ✅
| Criterion | Evidence |
|---|---|
| Persistent CRM: organizations (duplicates by domain and name), contacts (provenance, lawful basis, suppression), opportunities | `src/server/services/crm.ts` · integration + e2e tests |
| Pipeline with 12 configurable stages, kanban drag-and-drop with server validation, and table view | `/crm`, `PipelineBoard.tsx` |
| Opportunity workspace (PRD §8.4) | `/crm/opportunities/[id]` |
| Proposals: lines, cost, margin, price floor, versions, founder approval, PDF via print, lifecycle draft→accepted | `/proposals/[id]`, `commercial.ts` |
| Contract with signature evidence; booking only on signature; Closed Won requires evidence | `signContract`, `moveOpportunityStage` |
| Revenue recognition capped at the contract value | `recognizeRevenue` |
| Invoices (draft/issue/void), payments (same currency, ≤ balance, not future-dated), AR and overdue | `services/finance.ts` |
| Expenses: direct vs overhead, actual vs planned, AI/API category | `/finance/expenses` |
| USD/MXN with immutable FX snapshot and "no FX" reporting | `domain/fx.ts` · test "keeps original MXN amounts" |
| Executive dashboard (PRD §5.1–5.3) with actual/forecast/estimate/goal labels | `/` · `domain/finance.ts`, `domain/pipeline.ts` |
| Decision feed (PRD §5.4) driven by records, with evidence, impact, priority, owner and direct actions | `domain/decisions.ts`, `DecisionFeed.tsx` |
| Registry of 28 agents configurable without code (instructions in `.claude/agents`), tasks, events, avatar editor | `/agents`, `/tasks` |
| PRAXIA World connected to the same database, statuses from real events, contextual panel | `/world`, `src/features/world/` |
| PRAXIA World mission control: task board, workload, live activity, priority / due date / recorded progress, reassignment, real-backlog import; animations driven only by recorded tasks and events | `/world`, `src/domain/tasks.ts`, `src/server/seed/backlog.ts` |
| Audit log of every mutation; approvals; Integrations page with real statuses | `/settings/audit`, `/approvals`, `/integrations` |
| Automated tests | 48 unit/integration + 7 e2e |

## Team reviews (October 9, 2026)
| Reviewer | Verdict | Fixed in this build |
|---|---|---|
| FIN-01 (finance) | 2 blockers, 6 major | Retainers with monthly × months and start date; MRR only for those in force; runway with real history; collected net of tax for the goal; no future dates for revenue or invoices; last30 = 1 month; zero cost blocks approval; signature can't change the approved value; cash balance relabelled as estimate |
| RISK-01 (security/privacy) | 1 critical, 3 high | Example credentials rejected; open mode only on explicit request; login backoff without trusting headers; editing an organization preserves demo flag and provenance; safe redirect; session checked on every page and on print; `is_demo` server-only; allowlist for the instructions reader; HSTS; logout audited |
| QA-01 (acceptance) | APPROVED WITH CHANGES | Cancelling an approval no longer approves; approving from the feed asks for confirmation; demo seed under its own actor with flagged audit entries; "manual" status visible; DEMO watermark on print; accessibility (labels, landmarks, contrast); restrained progress bar; demo-filtered search |

Deferred (documented in `docs/FINANCIAL_DEFINITIONS.md` and `docs/SECURITY.md`): payables, tax ledger, per-currency revaluation, session revocation, ARCO workflow, strict CSP, interface language (D-P06).

## Phase 2 — Autonomous engine, funnel and founder inbox ✅ (started October 9–10, 2026)
| Delivered | Where |
|---|---|
| Engine: `planWork` turns the funnel into agent tasks (account briefs for ICP-fit ≥ 4 accounts, 1:1 drafts only for contacts cleared under D-P07, next steps for open deals); `runEngine` executes queued tasks as the assigned agent | `src/server/engine/` |
| Providers: Anthropic API on the server (`claude-opus-5-5`, credentials by env var, cost per task in micro-USD); the viewer's own Claude (`sample`) in the published Artifact | `provider.ts`, `artifact/src/shims/engine-provider.ts` |
| Guardrails: founder-only configuration and manual runs, hard daily budget, scheduled runs off by default, every output → `waiting_approval` + inbox row, no tool that sends or publishes, contact gate re-checked at drafting time | `engine.ts`, `funnel.ts` |
| F1–F4 from DEV-03: only the founder closes work waiting for approval (send-back requeues with feedback); waiting work always has an inbox row; errors keep their cause; mirror refuses missing output files | `agents.ts`, `commercial.ts`, `artifact/mirror.mts` |
| Founder inbox: agents' decisions with A/B/C options (22 from PRX-0013), 1:1 drafts (approve → you send → mark sent), agent outputs (approve / send back) | `/approvals` |
| Funnel & progress dashboard: 11-stage account funnel with conversion and blockers, bottleneck, D-P07 pilot clearing, agent throughput, approvals SLA, engine runs and spend | `/analytics` |
| Privacy controls from RISK-01: C1 outbound blockers (lawful basis, privacy notice in force, verified email for email, suppression, opt-out), C2 assessment/residence/notice/opt-out/retention fields, C3 hashed suppression list, C4 ARCO export and erasure (redacts audit, blocks re-import), C5 retention review, C6 founder-only basis and suppression changes, C7 research labels never become the lawful basis | `src/server/services/privacy.ts`, contact page, Settings |
| QA-01 data conditions: fit on a 1–5 scale everywhere; research annotations stripped from URLs/domains; Rappi merged, repeated Coppel contact removed, DHL Express split from DHL Supply Chain; import counts pinned in the test | `importer.ts`, `artifact/mirror.mts qa-fixes` |
| Scheduled engine runs (`POST /api/engine/tick`, bearer secret, only when the founder turned them on) | `src/app/api/engine/tick/route.ts` |
| ADR-003 schema guard: the Artifact database records the schema version; an older page goes read-only and unknown columns are ignored | `artifact/src/runtime.ts` |
| Decisions sync: founder choices in the inbox → `praxia/01-equipo/registro-de-decisiones.md` | `artifact/decisions-sync.mts` |
| Outreach page with real data (drafts, approvals, sent, replies, meetings; no opens/clicks tracking) | `/outreach` |
| Tests | 90 unit/integration (engine, funnel, approvals, privacy) + 8 e2e |

## What is NOT built yet (honest)
- **Sending** of any message: there is no email/LinkedIn integration; the founder sends approved drafts and records them. Hunter/OAuth sending needs D-P07 + RISK-01's conditions.
- **Hosting the scheduler:** the endpoint exists; a cron that calls it (and the server's `ANTHROPIC_API_KEY`) must be configured where the app is deployed. D-P09 (single writer) before multi-writer sync.
- **Legal prerequisites for the first contact (RISK-01):** responsible party (legal name, address, privacy email), the privacy notice itself and a lawyer's review — inputs from the founder, not code.
- **Full projects module**, finance v2 (payables, reconciliation, exports), multiple ICPs, ES/EN interface (D-P06).
- **PRAXIA World:** other animation states (walking between rooms, discussing, presenting), chat. → Phase 3
- Marketing and Knowledge are still "planned" pages with no fake controls.
