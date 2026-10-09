import { PlannedModule } from "@/components/ui/Planned";
export const metadata = { title: "Outreach" };
export default function Page() {
  return <PlannedModule label="Outbound sales engine" title="Outreach" phase="Phase 2"
    purpose="Campaigns, AI-personalized drafts and sequences with human approval of every message before it is sent through an authorized provider."
    scope={["Campaign builder (ICP, geography, offering, channel, schedule, success metrics)", "Research-before-draft personalization with evidence per claim", "Sequences: initial, follow-ups, reply handling, meeting invite", "Per-message founder approval; bounded auto-send only if explicitly enabled", "Suppression lists, opt-out, frequency caps, stop-on-reply, bounce monitoring, audit", "LinkedIn-assisted manual workflow (no scraping or unauthorized automation)", "Campaign analytics: replies, meetings, pipeline, cost per opportunity — not opens"]}
    today={[{ label: "Record outbound/inbound interactions on a contact", href: "/crm/contacts" }, { label: "Suppression flag (do not contact) on contacts", href: "/crm/contacts" }, { label: "Reply rate from logged interactions", href: "/sales" }]}
    needs={["Email provider via OAuth (Gmail/Outlook) — configured by you", "Founder-approved messaging policy", "RISK-01 review of LFPDPPP / GDPR / CAN-SPAM controls"]} />;
}
