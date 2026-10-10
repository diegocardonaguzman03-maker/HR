# PRAXIA AI Organization — Complete Agent Team v1.0

**Purpose:** A founder-led, multi-agent operating system for PRAXIA that emulates a cross-functional boutique advisory company rather than a simple chatbot. This is a **deployable specification**, not a claim that autonomous agents, CRM, email, support or code execution have already been connected.

**Scope:** 28 specialist roles across executive office, research, sales, marketing, PR, transformation delivery, product/engineering, UX, UI, design, operations, finance, HR, internal communications, customer success, measurement and governance.

## Getting started
1. Load `knowledge/PRAXIA_MASTER_CONTEXT.md` as the primary business knowledge source.
2. Load `governance/AGENT_CONSTITUTION.md`, `governance/RACI.md` and `knowledge/BRAND_RULES.md` into every agent's common instructions.
3. Instantiate `agents/*.md` as specialist system/skill instructions. The `name` and `description` metadata enable skill discovery.
4. Assign CEO-01 as orchestrator, but route tasks to the named owner with required gate reviewers; never let an agent approve its own final public release.
5. Use `templates/AGENT_TASK.json` for requests, `config/handoff.schema.json` for exchanges and `workflows/*.md` for orchestration.
6. Add approved tools/permissions gradually; start read-only with human sign-off for all external actions.
7. Evaluate output correctness, brand accuracy and routing before using with real customer data.

## Departments & agent directory
| ID | Function | Role | Reports to |
|---|---|---|---|
| CEO-01 | Executive Office | Chief of Staff & CEO Strategist | Founder |
| STR-01 | Strategy | Strategy & Market Intelligence Lead | CEO-01 |
| RES-01 | Research & Insights | Research Director | STR-01 |
| RES-02 | Research & Insights | Competitive Intelligence Analyst | RES-01 |
| SAL-01 | Sales & Growth | Chief Revenue Officer | CEO-01 |
| SAL-02 | Sales & Growth | Account Research & Prospecting | SAL-01 |
| SAL-03 | Sales & Growth | Solutions Consultant & Proposal Lead | SAL-01 |
| MKT-01 | Marketing | Chief Marketing & Brand Officer | CEO-01 |
| MKT-02 | Marketing | Executive Thought Leadership Editor | MKT-01 |
| MKT-03 | Marketing | Growth & Performance Analyst | MKT-01 |
| PR-01 | PR & External Relations | Public Relations & Partnerships Lead | CEO-01 |
| DEL-01 | Client Delivery | Chief Delivery & Transformation Officer | CEO-01 |
| DEL-02 | Client Delivery | Adoption & Change Principal | DEL-01 |
| DEL-03 | Client Delivery | AI Adoption & Capability Consultant | DEL-01 |
| DEV-01 | Product & Development | Head of Product & Engineering | CEO-01 |
| DEV-02 | Product & Development | Full-Stack Engineer | DEV-01 |
| DEV-03 | Product & Development | AI Systems & Automation Engineer | DEV-01 |
| UX-01 | Experience | Head of UX Research & Service Design | DEV-01 |
| UI-01 | Experience | Product UI & Design Systems Lead | UX-01 |
| DSN-01 | Creative Studio | Creative Director & Brand Designer | MKT-01 |
| OPS-01 | Operations | Chief Operating Officer | CEO-01 |
| FIN-01 | Operations | Finance & Commercial Operations | OPS-01 |
| HR-01 | People | People & Talent Director | OPS-01 |
| COM-01 | People & Communications | Internal Communications & Knowledge Lead | OPS-01 |
| CX-01 | Customer Experience | Client Success & Customer Support Lead | DEL-01 |
| DAT-01 | Data & Measurement | Data, Impact & Evaluation Lead | CEO-01 |
| RISK-01 | Governance | Legal, Privacy & Risk Advisor | CEO-01 |
| QA-01 | Governance | Quality Assurance & Knowledge Auditor | CEO-01 |

## Shared org-wide performance scorecard (proposed)
Sales: ICP-qualified opportunities, discovery-to-proposal, win rate, signed bookings, expected gross margin, sales cycle. Marketing: quality executive engagement, qualified conversations, pipeline influence, content consistency. Delivery: adoption behavior observed, client-approved value metrics, milestone reliability, CSAT. Product: activation, task completion, accessibility and incident rate. Support: time to first useful response, resolution quality and repeat issues. Operations: utilization/capacity, cash runway, forecast reliability, project contribution margin. Research: evidence coverage, reproducibility and review defects. People: capacity, skills coverage, onboarding time. Never present targets without baseline.

## Evidence taxonomy
- DEFINED: in founder instruction or official brand manual.
- WORKED: previous discussions / explored planning.
- PROPOSED: new architecture, suggested roles and metrics, not yet signed off.
- PENDING: unknown, needs human or client input.

## Source of truth
Brand Guidelines v1.0 (2026), and the existing consolidated PRAXIA Master Business, Brand & Operating System (Oct 9, 2026). This package copies the master context without asserting unverified external facts.

## Important gaps before live operations
No confirmed employee roster, real CRM, connected customer support, client dataset, budget, vendor permissions, validated Adoption Gap Index algorithm, ownership registration, legal structure or production infrastructure in the supplied source. These require explicit setup, permissions and validation.
