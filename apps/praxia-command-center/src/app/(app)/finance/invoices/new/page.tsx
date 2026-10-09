import { asc, eq, inArray } from "drizzle-orm";
import { getContext } from "@/server/context";
import { contracts, organizations } from "@/server/db/schema";
import { demoFilter, getSettings } from "@/server/services/common";
import { Card, PageHeader } from "@/components/ui/primitives";
import { InvoiceForm } from "./InvoiceForm";

export const metadata = { title: "New invoice" };

export default async function NewInvoice({ searchParams }: { searchParams: Promise<{ contractId?: string }> }) {
  const { db, includeDemo, today } = await getContext();
  const { contractId } = await searchParams;
  const orgs = await db.select({ id: organizations.id, name: organizations.name }).from(organizations).where(demoFilter(organizations.isDemo, includeDemo)).orderBy(asc(organizations.name));
  const cs = await db.select().from(contracts).where(inArray(contracts.status, ["signed", "active", "completed"]));
  const settings = await getSettings(db);
  const pre = contractId ? (await db.select().from(contracts).where(eq(contracts.id, contractId)))[0] : undefined;
  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader label="Finance · Invoices" title="New invoice" description="Created as a draft. Issuing it locks the amounts and stores the FX snapshot of the issue date." />
      <Card className="p-6">
        <InvoiceForm
          organizations={orgs.map((o) => ({ id: o.id, label: o.name }))}
          contracts={cs.map((c) => ({ id: c.id, label: c.title, organizationId: c.organizationId, currency: c.currency }))}
          defaults={{ contractId: pre?.id ?? "", organizationId: pre?.organizationId ?? "", currency: pre?.currency ?? settings.reportingCurrency, taxRate: settings.defaultTaxRate, today }}
        />
      </Card>
    </div>
  );
}
