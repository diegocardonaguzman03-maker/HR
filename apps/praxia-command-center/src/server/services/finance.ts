import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "../db/client";
import { companySettings, contracts, expenses, fxRates, invoices, payments, revenueEntries, CURRENCIES, EXPENSE_CATEGORIES, type Currency } from "../db/schema";
import { invoiceState } from "@/domain/finance";
import { buildSnapshot } from "@/domain/fx";
import { audit, BusinessRuleError, getSettings, loadRates, nowIso, snapshotFor, todayIso, type Actor } from "./common";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

// ───────────── Invoices ─────────────

export const invoiceInput = z.object({
  organizationId: z.string().min(1, "client is required"),
  contractId: z.string().optional().nullable().transform((v) => v || null),
  issueDate: isoDate,
  dueDate: isoDate,
  currency: z.enum(CURRENCIES),
  subtotal: z.number().int().positive("subtotal must be positive"),
  taxRate: z.number().min(0).max(0.5),
  notes: z.string().trim().max(2000).optional().default(""),
  isDemo: z.boolean().optional().default(false),
});

async function nextInvoiceNumber(db: DB, issueDate: string) {
  const year = issueDate.slice(0, 4);
  const [{ n }] = (await db.select({ n: sql<number>`count(*)` }).from(invoices).where(sql`substr(${invoices.number}, 5, 4) = ${year}`)) as [{ n: number }];
  return `PRX-${year}-${String(n + 1).padStart(4, "0")}`;
}

/** Creates a DRAFT invoice. Totals are computed server-side. Not a fiscal document (CFDI requires legal entity + RFC). */
export async function createInvoice(db: DB, raw: z.input<typeof invoiceInput>, actor: Actor = "founder") {
  const input = invoiceInput.parse(raw);
  if (input.dueDate < input.issueDate) throw new BusinessRuleError("Due date must be on or after the issue date.");
  if (input.contractId) {
    const [c] = await db.select().from(contracts).where(eq(contracts.id, input.contractId));
    if (!c) throw new BusinessRuleError("Contract not found.");
    if (c.organizationId !== input.organizationId) throw new BusinessRuleError("Contract belongs to a different client.");
    if (!["signed", "active", "completed"].includes(c.status)) throw new BusinessRuleError("Only signed contracts can be invoiced.");
    if (c.currency !== input.currency) throw new BusinessRuleError(`Invoice currency must match the contract currency (${c.currency}).`);
    const [{ s }] = (await db
      .select({ s: sql<number>`coalesce(sum(${invoices.subtotal}),0)` })
      .from(invoices)
      .where(and(eq(invoices.contractId, c.id), ne(invoices.status, "void")))) as [{ s: number }];
    if (s + input.subtotal > c.totalAmount)
      throw new BusinessRuleError(`Invoiced amount would exceed the contract value (${(c.totalAmount - s) / 100} ${c.currency} remaining).`, { remaining: c.totalAmount - s });
  }
  const tax = Math.round(input.subtotal * input.taxRate);
  const number = await nextInvoiceNumber(db, input.issueDate);
  const [row] = await db.insert(invoices).values({ ...input, number, tax, total: input.subtotal + tax, status: "draft" }).returning();
  await audit(db, actor, "invoice.create", "invoice", row!.id, null, row);
  return row!;
}

/** Issues a draft invoice: locks it and stores its FX snapshot on the issue date. */
export async function issueInvoice(db: DB, id: string, actor: Actor = "founder") {
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, id));
  if (!inv) throw new BusinessRuleError("Invoice not found.");
  if (inv.status !== "draft") throw new BusinessRuleError(`Invoice is already ${inv.status}.`);
  const snap = await snapshotFor(db, inv.total, inv.currency, inv.issueDate);
  const [after] = await db.update(invoices).set({ status: "issued", ...snap, updatedAt: nowIso() }).where(eq(invoices.id, id)).returning();
  await audit(db, actor, "invoice.issue", "invoice", id, inv, after);
  return after!;
}

