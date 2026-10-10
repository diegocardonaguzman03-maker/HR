import { PlannedModule } from "@/components/ui/Planned";
export const metadata = { title: "Marketing" };
export default function Page() {
  return <PlannedModule label="Brand & demand" title="Marketing" phase="Phase 3"
    purpose="Editorial calendar for founder-led LinkedIn content and its measured effect on qualified conversations and pipeline."
    scope={["Editorial calendar by pillar (theses, frameworks, diagnostics, founder experience, offer)", "Drafts by MKT-02 with source checks by QA-01 and founder approval before publishing", "Attribution: conversations and meetings originated, pipeline influenced (vanity metrics excluded)"]}
    today={[{ label: "Assign a content task to MKT-02", href: "/agents/MKT-02" }, { label: "Log LinkedIn interactions", href: "/crm/contacts" }]}
    needs={["Decision D-P03 (business backlog incl. PRX-0006 LinkedIn calendar)", "No auto-publishing: posts stay manual unless an authorized integration is approved"]} />;
}
