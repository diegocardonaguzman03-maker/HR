import Link from "next/link";
import { cn } from "@/lib/cn";

export function CrmTabs({ active }: { active: "pipeline" | "table" | "organizations" | "contacts" }) {
  const tabs = [
    { k: "pipeline", href: "/crm", label: "Pipeline" },
    { k: "table", href: "/crm?view=table", label: "Table" },
    { k: "organizations", href: "/crm/organizations", label: "Organizations" },
    { k: "contacts", href: "/crm/contacts", label: "Contacts" },
  ];
  return (
    <nav className="mb-6 flex gap-1 border-b border-hair" aria-label="CRM sections">
      {tabs.map((t) => (
        <Link key={t.k} href={t.href} className={cn("-mb-px border-b-2 px-3 py-2 text-[13px]", active === t.k ? "border-indigo text-ivory" : "border-transparent text-niebla hover:text-ivory")}>{t.label}</Link>
      ))}
    </nav>
  );
}