export async function voidInvoice(db: DB, id: string, reason: string, actor: Actor = "founder") {
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, id));
  if (!inv) throw new BusinessRuleError("Invoice not found.");
  if (inv.status === "void") throw new BusinessRuleError("Invoice is already void.");
  const paid = await db.select({ id: payments.id }).from(payments).where(eq(payments.invoiceId, id));
  if (paid.length) throw new BusinessRuleError("Invoices with recorded payments cannot be voided.");
  if (!reason?.trim()) throw new BusinessRuleError("A reason is required to void an invoice.");
  await db.update(invoices).set({ status: "void", notes: `${inv.notes}\n[VOID] ${reason}`.trim(), updatedAt: nowIso() }).where(eq(invoices.id, id));
  await audit(db, actor, "invoice.void", "invoice", id, { status: inv.status }, { status: "void", reason });
}

export const paymentInput = z.object({
  receivedOn: isoDate,
  amount: z.number().int().positive("amount must be positive"),
  currency: z.enum(CURRENCIES),
  method: z.string().trim().max(50).optional().default("transfer"),
  reference: z.string().trim().max(200).optional().default(""),
});

/** Records cash actually received against an issued invoice (same currency, never above the open balance). */
export async function recordPayment(db: DB, invoiceId: string, raw: z.input<typeof paymentInput>, actor: Actor = "founder") {
  const input = paymentInput.parse(raw);
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
  if (!inv) throw new BusinessRuleError("Invoice not found.");
  if (inv.status !== "issued") throw new BusinessRuleError("Payments can only be recorded on issued invoices.");
  if (input.currency !== inv.currency) throw new BusinessRuleError(`Payment currency must match the invoice currency (${inv.currency}).`);
  if (input.receivedOn < inv.issueDate) throw new BusinessRuleError("Payment date cannot be before the invoice issue date.");
  if (input.receivedOn > todayIso()) throw new BusinessRuleError("Payments cannot be recorded with a future date.");
  const existing = await db.select().from(payments).where(eq(payments.invoiceId, invoiceId));
  const state = invoiceState({ ...inv, fxRate: inv.fxRate, reportingCurrency: inv.reportingCurrency }, existing, todayIso());
  if (input.amount > state.balance) throw new BusinessRuleError(`Payment exceeds the open balance (${state.balance / 100} ${inv.currency}).`, { balance: state.balance });
  const snap = await snapshotFor(db, input.amount, input.currency, input.receivedOn);
  const [row] = await db.insert(payments).values({ ...input, invoiceId, ...snap, isDemo: inv.isDemo }).returning();
  await audit(db, actor, "payment.record", "invoice", invoiceId, null, row);
  return row!;
}

// ───────────── Expenses ─────────────

export const expenseInput = z.object({
  incurredOn: isoDate,
  vendor: z.string().trim().min(1, "vendor is required").max(200),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().trim().max(1000).optional().default(""),
  amount: z.number().int().positive("amount must be positive"),
  currency: z.enum(CURRENCIES),
  costType: z.enum(["direct", "overhead"]),
  contractId: z.string().optional().nullable().transform((v) => v || null),
  recurrence: z.enum(["none", "monthly", "annual"]).optional().default("none"),
  status: z.enum(["actual", "planned"]).optional().default("actual"),
  isDemo: z.boolean().optional().default(false),
});

export async function createExpense(db: DB, raw: z.input<typeof expenseInput>, actor: Actor = "founder") {
  const input = expenseInput.parse(raw);
  if (input.contractId && input.costType !== "direct") throw new BusinessRuleError("Expenses linked to a contract must be direct delivery costs.");
  if (input.status === "actual" && input.incurredOn > todayIso()) throw new BusinessRuleError("Actual expenses cannot have a future date; record it as planned.");
  const snap = await snapshotFor(db, input.amount, input.currency, input.incurredOn);
  const [row] = await db.insert(expenses).values({ ...input, ...snap }).returning();
  await audit(db, actor, "expense.create", "expense", row!.id, null, row);
  return row!;
}

// ───────────── FX ─────────────

export const fxInput = z.object({
  base: z.enum(CURRENCIES),
  quote: z.enum(CURRENCIES),
  rate: z.number().positive("rate must be positive").max(1000),
  source: z.string().trim().min(2, "source is required (e.g. Banxico FIX, bank statement)"),
  rateDate: isoDate,
});

