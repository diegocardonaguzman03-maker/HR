"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/primitives";
import { decideApprovalAction } from "@/app/actions/governance";
import { toast } from "@/lib/ui-store";

export function ApprovalButtons({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const decide = (d: "approved" | "rejected") => {
    const note = d === "rejected" ? prompt("Reason for rejecting (recorded):") : prompt("Approve? Optional note (recorded). Cancel to abort.", "");
    if (note === null) return; // cancelled — nothing is decided
    if (d === "rejected" && !note.trim()) return;
    start(async () => { const r = await decideApprovalAction(id, d, note || null); if (r.ok) { toast.ok(d === "approved" ? "Approved." : "Rejected."); router.refresh(); } else toast.bad(r.error); });
  };
  return <div className="flex gap-2"><Button variant="primary" size="sm" disabled={pending} onClick={() => decide("approved")}>Approve</Button><Button variant="danger" size="sm" disabled={pending} onClick={() => decide("rejected")}>Reject</Button></div>;
}
