"use server";
import * as crm from "@/server/services/crm";
import { run } from "./run";

const P = ["/", "/crm", "/sales"];

export async function createOrganizationAction(input: Parameters<typeof crm.createOrganization>[1]) {
  return run((db, a) => crm.createOrganization(db, { ...input, isDemo: false }, a), [...P, "/crm/organizations"]);
}
export async function updateOrganizationAction(id: string, input: Parameters<typeof crm.updateOrganization>[2]) {
  return run((db, a) => crm.updateOrganization(db, id, { ...input, isDemo: undefined }, a), [...P, "/crm/organizations", `/crm/organizations/${id}`]);
}
export async function createContactAction(input: Parameters<typeof crm.createContact>[1]) {
  return run((db, a) => crm.createContact(db, { ...input, isDemo: false }, a), [...P, "/crm/contacts"]);
}
export async function updateContactAction(id: string, input: Parameters<typeof crm.updateContact>[2]) {
  return run((db, a) => crm.updateContact(db, id, { ...input, isDemo: undefined }, a), [...P, "/crm/contacts", `/crm/contacts/${id}`]);
}
export async function createOpportunityAction(input: Parameters<typeof crm.createOpportunity>[1]) {
  return run((db, a) => crm.createOpportunity(db, { ...input, isDemo: false }, a), P);
}
export async function updateOpportunityAction(id: string, input: Parameters<typeof crm.updateOpportunity>[2]) {
  return run((db, a) => crm.updateOpportunity(db, id, { ...input, isDemo: undefined }, a), [...P, `/crm/opportunities/${id}`]);
}
export async function moveStageAction(id: string, stageId: string, lostReason?: string) {
  return run((db, a) => crm.moveOpportunityStage(db, id, stageId, a, { lostReason }), [...P, `/crm/opportunities/${id}`]);
}
export async function logActivityAction(input: Parameters<typeof crm.logActivity>[1]) {
  return run((db, a) => crm.logActivity(db, { ...input, isDemo: false }, a), [...P, "/crm/organizations", "/crm/contacts"]);
}
