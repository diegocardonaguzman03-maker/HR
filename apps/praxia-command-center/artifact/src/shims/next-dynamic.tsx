import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

export default function dynamic<P extends object>(loader: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>, opts: { loading?: () => ReactNode } = {}) {
  const L = lazy(async () => {
    const m = await loader();
    return "default" in (m as object) ? (m as { default: ComponentType<P> }) : { default: m as ComponentType<P> };
  });
  return (props: P) => <Suspense fallback={opts.loading?.() ?? null}><L {...props} /></Suspense>;
}
