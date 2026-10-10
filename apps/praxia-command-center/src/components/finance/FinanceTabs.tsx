import Link from "next/link";
import { cn } from "@/lib/cn";

export function FinanceTabs({ active }: { active: "overview" | "invoices" | "expenses" | "fx" }) {
  const tabs = [
    { k: "overview", href: "/finance", label: "Overview & contracts" },
    { k: "invoices", href: "/finance/invoices", label: "Invoices & collections" },
    { k: "expenses", href: "/finance/expenses", label: "Expenses" },
    { k: "fx", href: "/finance/fx", label: "Exchange rates" },
  ];
  return (
    <nav className="mb-6 flex gap-1 border-b border-hair" aria-label="Finance sections">
      {tabs.map((t) => <Link key={t.k} href={t.href} className={cn("-mb-px border-b-2 px-3 py-2 text-[13px]", active === t.k ? "border-indigo text-ivory" : "border-transparent text-niebla hover:text-ivory")}>{t.label}</Link>)}
    </nav>
  );
}

export function FinanceDisclaimer() {
  return <p className="mt-8 max-w-3xl text-[11.5px] text-mute">Operational finance system — not regulated accounting or tax software. Invoices here are commercial documents, not CFDI fiscal invoices (requires a legal entity and RFC). Validate tax and accounting treatment with an accountant.</p>;
}
