// Smoke test for the open opportunities flow: query logic + page render.
// Run: npm run smoke  (needs a seeded DB; HTTP checks need a running dev server)
// Test RFQs are created with a [SMOKE] prefix and deleted at the end.
import crypto from "crypto";
import { db } from "../src/lib/db";
import { findOpenRfqsForSupplier } from "../src/lib/matching";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("OK:", msg);
  }
}

async function main() {
  const buyer = await db.user.findUniqueOrThrow({ where: { email: "demo@vevo.hu" } });
  const supplierUser = await db.user.findUniqueOrThrow({ where: { email: "demo@beszallito.hu" } });
  const supplier = await db.supplierProfile.findUniqueOrThrow({
    where: { companyId: supplierUser.companyId! },
    include: { company: true },
  });

  const mk = (data: Record<string, unknown>) =>
    db.rfq.create({
      data: {
        companyId: buyer.companyId!,
        intakeText: "[SMOKE] test need",
        title: "[SMOKE] Office cleaning test",
        categoryId: "cleaning",
        regionId: "budapest",
        status: "SENT",
        ...data,
      },
    });

  const open = await mk({});
  const expired = await mk({ title: "[SMOKE] expired", deadline: new Date(Date.now() - 86_400_000) });
  const draft = await mk({ title: "[SMOKE] draft", status: "READY" });
  const otherCat = await mk({ title: "[SMOKE] other category", categoryId: "it-support" });
  const otherRegion = await mk({ title: "[SMOKE] other region", regionId: "zala" });

  try {
    const ids = (await findOpenRfqsForSupplier(supplier.id)).map((r) => r.id);
    assert(ids.includes(open.id), "live, matching RFQ shows up");
    assert(!ids.includes(expired.id), "RFQ past its deadline does not show up");
    assert(!ids.includes(draft.id), "READY (not yet sent) RFQ does not show up");
    assert(!ids.includes(otherCat.id), "RFQ in a non-matching category does not show up");
    assert(!ids.includes(otherRegion.id), "RFQ in a non-matching region does not show up");

    await db.rfqInvite.create({
      data: {
        rfqId: open.id,
        supplierId: supplier.id,
        email: supplier.email,
        companyName: supplier.company.name,
        token: crypto.randomBytes(24).toString("base64url"),
        source: "SELF",
      },
    });
    const after = (await findOpenRfqsForSupplier(supplier.id)).map((r) => r.id);
    assert(!after.includes(open.id), "RFQ with an existing invite/application drops off the list");

    // HTTP render with a signed session cookie (only with a running dev server).
    // The expected heading is Hungarian because the UI targets the Hungarian market.
    try {
      const secret = process.env.AUTH_SECRET ?? "dev-only-secret-change-in-production";
      const payload = `${supplierUser.id}.${Date.now() + 60_000}`;
      const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
      const res = await fetch(`${BASE}/supplier/opportunities`, {
        headers: { cookie: `session=${payload}.${sig}` },
      });
      const html = await res.text();
      assert(res.status === 200, `page returns 200 (got: ${res.status})`);
      assert(html.includes("Nyílt lehetőségek"), "page heading renders");

      const anon = await fetch(`${BASE}/supplier/opportunities`, { redirect: "manual" });
      assert(anon.status >= 300 && anon.status < 400, `unauthenticated request redirects (got: ${anon.status})`);
    } catch {
      console.log(`SKIP: no dev server running at ${BASE} – HTTP checks skipped`);
    }
  } finally {
    await db.rfq.deleteMany({ where: { title: { startsWith: "[SMOKE]" } } });
  }
}

main().then(() => process.exit(process.exitCode ?? 0));
