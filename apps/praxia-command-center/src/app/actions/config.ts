"use server";
import { updateService, updateStage } from "@/server/services/config";
import { run } from "./run";

export async function updateServiceAction(id: string, input: Parameters<typeof updateService>[2]) {
  return run((db, a) => updateService(db, id, input, a), ["/settings", "/crm"]);
}
export async function updateStageAction(id: string, input: Parameters<typeof updateStage>[2]) {
  return run((db, a) => updateStage(db, id, input, a), ["/", "/settings", "/crm"]);
}
