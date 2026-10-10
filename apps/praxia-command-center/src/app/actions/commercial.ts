"use server";
import * as com from "@/server/services/commercial";
import { run } from "./run";

const P = (id?: string) => ["/", "/crm", "/approvals", "/finance", "/projects", ...(id ? [`/proposals/${id}`, `/finance/contracts/${id}`] : [])];

export async function createProposalAction(opportunityId: string) {
  return run((db, a) => com.createProposalFromOpportunity(db, opportunityId, a), P());
}
export async function saveProposalAction(id: string, input: Parameters<typeof com.updateProposal>[2]) {
  return run(async (db, a) => (await com.updateProposal(db, id, input, a)).proposal, P(id));
}
export async function submitProposalAction(id: string) {
  return run((db, a) => com.submitProposalForApproval(db, id, a), P(id));
}
export async function markProposalSentAction(id: string, sentOn: string) {
  return run((db, a) => com.markProposalSent(db, id, sentOn, a), P(id));
}
export async function proposalOutcomeAction(id: string, outcome: "negotiation" | "rejected" | "expired") {
  return run((db, a) => com.setProposalOutcome(db, id, outcome, a), P(id));
}
export async function acceptProposalAction(id: string, acceptedOn: string, evidence: string) {
  return run((db, a) => com.acceptProposal(db, id, { acceptedOn, evidence }, a), P(id));
}
export async function signContractAction(id: string, input: Parameters<typeof com.signContract>[2]) {
  return run((db, a) => com.signContract(db, id, input, a), P(id));
}
export async function contractStatusAction(id: string, status: "active" | "completed" | "terminated") {
  return run((db, a) => com.setContractStatus(db, id, status, a), P(id));
}
export async function recognizeRevenueAction(contractId: string, input: Parameters<typeof com.recognizeRevenue>[2]) {
  return run((db, a) => com.recognizeRevenue(db, contractId, input, a), P(contractId));
}
