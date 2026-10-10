import { describe, it, expect, afterEach, vi } from "vitest";
import { authConfig, devOpenMode } from "@/server/auth";

vi.mock("next/headers", () => ({ headers: vi.fn(), cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("server-only", () => ({}));

const env = { ...process.env };
afterEach(() => { process.env = { ...env }; });

describe("auth configuration", () => {
  it("rejects example and weak credentials", () => {
    process.env.PRAXIA_ADMIN_PASSWORD = "change-me";
    process.env.PRAXIA_SESSION_SECRET = "x".repeat(40);
    expect(authConfig().configured).toBe(false);
    process.env.PRAXIA_ADMIN_PASSWORD = "a-strong-founder-pass";
    process.env.PRAXIA_SESSION_SECRET = "generate-a-random-string-of-at-least-32-characters";
    expect(authConfig().configured).toBe(false);
    process.env.PRAXIA_ADMIN_PASSWORD = "short";
    process.env.PRAXIA_SESSION_SECRET = "y".repeat(40);
    expect(authConfig().configured).toBe(false);
    process.env.PRAXIA_ADMIN_PASSWORD = "a-strong-founder-pass";
    expect(authConfig().configured).toBe(true);
  });
  it("only opens without login when explicitly requested outside production", () => {
    delete process.env.PRAXIA_ADMIN_PASSWORD;
    delete process.env.PRAXIA_SESSION_SECRET;
    delete process.env.PRAXIA_DEV_OPEN;
    expect(devOpenMode()).toBe(false);
    process.env.PRAXIA_DEV_OPEN = "1";
    expect(devOpenMode()).toBe(process.env.NODE_ENV !== "production");
  });
});

describe("post-login redirect", () => {
  it("only allows same-origin relative paths", async () => {
    const { safeNext } = await import("@/server/auth");
    expect(safeNext("/crm?view=table")).toBe("/crm?view=table");
    for (const bad of ["//evil.com", "/\\evil.com", "/\t/evil.com", "https://evil.com", "", "evil"]) expect(safeNext(bad)).toBe("/");
  });
});
