/**
 * PRAXIA Command Center — persistent data model (SQLite / libsql via Drizzle).
 *
 * Conventions
 * - Money is stored as integer minor units (cents) in its ORIGINAL currency. Originals are never overwritten.
 * - Monetary records that need reporting carry an FX snapshot (rate, source, rate date, reporting currency,
 *   reporting amount). If no rate existed when the record was created, the snapshot is null and the record is
 *   reported as "missing FX" instead of being silently converted.
 * - Business dates are ISO `YYYY-MM-DD` strings; timestamps are ISO-8601 strings.
 * - `isDemo` marks explicitly identified demonstration data. Demo rows are excluded from every metric unless the
 *   founder turns on demo mode, and the UI labels them.
 */
import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);
const updatedAt = () => text("updated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);
const isDemo = () => integer("is_demo", { mode: "boolean" }).notNull().default(false);

export const CURRENCIES = ["USD", "MXN"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** FX snapshot columns shared by monetary records. */
const fxSnapshot = () => ({
  fxRate: real("fx_rate"),
  fxSource: text("fx_source"),
  fxRateDate: text("fx_rate_date"),
  reportingCurrency: text("reporting_currency"),
  reportingAmount: integer("reporting_amount"),
});

// ───────────────────────────── Company configuration ─────────────────────────────

export const companySettings = sqliteTable("company_settings", {
  id: integer("id").primaryKey(), // singleton row id = 1
  companyName: text("company_name").notNull().default("PRAXIA"),
  reportingCurrency: text("reporting_currency").$type<Currency>().notNull().default("USD"),
  /** Founder-declared opening cash. Null = not declared yet (cash KPIs show "not configured"). */
  openingCashAmount: integer("opening_cash_amount"),
  openingCashCurrency: text("opening_cash_currency").$type<Currency>(),
  openingCashDate: text("opening_cash_date"),
  /** Goal, not revenue. Default USD 10,000/month comes from the founder's stated ambition. */
  monthlyRevenueTarget: integer("monthly_revenue_target").notNull().default(1_000_000),
  monthlyRevenueTargetCurrency: text("monthly_revenue_target_currency").$type<Currency>().notNull().default("USD"),
  /** Which revenue measure the target is compared against (open decision in the skill §16). */
  targetBasis: text("target_basis").$type<"recognized" | "collected" | "contracted">().notNull().default("recognized"),
  defaultTaxRate: real("default_tax_rate").notNull().default(0.16),
  updatedAt: updatedAt(),
});

export const fxRates = sqliteTable(
  "fx_rates",
  {
    id: id(),
    base: text("base").$type<Currency>().notNull(),
    quote: text("quote").$type<Currency>().notNull(),
    /** 1 unit of base = rate units of quote. */
    rate: real("rate").notNull(),
    source: text("source").notNull(),
    rateDate: text("rate_date").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("fx_pair_date").on(t.base, t.quote, t.rateDate)],
);

export const services = sqliteTable("services", {
  id: id(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  pricingModel: text("pricing_model").$type<"fixed" | "milestone" | "retainer">().notNull().default("fixed"),
  priceMin: integer("price_min"),
  priceMax: integer("price_max"),
  currency: text("currency").$type<Currency>().notNull().default("USD"),
  typicalWeeks: text("typical_weeks"),
  /** Pricing is exploratory until the founder validates it. */
  pricingStatus: text("pricing_status").$type<"proposed" | "validated">().notNull().default("proposed"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const pipelineStages = sqliteTable("pipeline_stages", {
  id: id(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  defaultProbability: real("default_probability").notNull(),
  kind: text("kind").$type<"open" | "won" | "lost">().notNull().default("open"),
  /** Moving into this stage requires these opportunity fields (validation). */
  requiredFields: text("required_fields", { mode: "json" }).$type<string[]>().notNull().default([]),
});

// ───────────────────────────── CRM ─────────────────────────────

export const organizations = sqliteTable(
  "organizations",
  {
    id: id(),
    name: text("name").notNull(),
    domain: text("domain"),
    website: text("website"),
    industry: text("industry"),
    country: text("country"),
    sizeBand: text("size_band"),
    revenueBand: text("revenue_band"),
    linkedinUrl: text("linkedin_url"),
    lifecycle: text("lifecycle").$type<"target" | "prospect" | "client" | "former_client" | "partner">().notNull().default("target"),
    fitScore: integer("fit_score"),
    notes: text("notes").notNull().default(""),
    /** Provenance for externally sourced facts. */
    source: text("source").notNull().default("manual"),
    sourceRetrievedAt: text("source_retrieved_at"),
    isDemo: isDemo(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("org_domain_unique").on(t.domain)],
);

export const contacts = sqliteTable(
  "contacts",
  {
    id: id(),
    organizationId: text("organization_id").references(() => organizations.id, { onDelete: "set null" }),
    fullName: text("full_name").notNull(),
    title: text("title"),
    email: text("email"),
    emailStatus: text("email_status").$type<"unverified" | "valid" | "invalid" | "risky" | "unknown">().notNull().default("unverified"),
    linkedinUrl: text("linkedin_url"),
    geography: text("geography"),
    source: text("source").notNull().default("manual"),
    sourceRetrievedAt: text("source_retrieved_at"),
    lawfulBasis: text("lawful_basis").$type<"consent" | "legitimate_interest" | "existing_relationship" | "not_assessed">().notNull().default("not_assessed"),
    leadStatus: text("lead_status").$type<"new" | "researched" | "contacted" | "engaged" | "qualified" | "disqualified">().notNull().default("new"),
    leadScore: integer("lead_score"),
    ownerAgentId: text("owner_agent_id"),
    doNotContact: integer("do_not_contact", { mode: "boolean" }).notNull().default(false),
    notes: text("notes").notNull().default(""),
    isDemo: isDemo(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("contact_org").on(t.organizationId), uniqueIndex("contact_email_unique").on(t.email)],
);

export const opportunities = sqliteTable(
  "opportunities",
  {
    id: id(),
    organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    primaryContactId: text("primary_contact_id").references(() => contacts.id, { onDelete: "set null" }),
    serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
    stageId: text("stage_id").notNull().references(() => pipelineStages.id),
    title: text("title").notNull(),
    problemStatement: text("problem_statement").notNull().default(""),
    proposedSolution: text("proposed_solution").notNull().default(""),
    amount: integer("amount"),
    currency: text("currency").$type<Currency>().notNull().default("USD"),
    /** Null = use the stage default probability. */
    probabilityOverride: real("probability_override"),
    expectedCloseDate: text("expected_close_date"),
    nextAction: text("next_action"),
    nextActionDate: text("next_action_date"),
    ownerAgentId: text("owner_agent_id"),
    risks: text("risks").notNull().default(""),
    lostReason: text("lost_reason"),
    /** Highest stage position ever reached (drives stage-conversion funnel, kept when an opportunity is lost). */
    maxStagePosition: integer("max_stage_position").notNull().default(1),
    stageEnteredAt: text("stage_entered_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
    closedAt: text("closed_at"),
    isDemo: isDemo(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("opp_stage").on(t.stageId), index("opp_org").on(t.organizationId)],
);

export const ACTIVITY_TYPES = ["note", "call", "email", "linkedin", "meeting", "task", "stage_change", "system"] as const;
export const activities = sqliteTable(
  "activities",
  {
    id: id(),
    type: text("type").$type<(typeof ACTIVITY_TYPES)[number]>().notNull(),
    direction: text("direction").$type<"outbound" | "inbound" | "internal">().notNull().default("internal"),
    subject: text("subject").notNull(),
    body: text("body").notNull().default(""),
    occurredAt: text("occurred_at").notNull(),
    organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    contactId: text("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    opportunityId: text("opportunity_id").references(() => opportunities.id, { onDelete: "cascade" }),
    /** "founder", "system" or an agent id such as "SAL-03". */
    actor: text("actor").notNull().default("founder"),
    /** Manual log entries are records of something the founder did outside the system — never automated sends. */
    recordedManually: integer("recorded_manually", { mode: "boolean" }).notNull().default(true),
    isDemo: isDemo(),
    createdAt: createdAt(),
  },
  (t) => [index("act_opp").on(t.opportunityId), index("act_org").on(t.organizationId)],
);

// ───────────────────────────── Proposals & contracts ─────────────────────────────

export const PROPOSAL_STATUSES = ["draft", "internal_review", "approved", "sent", "negotiation", "accepted", "rejected", "expired"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const proposals = sqliteTable("proposals", {
  id: id(),
  opportunityId: text("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  currency: text("currency").$type<Currency>().notNull().default("USD"),
  status: text("status").$type<ProposalStatus>().notNull().default("draft"),
  taxRate: real("tax_rate").notNull().default(0.16),
  validUntil: text("valid_until"),
  /** Set when the founder approves pricing through the approval workflow. */
  approvedAt: text("approved_at"),
  sentAt: text("sent_at"),
  decidedAt: text("decided_at"),
  /** Required evidence when marking accepted (e.g. signed PDF reference, e-signature envelope id). */
  acceptanceEvidence: text("acceptance_evidence"),
  isDemo: isDemo(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const proposalLines = sqliteTable("proposal_lines", {
  id: id(),
  proposalId: text("proposal_id").notNull().references(() => proposals.id, { onDelete: "cascade" }),
  serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  milestone: text("milestone"),
  quantity: real("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(),
  /** Estimated direct delivery cost for this line (associates, tools, travel). */
  estimatedCost: integer("estimated_cost").notNull().default(0),
  position: integer("position").notNull().default(0),
});

export const contracts = sqliteTable("contracts", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  opportunityId: text("opportunity_id").references(() => opportunities.id, { onDelete: "set null" }),
  proposalId: text("proposal_id").references(() => proposals.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  kind: text("kind").$type<"project" | "retainer">().notNull().default("project"),
  currency: text("currency").$type<Currency>().notNull(),
  /** Total contract value (project) — for retainers: monthlyAmount × committed months. */
  totalAmount: integer("total_amount").notNull(),
  monthlyAmount: integer("monthly_amount"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  status: text("status").$type<"pending_signature" | "signed" | "active" | "completed" | "terminated">().notNull().default("pending_signature"),
  /** A contract only counts as a booking once signedAt and signatureEvidence are recorded. */
  signedAt: text("signed_at"),
  signatureEvidence: text("signature_evidence"),
  ...fxSnapshot(),
  isDemo: isDemo(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Revenue recognized for a contract in a period (milestone delivered, retainer month served, or manual). */
export const revenueEntries = sqliteTable("revenue_entries", {
  id: id(),
  contractId: text("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  recognizedOn: text("recognized_on").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").$type<Currency>().notNull(),
  basis: text("basis").$type<"milestone" | "retainer_month" | "manual">().notNull(),
  description: text("description").notNull().default(""),
  ...fxSnapshot(),
  isDemo: isDemo(),
  createdAt: createdAt(),
});

// ───────────────────────────── Finance ─────────────────────────────

export const invoices = sqliteTable("invoices", {
  id: id(),
  number: text("number").notNull().unique(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  contractId: text("contract_id").references(() => contracts.id, { onDelete: "set null" }),
  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),
  currency: text("currency").$type<Currency>().notNull(),
  subtotal: integer("subtotal").notNull(),
  taxRate: real("tax_rate").notNull().default(0),
  tax: integer("tax").notNull(),
  total: integer("total").notNull(),
  status: text("status").$type<"draft" | "issued" | "void">().notNull().default("draft"),
  notes: text("notes").notNull().default(""),
  ...fxSnapshot(),
  isDemo: isDemo(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const payments = sqliteTable("payments", {
  id: id(),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  receivedOn: text("received_on").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").$type<Currency>().notNull(),
  method: text("method").notNull().default("transfer"),
  reference: text("reference").notNull().default(""),
  ...fxSnapshot(),
  isDemo: isDemo(),
  createdAt: createdAt(),
});

export const EXPENSE_CATEGORIES = [
  "contractors",
  "ai_api",
  "saas",
  "hosting",
  "marketing",
  "travel",
  "legal_accounting",
  "office",
  "other",
] as const;
export const expenses = sqliteTable("expenses", {
  id: id(),
  incurredOn: text("incurred_on").notNull(),
  vendor: text("vendor").notNull(),
  category: text("category").$type<(typeof EXPENSE_CATEGORIES)[number]>().notNull(),
  description: text("description").notNull().default(""),
  amount: integer("amount").notNull(),
  currency: text("currency").$type<Currency>().notNull(),
  /** Direct delivery cost (attributable to a contract) vs overhead. */
  costType: text("cost_type").$type<"direct" | "overhead">().notNull().default("overhead"),
  contractId: text("contract_id").references(() => contracts.id, { onDelete: "set null" }),
  recurrence: text("recurrence").$type<"none" | "monthly" | "annual">().notNull().default("none"),
  /** actual = money spent; planned = projected expense used only in forecasts. */
  status: text("status").$type<"actual" | "planned">().notNull().default("actual"),
  ...fxSnapshot(),
  isDemo: isDemo(),
  createdAt: createdAt(),
});

// ───────────────────────────── AI organization ─────────────────────────────

export const AGENT_STATUSES = ["available", "working", "waiting_input", "waiting_approval", "completed", "error", "offline"] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(), // e.g. "SAL-03"
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  team: text("team").notNull(),
  reportsTo: text("reports_to").notNull(),
  description: text("description").notNull(),
  /** Path to the instruction file (source of truth for the agent's system instructions). */
  instructionsPath: text("instructions_path").notNull(),
  skills: text("skills", { mode: "json" }).$type<string[]>().notNull().default([]),
  allowedTools: text("allowed_tools", { mode: "json" }).$type<string[]>().notNull().default([]),
  dataAccessPolicy: text("data_access_policy").notNull().default("internal-read"),
  modelConfig: text("model_config", { mode: "json" }).$type<{ provider: string | null; model: string | null }>().notNull().default({ provider: null, model: null }),
  escalationRules: text("escalation_rules").notNull().default("Escalate strategy/financial decisions to CEO-01 and the founder."),
  avatar: text("avatar", { mode: "json" }).$type<AvatarConfig>().notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type AvatarConfig = {
  bodyType: "a" | "b" | "c";
  skinTone: string;
  hairStyle: "short" | "long" | "bun" | "buzz" | "curly";
  hairColor: string;
  outfitColor: string;
  accessory: "none" | "glasses" | "headset" | "badge";
};

export const TASK_STATUSES = ["queued", "working", "waiting_input", "waiting_approval", "completed", "error", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const agentTasks = sqliteTable(
  "agent_tasks",
  {
    id: id(),
    agentId: text("agent_id").notNull().references(() => agents.id),
    title: text("title").notNull(),
    instructions: text("instructions").notNull().default(""),
    status: text("status").$type<TaskStatus>().notNull().default("queued"),
    origin: text("origin").$type<"founder" | "decision_feed" | "orchestrator">().notNull().default("founder"),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    output: text("output"),
    errorMessage: text("error_message"),
    costUsdMicros: integer("cost_usd_micros").notNull().default(0),
    startedAt: text("started_at"),
    completedAt: text("completed_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("task_agent").on(t.agentId), index("task_status").on(t.status)],
);

/** Execution event stream (drives agent status and PRAXIA World). Only real events are written here. */
export const agentEvents = sqliteTable(
  "agent_events",
  {
    id: id(),
    agentId: text("agent_id").notNull().references(() => agents.id),
    taskId: text("task_id").references(() => agentTasks.id, { onDelete: "set null" }),
    type: text("type").$type<"task_queued" | "task_started" | "task_waiting_input" | "task_waiting_approval" | "task_completed" | "task_failed" | "task_cancelled">().notNull(),
    message: text("message").notNull().default(""),
    at: text("at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  },
  (t) => [index("event_agent_at").on(t.agentId, t.at)],
);

// ───────────────────────────── Governance ─────────────────────────────

export const approvals = sqliteTable(
  "approvals",
  {
    id: id(),
    kind: text("kind").$type<"proposal_pricing" | "outbound_message" | "contract" | "expense" | "agent_output">().notNull(),
    title: text("title").notNull(),
    detail: text("detail").notNull().default(""),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    requestedBy: text("requested_by").notNull().default("system"),
    status: text("status").$type<"pending" | "approved" | "rejected">().notNull().default("pending"),
    decisionNote: text("decision_note"),
    decidedAt: text("decided_at"),
    isDemo: isDemo(),
    createdAt: createdAt(),
  },
  (t) => [index("approval_status").on(t.status)],
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: id(),
    at: text("at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    before: text("before", { mode: "json" }),
    after: text("after", { mode: "json" }),
  },
  (t) => [index("audit_entity").on(t.entityType, t.entityId)],
);
