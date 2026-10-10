import { useSyncExternalStore } from "react";
import { nav } from "../router";

export class RedirectSignal extends Error { constructor(public to: string) { super("redirect"); } }
export class NotFoundSignal extends Error { constructor() { super("not found"); } }
export function redirect(to: string): never { throw new RedirectSignal(to); }
export function notFound(): never { throw new NotFoundSignal(); }

export function useRouter() {
  return { push: nav.push, replace: nav.replace, refresh: nav.refresh, back: nav.back, prefetch: () => {} };
}
export function usePathname() {
  return useSyncExternalStore(nav.subscribe, () => nav.state().path);
}
export function useSearchParams() {
  const search = useSyncExternalStore(nav.subscribe, () => nav.state().search);
  return new URLSearchParams(search);
}
