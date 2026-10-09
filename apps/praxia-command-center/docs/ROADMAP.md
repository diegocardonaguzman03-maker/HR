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

## What is NOT built yet (honest)
- **Agent execution engine** (LLM provider, tool permissions, cost per task, chat with agents). Tasks are queued and the founder updates their status by hand. → Phase 2
- **Outreach** (campaigns, personalization, sequences, email OAuth sending, LinkedIn-assisted workflow) and the **Hunter** integration. → Phase 2
- **Full projects module** (milestones, tasks, risks, client workspace). Phase 1 covers margin per contract only. → Phase 2
- **Finance:** accounts payable, recurring expense schedules, bank reconciliation, CSV/XLSX exports, cash forecast beyond 30 days. → Phase 2
- **Multiple ICPs and account discovery.** → Phase 2
- **Spanish/English interface** (the UI is English; data can be in either language). → Phase 2
- **PRAXIA World:** other animation states (walking between rooms, discussing, presenting) tied to multi-agent events, chat. → Phase 3
- Marketing, Knowledge and Analytics are shown as "planned" pages with no fake controls.

## Phase 2 proposal (pending founder decision)
1. Execution engine + LLM provider (credentials entered by the founder, per-agent permissions, cost per task).
2. Outreach v1 with Hunter + email OAuth, approval of every message, suppression and stop-on-reply (prior review by RISK-01).
3. Projects v1 + finance v2 (payables, reconciliation, exports).
4. ES/EN interface.
