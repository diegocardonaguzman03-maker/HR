import { PlannedModule } from "@/components/ui/Planned";
export const metadata = { title: "Knowledge" };
export default function Page() {
  return <PlannedModule label="Knowledge base" title="Knowledge" phase="Phase 2"
    purpose="Searchable PRAXIA knowledge (brand system, methodology, playbooks, deliverables) that agents use with citations."
    scope={["Index of praxia/00-fuentes and team deliverables", "Retrieval for agent chat with source citations", "Versioning and quarterly review (agent constitution rule 10)"]}
    today={[{ label: "Agent instructions (per agent)", href: "/agents" }, { label: "Audit log", href: "/settings/audit" }]}
    needs={["Execution engine + LLM provider", "Document storage decision"]} />;
}
