import crypto from "crypto";
import { db } from "./db";
import { clarifyIntake } from "./ai";

// Embeddable quote-request widget: a buyer puts an iframe on their own site;
// submissions create a READY RFQ in their Procura account (they review before
// sending). Identified by a public embed token (distinct from the secret API
// key); RFQs are created as READY, never auto-sent.

export async function ensureEmbedToken(companyId: string): Promise<string> {
  const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });
  if (company.embedToken) return company.embedToken;
  for (let i = 0; i < 6; i++) {
    const token = crypto.randomBytes(12).toString("base64url");
    try {
      await db.company.update({ where: { id: companyId }, data: { embedToken: token } });
      return token;
    } catch {
      // unique collision — retry
    }
  }
  throw new Error("could not generate an embed token");
}

export async function createEmbeddedRfq(companyId: string, intakeText: string) {
  const clarify = await clarifyIntake(intakeText);
  const category = clarify.categoryId
    ? await db.category.findUnique({ where: { id: clarify.categoryId } })
    : null;
  const region = clarify.regionId
    ? await db.region.findUnique({ where: { id: clarify.regionId } })
    : null;

  return db.rfq.create({
    data: {
      companyId,
      intakeText,
      title: clarify.title || intakeText.slice(0, 80),
      categoryId: category?.id ?? null,
      regionId: region?.id ?? null,
      status: "READY",
      spec: JSON.stringify({
        summary: intakeText,
        scope: [],
        location: region?.name ?? "Egyeztetés alapján",
        schedule: "Egyeztetés alapján",
        contractType: "Egyeztetés alapján",
        requirements: [],
        notes: "Beágyazott űrlapról érkezett.",
      }),
      auditLogs: { create: { actor: "embed", event: "RFQ_CREATED", meta: "beágyazott űrlap" } },
    },
  });
}