export async function addFxRate(db: DB, raw: z.input<typeof fxInput>, actor: Actor = "founder") {
  const input = fxInput.parse(raw);
  if (input.base === input.quote) throw new BusinessRuleError("Base and quote currencies must differ.");
  if (input.rateDate > todayIso()) throw new BusinessRuleError("Rates cannot be dated in the future.");
  const [row] = await db.insert(fxRates).values(input).returning();
  await audit(db, actor, "fx.add", "fx_rate", row!.id, null, row);
  return row!;
}

/**
 * Fills FX snapshots that are MISSING (records created before a rate existed). Never changes original amounts and
 * never overwrites an existing snapshot.
 */
export async function applyMissingSnapshots(db: DB, actor: Actor = "founder") {
  const s = await getSettings(db);
  const rates = await loadRates(db);
  let updated = 0;
  const fill = async (table: typeof contracts | typeof invoices | typeof payments | typeof expenses | typeof revenueEntries, amountCol: "totalAmount" | "total" | "amount", dateCol: string) => {
    const rows = (await db.select().from(table as never).where(isNull((table as typeof payments).reportingAmount))) as Record<string, unknown>[];
    for (const r of rows) {
      const date = r[dateCol] as string | null;
      if (!date || r.status === "draft") continue;
      const snap = buildSnapshot(rates, r[amountCol] as number, r.currency as Currency, date, s.reportingCurrency);
      if (!snap) continue;
      await db.update(table as never).set(snap as never).where(eq((table as typeof payments).id, r.id as string));
      updated++;
    }
  };
  await fill(contracts, "totalAmount", "signedAt");
  await fill(invoices, "total", "issueDate");
  await fill(payments, "amount", "receivedOn");
  await fill(expenses, "amount", "incurredOn");
  await fill(revenueEntries, "amount", "recognizedOn");
  await audit(db, actor, "fx.apply_missing", "fx_rate", "*", null, { updated });
  return updated;
}

export async function listFxRates(db: DB) {
  return db.select().from(fxRates).orderBy(desc(fxRates.rateDate));
}

// ───────────── Settings ─────────────

export const settingsInput = z.object({
  companyName: z.string().trim().min(1).max(200).optional(),
  reportingCurrency: z.enum(CURRENCIES).optional(),
  openingCashAmount: z.number().int().optional().nullable(),
  openingCashCurrency: z.enum(CURRENCIES).optional().nullable(),
  openingCashDate: isoDate.optional().nullable(),
  monthlyRevenueTarget: z.number().int().min(0).optional(),
  monthlyRevenueTargetCurrency: z.enum(CURRENCIES).optional(),
  targetBasis: z.enum(["recognized", "collected", "contracted"]).optional(),
  defaultTaxRate: z.number().min(0).max(0.5).optional(),
});

/** Reporting currency is locked once monetary records carry snapshots (changing it would rewrite history). */
export async function reportingCurrencyLocked(db: DB) {
  const checks = await Promise.all([
    db.select({ id: invoices.id }).from(invoices).where(sql`${invoices.reportingCurrency} is not null`).limit(1),
    db.select({ id: payments.id }).from(payments).limit(1),
    db.select({ id: expenses.id }).from(expenses).limit(1),
    db.select({ id: contracts.id }).from(contracts).where(sql`${contracts.reportingCurrency} is not null`).limit(1),
  ]);
  return checks.some((r) => r.length > 0);
}

export async function updateSettings(db: DB, raw: z.input<typeof settingsInput>, actor: Actor = "founder") {
  const input = settingsInput.parse(raw);
  const before = await getSettings(db);
  if (input.reportingCurrency && input.reportingCurrency !== before.reportingCurrency && (await reportingCurrencyLocked(db)))
    throw new BusinessRuleError("Reporting currency is locked because financial records already exist in it.");
  const cashFields = [input.openingCashAmount, input.openingCashCurrency, input.openingCashDate];
  if (cashFields.some((v) => v !== undefined && v !== null) && cashFields.some((v) => v === undefined || v === null))
    throw new BusinessRuleError("Opening cash requires amount, currency and date together.");
  const [after] = await db.update(companySettings).set({ ...input, updatedAt: nowIso() }).where(eq(companySettings.id, 1)).returning();
  await audit(db, actor, "settings.update", "settings", "1", before, after);
  return after!;
}
