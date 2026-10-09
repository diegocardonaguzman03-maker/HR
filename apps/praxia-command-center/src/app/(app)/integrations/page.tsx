import { Badge, Card, PageHeader } from "@/components/ui/primitives";

export const metadata = { title: "Integrations" };

const ITEMS = [
  { name: "LLM provider (agent execution)", purpose: "Runs agent tasks, chat with agents, personalization drafts.", status: "Not connected", phase: "Phase 2", note: "Credentials entered by you, stored server-side; per-agent tool permissions; costs recorded per task." },
  { name: "Hunter.io", purpose: "Domain search, email finder, email verification, credit usage.", status: "Not connected", phase: "Phase 2", note: "Only documented endpoints; provenance + retrieval time stored on every enriched record." },
  { name: "Email (Gmail / Outlook via OAuth)", purpose: "Send founder-approved messages, detect replies, stop sequences on reply.", status: "Not connected", phase: "Phase 2", note: "No message leaves without explicit approval." },
  { name: "LinkedIn", purpose: "Profile/company URLs, guided manual outreach, interaction logging.", status: "Manual workflow only", phase: "Live (manual)", note: "No private messaging API assumed; no scraping, CAPTCHA bypass or bulk automation." },
  { name: "E-signature", purpose: "Envelope status as signature evidence for contracts.", status: "Not connected", phase: "Phase 2", note: "Today: record the signed-file reference manually." },
  { name: "Exchange rates source", purpose: "Daily USD/MXN reference rate.", status: "Manual entry", phase: "Live (manual)", note: "Each rate stored with source and date; never overwritten." },
  { name: "Accounting / CFDI", purpose: "Fiscal invoicing in Mexico.", status: "Out of scope", phase: "—", note: "Requires legal entity + RFC; this system is operational finance, not tax software." },
];

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader label="Settings" title="Integrations" description="Truthful status of every external connection. Nothing here sends data externally until you configure it and approve its use." />
      <div className="grid gap-3 md:grid-cols-2">
        {ITEMS.map((i) => (
          <Card key={i.name} className="p-5">
            <div className="mb-2 flex items-start justify-between gap-2"><div className="font-display text-[15px] font-semibold">{i.name}</div><Badge tone={i.status.startsWith("Not") ? "neutral" : i.status === "Out of scope" ? "bad" : "warn"}>{i.status}</Badge></div>
            <p className="text-[13px] text-niebla">{i.purpose}</p>
            <p className="mt-2 text-[12px] text-mute">{i.note}</p>
            <div className="mt-3 font-mono text-[10.5px] tracking-wider text-mute uppercase">{i.phase}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
