/** Tiny in-page router (the Artifact frame does not expose real URLs or query strings). */
type State = { path: string; search: string; version: number };
let state: State = { path: "/", search: "", version: 0 };
const listeners = new Set<() => void>();
const history: string[] = [];
const emit = () => listeners.forEach((l) => l());

function go(href: string, push: boolean) {
  const [p, q = ""] = href.split("?");
  if (push) history.push(state.path + (state.search ? "?" + state.search : ""));
  state = { path: p || "/", search: q, version: state.version + 1 };
  try { sessionStorage.setItem("praxia-cc-path", href); } catch { /* ignore */ }
  emit();
  window.scrollTo?.(0, 0);
}

export const nav = {
  state: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  push: (href: string) => go(href, true),
  replace: (href: string) => go(href, false),
  back: () => { const h = history.pop(); if (h) go(h, false); },
  refresh: () => { state = { ...state, version: state.version + 1 }; emit(); },
  restore: () => { try { const s = sessionStorage.getItem("praxia-cc-path"); if (s) go(s, false); } catch { /* ignore */ } },
};
