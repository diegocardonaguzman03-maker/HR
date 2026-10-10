import { getContext } from "@/server/context";
import { getSettings } from "@/server/services/common";
import { listFxRates } from "@/server/services/finance";
import { Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { FxForm } from "./FxForm";

export const metadata = { title: "Exchange rates" };

export default async function FxPage() {
  const { db, today } = await getContext();
  const [rates, s] = await Promise.all([listFxRates(db), getSettings(db)]);
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader label="Finance" title="Exchange rates" description={`Rates are entered with their source and date; no rate is fetched or assumed. Records use the latest rate on or before their own date. Reporting currency: ${s.reportingCurrency}.`} />
      <FinanceTabs active="fx" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <SectionTitle label="History" title="Recorded rates" />
          {!rates.length ? <EmptyState title="No rates recorded">USD↔MXN records cannot be consolidated until you add a dated rate (e.g. Banxico FIX of that day).</EmptyState> : (
            <table className="px-table"><thead><tr><th>Date</th><th>Pair</th><th className="text-right">Rate</th><th>Source</th><th>Entered</th></tr></thead>
              <tbody>{rates.map((r) => <tr key={r.id}><td className="font-mono text-[12px]">{r.rateDate}</td><td className="font-mono">1 {r.base} = </td><td className="text-right font-mono">{r.rate} {r.quote}</td><td>{r.source}</td><td className="font-mono text-[11px] text-mute">{r.createdAt.slice(0, 16).replace("T", " ")}</td></tr>)}</tbody>
            </table>
          )}
        </Card>
        <Card className="h-fit p-5"><SectionTitle label="Add" title="New rate" /><FxForm today={today} /></Card>
      </div>
    </div>
  );
}
