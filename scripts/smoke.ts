// Füstteszt a nyílt lehetőségek flow-ra: lekérdezés-logika + oldal-render.
// Futtatás: npm run smoke  (seedelt DB kell; a HTTP-ellenőrzésekhez futó dev szerver)
// A teszt-RFQ-kat [SMOKE] prefixszel hozza létre és a végén törli.
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
        intakeText: "[SMOKE] teszt igény",
        title: "[SMOKE] Irodatakarítás teszt",
        categoryId: "takaritas",
        regionId: "budapest",
        status: "SENT",
        ...data,
      },
    });

  const open = await mk({});
  const expired = await mk({ title: "[SMOKE] lejárt", deadline: new Date(Date.now() - 86_400_000) });
  const draft = await mk({ title: "[SMOKE] piszkozat", status: "READY" });
  const otherCat = await mk({ title: "[SMOKE] más kategória", categoryId: "it-support" });

  try {
    const ids = (await findOpenRfqsForSupplier(supplier.id)).map((r) => r.id);
    assert(ids.includes(open.id), "élő, illeszkedő RFQ megjelenik");
    assert(!ids.includes(expired.id), "lejárt határidejű RFQ nem jelenik meg");
    assert(!ids.includes(draft.id), "READY (még nem kiküldött) RFQ nem jelenik meg");
    assert(!ids.includes(otherCat.id), "nem illeszkedő kategóriájú RFQ nem jelenik meg");

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
    assert(!after.includes(open.id), "meghívóval/jelentkezéssel rendelkező RFQ kikerül a listából");

    // HTTP-render aláírt session cookie-val (csak futó dev szerver mellett)
    try {
      const secret = process.env.AUTH_SECRET ?? "dev-only-secret-change-in-production";
      const payload = `${supplierUser.id}.${Date.now() + 60_000}`;
      const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
      const res = await fetch(`${BASE}/supplier/opportunities`, {
        headers: { cookie: `session=${payload}.${sig}` },
      });
      const html = await res.text();
      assert(res.status === 200, `oldal 200-at ad (kapott: ${res.status})`);
      assert(html.includes("Nyílt lehetőségek"), "oldal címe renderelődik");

      const anon = await fetch(`${BASE}/supplier/opportunities`, { redirect: "manual" });
      assert(anon.status >= 300 && anon.status < 400, `bejelentkezés nélkül redirect (kapott: ${anon.status})`);
    } catch {
      console.log(`SKIP: nem fut dev szerver a ${BASE} címen – HTTP-ellenőrzések kihagyva`);
    }
  } finally {
    await db.rfq.deleteMany({ where: { title: { startsWith: "[SMOKE]" } } });
  }
}

main().then(() => process.exit(process.exitCode ?? 0));
