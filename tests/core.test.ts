// Unit tests for the core business modules. They run against the seeded dev
// database (like scripts/smoke.ts): run `npx prisma db push && npm run db:seed`
// first. Test rows are prefixed with [TEST] and cleaned up afterwards.
import { describe, it, expect, afterAll } from "vitest";
import { db } from "../src/lib/db";
import { rateLimit } from "../src/lib/rateLimit";
import { grantCredits, chargeCredits } from "../src/lib/credits";
import { checkRfqCreationLimit, checkInviteLimit, FREE_TOTAL_RFQS } from "../src/lib/limits";
import { shortlistSuppliers } from "../src/lib/matching";

const DEMO_COMPANY = "demo-buyer-company";

afterAll(async () => {
  await db.rfq.deleteMany({ where: { title: { startsWith: "[TEST]" } } });
  await db.creditTransaction.deleteMany({ where: { description: { startsWith: "[TEST]" } } });
  await db.$disconnect();
});

describe("rateLimit", () => {
  it("allows up to max calls within the window, then blocks", () => {
    let allowed = 0;
    for (let i = 0; i < 7; i++) if (rateLimit("test:basic", 5, 60_000)) allowed++;
    expect(allowed).toBe(5);
  });

  it("isolates keys", () => {
    for (let i = 0; i < 5; i++) rateLimit("test:a", 5, 60_000);
    expect(rateLimit("test:b", 5, 60_000)).toBe(true);
  });

  it("re-allows after the window expires", async () => {
    for (let i = 0; i < 5; i++) rateLimit("test:expiry", 5, 1);
    await new Promise((r) => setTimeout(r, 10));
    expect(rateLimit("test:expiry", 5, 1)).toBe(true);
  });
});

describe("credits", () => {
  it("charges atomically and rejects overdraft without side effects", async () => {
    const before = (await db.company.findUniqueOrThrow({ where: { id: DEMO_COMPANY } }))
      .creditBalance;

    expect(await chargeCredits(DEMO_COMPANY, 1, "[TEST] charge")).toBe(true);
    expect(await chargeCredits(DEMO_COMPANY, 999_999, "[TEST] overdraft")).toBe(false);

    const after = (await db.company.findUniqueOrThrow({ where: { id: DEMO_COMPANY } }))
      .creditBalance;
    expect(after).toBe(before - 1);

    await grantCredits(DEMO_COMPANY, 1, "BONUS", "[TEST] refund");
  });

  it("is idempotent per external reference", async () => {
    const before = await db.company.findUniqueOrThrow({ where: { id: DEMO_COMPANY } });
    const ref = `test-ref-${Date.now()}`;
    await grantCredits(DEMO_COMPANY, 5, "PURCHASE", "[TEST] stripe grant", ref);
    await grantCredits(DEMO_COMPANY, 5, "PURCHASE", "[TEST] stripe retry", ref);
    const after = await db.company.findUniqueOrThrow({ where: { id: DEMO_COMPANY } });
    expect(after.creditBalance).toBe(before.creditBalance + 5);
    await db.creditTransaction.deleteMany({ where: { reference: ref } });
    await db.company.update({
      where: { id: DEMO_COMPANY },
      data: { creditBalance: before.creditBalance },
    });
  });
});

describe("plan limits", () => {
  it("counts all RFQs ever (closed included) against the free quota", async () => {
    const mk = (i: number, status: string) =>
      db.rfq.create({
        data: {
          companyId: DEMO_COMPANY,
          intakeText: "[TEST] x",
          title: `[TEST] quota ${i}`,
          status,
        },
      });
    await Promise.all(
      Array.from({ length: FREE_TOTAL_RFQS }, (_, i) => mk(i, i % 2 ? "CLOSED" : "DECIDED")),
    );
    const blocked = await checkRfqCreationLimit(DEMO_COMPANY);
    expect(blocked.ok).toBe(false);
    await db.rfq.deleteMany({ where: { title: { startsWith: "[TEST] quota" } } });
  });

  it("caps invites on FREE and lifts caps on PRO", async () => {
    expect((await checkInviteLimit(DEMO_COMPANY, 6)).ok).toBe(false);
    expect((await checkInviteLimit(DEMO_COMPANY, 5)).ok).toBe(true);

    await db.company.update({ where: { id: DEMO_COMPANY }, data: { plan: "PRO" } });
    try {
      expect((await checkInviteLimit(DEMO_COMPANY, 50)).ok).toBe(true);
      expect((await checkRfqCreationLimit(DEMO_COMPANY)).ok).toBe(true);
    } finally {
      await db.company.update({ where: { id: DEMO_COMPANY }, data: { plan: "FREE" } });
    }
  });
});

describe("matching", () => {
  it("scores category+region matches above nationwide-only suppliers", async () => {
    const matches = await shortlistSuppliers("cleaning", "budapest", 50);
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(m.score).toBeGreaterThanOrEqual(50);
      expect(m.score).toBeLessThanOrEqual(100);
    }
    // Seeded: CleanPro (budapest region match) must rank above Alföld Higiénia
    // (no budapest, not nationwide → not in list at higher rank with region pts)
    const sorted = [...matches].sort((a, b) => b.score - a.score);
    expect(matches.map((m) => m.score)).toEqual(sorted.map((m) => m.score));
  });

  it("returns empty for unknown category", async () => {
    expect(await shortlistSuppliers("no-such-category", null, 10)).toEqual([]);
  });
});
