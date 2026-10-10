import { ArrowDownLeft, ArrowUpRight, Dot } from "lucide-react";
import { Badge } from "@/components/ui/primitives";

type Act = { id: string; type: string; direction: string; subject: string; body: string; occurredAt: string; actor: string; recordedManually: boolean; isDemo: boolean };

export function Timeline({ items }: { items: Act[] }) {
  if (!items.length) return <p className="text-[13px] text-mute">No activity recorded yet.</p>;
  return (
    <ol className="relative ml-2 border-l border-hair">
      {items.map((a) => (
        <li key={a.id} className="mb-4 ml-4">
          <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full border border-hair bg-graphite-3" />
          <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-mute">
            <span className="font-mono">{a.occurredAt.slice(0, 16).replace("T", " ")}</span>
            <Badge>{a.type.replace("_", " ")}</Badge>
            {a.direction === "outbound" && <span className="flex items-center text-indigo-soft"><ArrowUpRight size={12} />outbound</span>}
            {a.direction === "inbound" && <span className="flex items-center text-ok"><ArrowDownLeft size={12} />inbound</span>}
            <span className="flex items-center"><Dot size={12} />{a.actor}{a.recordedManually ? " · manual record" : ""}</span>
            {a.isDemo && <Badge tone="clay">Demo</Badge>}
          </div>
          <div className="mt-0.5 text-[13.5px]">{a.subject}</div>
          {a.body && <p className="mt-0.5 whitespace-pre-wrap text-[12.5px] text-niebla">{a.body}</p>}
        </li>
      ))}
    </ol>
  );
}
