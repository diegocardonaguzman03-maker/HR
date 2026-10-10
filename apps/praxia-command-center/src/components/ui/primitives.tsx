import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "human";
const variants: Record<Variant, string> = {
  primary: "bg-indigo text-ivory hover:bg-[#6a5cff] border-indigo",
  human: "bg-clay text-graphite hover:bg-[#f07a54] border-clay",
  secondary: "bg-graphite-3 text-ivory hover:bg-hair border-hair",
  ghost: "bg-transparent text-niebla hover:text-ivory hover:bg-graphite-3 border-transparent",
  danger: "bg-transparent text-bad hover:bg-bad/10 border-bad/40",
};
const base = "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }>(
  ({ className, variant = "secondary", size = "md", ...p }, ref) => <button ref={ref} className={cn(base, variants[variant], size === "sm" && "px-2 py-1 text-xs", className)} {...p} />,
);
Button.displayName = "Button";

export function ButtonLink({ href, variant = "secondary", className, children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return <Link href={href} className={cn(base, variants[variant], className)}>{children}</Link>;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => <input ref={ref} className={cn("px-input", className)} {...p} />);
Input.displayName = "Input";
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => <textarea ref={ref} className={cn("px-input min-h-20", className)} {...p} />);
Textarea.displayName = "Textarea";
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...p }, ref) => <select ref={ref} className={cn("px-input", className)} {...p} />);
Select.displayName = "Select";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="flex flex-col gap-1.5">
        <span className="px-label">{label}</span>
        {children}
      </label>
      {hint && <span className="text-[11.5px] text-mute">{hint}</span>}
    </div>
  );
}

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-card", className)} {...p} />;
}

export function SectionTitle({ label, title, action }: { label?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        {label && <div className="px-label mb-1 flex items-center gap-2"><span className="inline-block size-1.5 bg-indigo" />{label}</div>}
        <h2 className="font-display text-[17px] font-semibold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ label, title, description, actions }: { label: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="px-label mb-2 flex items-center gap-2"><span className="inline-block size-1.5 bg-indigo" />{label}</div>
        <h1 className="font-display text-[30px] leading-tight font-semibold tracking-[-0.02em]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13.5px] text-niebla">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

const tones = {
  neutral: "border-hair text-niebla",
  indigo: "border-indigo/50 text-indigo-soft bg-indigo/10",
  clay: "border-clay/50 text-clay bg-clay/10",
  ok: "border-ok/40 text-ok bg-ok/10",
  warn: "border-warn/40 text-warn bg-warn/10",
  bad: "border-bad/40 text-bad bg-bad/10",
  violet: "border-violet/40 text-violet bg-violet/10",
} as const;
export type Tone = keyof typeof tones;
export function Badge({ tone = "neutral", children, className, title }: { tone?: Tone; children: ReactNode; className?: string; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase", tones[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-hair p-6">
      <div className="font-display text-[15px] font-semibold">{title}</div>
      {children && <div className="max-w-xl text-[13px] text-niebla">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <div className="px-label">{label}</div>
      <div className="mt-1 font-display text-[18px] font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-[12px] text-mute">{sub}</div>}
    </div>
  );
}
