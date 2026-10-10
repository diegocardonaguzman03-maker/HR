"use server";
import { eraseContact, exportContactData, recordOptOut, setPrivacyNotice, suppress } from "@/server/services/privacy";
import { run } from "./run";

const PAGES = ["/crm/contacts", "/analytics", "/approvals", "/settings"];

export async function exportContactAction(contactId: string) {
  return run((db) => exportContactData(db, contactId), []);
}
export async function optOutAction(contactId: string, channel: string) {
  return run((db, actor) => recordOptOut(db, contactId, channel, actor), PAGES);
}
export async function eraseContactAction(contactId: string, reason: string) {
  return run((db, actor) => eraseContact(db, contactId, reason, actor), PAGES);
}
export async function suppressValueAction(input: { email?: string; domain?: string }, reason: string) {
  return run((db, actor) => suppress(db, input, reason, actor), PAGES);
}
export async function setPrivacyNoticeAction(version: string, url: string) {
  return run((db, actor) => setPrivacyNotice(db, { version, url }, actor), PAGES);
}
