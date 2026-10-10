/**
 * The Axis — reference SVG from the PRAXIA skill §14.3. PROVISIONAL: the official PNG artwork has not been
 * supplied yet; replace with the approved files when available (never redraw by eye).
 */
export function AxisSymbol({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 80) / 120} viewBox="0 0 120 80" aria-hidden>
      <defs>
        <linearGradient id="pxA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5B4BFF" /><stop offset="1" stopColor="#8B5CF6" /></linearGradient>
        <linearGradient id="pxB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8B5CF6" /><stop offset="1" stopColor="#E9663C" /></linearGradient>
      </defs>
      <circle cx="45" cy="40" r="30" fill="none" stroke="url(#pxA)" strokeWidth="7" />
      <circle cx="75" cy="40" r="30" fill="none" stroke="url(#pxB)" strokeWidth="7" />
    </svg>
  );
}

export function Wordmark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" title="Logo provisional — reference SVG until official artwork is supplied">
      <AxisSymbol size={30} />
      {!collapsed && (
        <div className="leading-none">
          <div className="font-display text-[18px] font-bold tracking-[-0.03em]">Praxia</div>
          <div className="mt-1 font-mono text-[8px] tracking-[0.22em] text-niebla uppercase">Command Center</div>
        </div>
      )}
    </div>
  );
}
