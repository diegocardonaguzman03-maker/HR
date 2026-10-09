import { PlannedModule } from "@/components/ui/Planned";
export const metadata = { title: "Analytics" };
export default function Page() {
  return <PlannedModule label="Analytics" title="Analytics" phase="Phase 3"
    purpose="Deeper analysis across revenue, campaigns, delivery and agent performance, with exports."
    scope={["Revenue by client, service and period", "Cohort and campaign ROI", "Agent value: tasks, cost, accepted outputs", "CSV/XLSX exports"]}
    today={[{ label: "Executive overview (MTD/QTD/YTD)", href: "/" }, { label: "Finance ledger", href: "/finance" }, { label: "Sales funnel & forecast", href: "/sales" }]}
    needs={["Enough real data to analyze — nothing is simulated"]} />;
}
