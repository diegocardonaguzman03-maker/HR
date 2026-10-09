"use server";
import * as fin from "@/server/services/finance";
import { run } from "./run";

const P = ["/", "/finance", "/finance/invoices", "/finance/expenses", "/finance/fx", "/projects", "/settings"];

export async function createInvoiceAction(input: Parameters<typeof fin.createInvoice>[1]) {
  return run((db, a) => fin.createInvoice(db, input, a), P);
}
export async function issueInvoiceAction(id: string) {
  return run((db, a) => fin.issueInvoice(db, id, a), [...P, `/finance/invoices/${id}`]);
}
export async function voidInvoiceAction(id: string, reason: string) {
  return run((db, a) => fin.voidInvoice(db, id, reason, a), [...P, `/finance/invoices/${id}`]);
}
export async function recordPaymentAction(id: string, input: Parameters<typeof fin.recordPayment>[2]) {
  return run((db, a) => fin.recordPayment(db, id, input, a), [...P, `/finance/invoices/${id}`]);
}
export async function createExpenseAction(input: Parameters<typeof fin.createExpense>[1]) {
  return run((db, a) => fin.createExpense(db, input, a), P);
}
export async function addFxRateAction(input: Parameters<typeof fin.addFxRate>[1]) {
  return run((db, a) => fin.addFxRate(db, input, a), P);
}
export async function applyMissingSnapshotsAction() {
  return run((db, a) => fin.applyMissingSnapshots(db, a), P);
}
export async function updateSettingsAction(input: Parameters<typeof fin.updateSettings>[1]) {
  return run((db, a) => fin.updateSettings(db, input, a), P);
}
