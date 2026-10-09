"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Field, Select } from "@/components/ui/primitives";
import { AvatarPreview } from "@/features/world/AvatarPreview";
import { updateAvatarAction } from "@/app/actions/governance";
import { toast } from "@/lib/ui-store";
import type { AvatarConfig } from "@/server/db/schema";

const SKIN = ["#F1D3B5", "#E0B590", "#C68E65", "#9C6A45", "#6E4A31", "#4A3122"];
const HAIR = ["#1B1B1F", "#3B2A20", "#6B4A2E", "#A0743F", "#C9C2B8", "#5B4BFF", "#E9663C"];
const OUTFIT = ["#5B4BFF", "#8B5CF6", "#E9663C", "#0C0D12", "#A7AAB5", "#2B2D38", "#F5F2EC"];

function Swatches({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="px-label mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => <button key={v} type="button" aria-label={`${label} ${v}`} aria-pressed={v.toLowerCase() === value.toLowerCase()} onClick={() => onChange(v)} className={`size-6 rounded-full border-2 ${v.toLowerCase() === value.toLowerCase() ? "border-ivory" : "border-transparent"}`} style={{ background: v }} />)}
      </div>
    </div>
  );
}

export function AvatarEditor({ agentId, initial }: { agentId: string; initial: AvatarConfig }) {
  const router = useRouter();
  const [a, setA] = useState<AvatarConfig>(initial);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center rounded-lg border border-hair bg-graphite py-3"><AvatarPreview avatar={a} size={120} label={agentId} /></div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Body"><Select value={a.bodyType} onChange={(e) => setA({ ...a, bodyType: e.target.value as AvatarConfig["bodyType"] })}><option value="a">Type A</option><option value="b">Type B</option><option value="c">Type C</option></Select></Field>
        <Field label="Hair style"><Select value={a.hairStyle} onChange={(e) => setA({ ...a, hairStyle: e.target.value as AvatarConfig["hairStyle"] })}>{["short", "long", "bun", "buzz", "curly"].map((h) => <option key={h}>{h}</option>)}</Select></Field>
        <Field label="Accessory" className="col-span-2"><Select value={a.accessory} onChange={(e) => setA({ ...a, accessory: e.target.value as AvatarConfig["accessory"] })}>{["none", "glasses", "headset", "badge"].map((h) => <option key={h}>{h}</option>)}</Select></Field>
      </div>
      <Swatches label="Skin tone" values={SKIN} value={a.skinTone} onChange={(v) => setA({ ...a, skinTone: v })} />
      <Swatches label="Hair color" values={HAIR} value={a.hairColor} onChange={(v) => setA({ ...a, hairColor: v })} />
      <Swatches label="Outfit" values={OUTFIT} value={a.outfitColor} onChange={(v) => setA({ ...a, outfitColor: v })} />
      <Button variant="primary" disabled={pending} onClick={() => start(async () => { const r = await updateAvatarAction(agentId, a); if (r.ok) { toast.ok("Avatar saved."); router.refresh(); } else toast.bad(r.error); })}>Save avatar</Button>
    </div>
  );
}
