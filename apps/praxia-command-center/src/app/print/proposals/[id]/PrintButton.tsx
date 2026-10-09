"use client";
export function PrintButton() {
  return <button onClick={() => window.print()} className="rounded-lg bg-graphite px-4 py-2 text-[13px] text-ivory">Print / Save as PDF</button>;
}
