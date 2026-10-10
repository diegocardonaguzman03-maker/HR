"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Toast = { id: number; tone: "ok" | "bad" | "info"; message: string };

export const useUi = create<{
  collapsed: boolean;
  toggleSidebar: () => void;
  paletteOpen: boolean;
  setPalette: (o: boolean) => void;
}>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleSidebar: () => set((s) => ({ collapsed: !s.collapsed })),
      paletteOpen: false,
      setPalette: (paletteOpen) => set({ paletteOpen }),
    }),
    { name: "praxia-ui", partialize: (s) => ({ collapsed: s.collapsed }) },
  ),
);

let nextId = 1;
export const useToasts = create<{ toasts: Toast[]; push: (tone: Toast["tone"], message: string) => void; dismiss: (id: number) => void }>((set) => ({
  toasts: [],
  push: (tone, message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, tone, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), tone === "bad" ? 9000 : 4500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  ok: (m: string) => useToasts.getState().push("ok", m),
  bad: (m: string) => useToasts.getState().push("bad", m),
  info: (m: string) => useToasts.getState().push("info", m),
};
