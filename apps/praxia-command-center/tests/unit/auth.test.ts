import { describe, it, expect } from "vitest";
import { createSessionToken, passwordMatches, verifySessionToken } from "@/server/auth";

const secret = "x".repeat(40);
describe("session tokens", () => {
  it("verifies valid tokens and rejects tampered, foreign or expired ones", async () => {
    const t = await createSessionToken(secret, Date.now());
    expect(await verifySessionToken(t, secret)).toBe(true);
    expect(await verifySessionToken(t, "y".repeat(40))).toBe(false);
    expect(await verifySessionToken(t.slice(0, -2) + "aa", secret)).toBe(false);
    expect(await verifySessionToken(t, secret, Date.now() + 13 * 3_600_000)).toBe(false);
    expect(await verifySessionToken(undefined, secret)).toBe(false);
  });
  it("compares passwords", async () => {
    expect(await passwordMatches("abc", "abc", secret)).toBe(true);
    expect(await passwordMatches("abcd", "abc", secret)).toBe(false);
  });
});
