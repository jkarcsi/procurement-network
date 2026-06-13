import crypto from "crypto";
import { db } from "./db";
import { shortlistSuppliers } from "./matching";
import { sendRfqInviteEmail } from "./email";
import { notifyCompanyUsers } from "./notifications";
import { track } from "./analytics";
import { checkInviteLimit } from "./limits";

// Shared RFQ send-out logic used by both the web server action and the mobile
// API, so invites, emails, notifications, audit, and analytics are identical.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type SendRfqResult = { ok: true; rfqId: string } | { ok: false; error: string };

export async function sendRfq(
  rfqId: string,
  buyer: { id: string; email: string; companyId: string },
  input: { supplierIds: string[]; extraEmails: string[] },
): Promise<SendRfqResult> {
  const rfq = await db.rfq.findUnique({
    where: { id: rfqId },
    include: { company: true, category: true },
  });
  if (!rfq || rfq.companyId !== buyer.companyId || rfq.status !== "READY") {
    return { ok: false, error: "Ez az ajánlatkérés nem küldhető ki." };
  }

  const supplierIds = input.supplierIds;
  const extraEmails = input.extraEmails.map((e) => e.trim()).filter((e) => EMAIL_RE.test(e));
  if (supplierIds.length === 0 && extraEmails.length === 0) {
    return { ok: false, error: "Válassz legalább egy beszállítót vagy adj meg e-mail címet." };
  }

  const limit = await checkInviteLimit(buyer.companyId, supplierIds.length + extraEmails.length);
  if (!limit.ok) return { ok: false, error: limit.error };

  const spec = rfq.spec ? (JSON.parse(rfq.spec) as { summary?: string }) : {};
  const summary = spec.summary ?? rfq.intakeText;
  const deadlineStr = rfq.deadline ? rfq.deadline.toISOString().slice(0, 10) : null;

  // Recompute scores for the audit trail
  const matches = rfq.categoryId ? await shortlistSuppliers(rfq.categoryId, rfq.regionId, 100) : [];

  for (const supplierId of supplierIds) {
    const supplier = await db.supplierProfile.findUnique({
      where: { id: supplierId },
      include: { company: true },
    });
    if (!supplier) continue;
    const match = matches.find((m) => m.supplierId === supplierId);
    const token = crypto.randomBytes(24).toString("base64url");
    await db.rfqInvite.create({
      data: {
        rfqId: rfq.id,
        supplierId: supplier.id,
        email: supplier.email,
        companyName: supplier.company.name,
        token,
        matchScore: match?.score ?? null,
        matchReason: match?.reason ?? null,
      },
    });
    await db.supplierProfile.update({
      where: { id: supplier.id },
      data: { inviteCount: { increment: 1 } },
    });
    await sendRfqInviteEmail({
      to: supplier.email,
      companyName: supplier.company.name,
      rfqId: rfq.id,
      rfqTitle: rfq.title,
      buyerCompany: rfq.company.name,
      summary,
      deadline: deadlineStr,
      token,
    });
    await notifyCompanyUsers({
      companyId: supplier.companyId,
      type: "RFQ_INVITE",
      message: `Új ajánlatkérés érkezett: ${rfq.title} (${rfq.company.name})`,
      linkUrl: `/r/${token}`,
    });
  }

  for (const email of extraEmails) {
    const token = crypto.randomBytes(24).toString("base64url");
    await db.rfqInvite.create({
      data: {
        rfqId: rfq.id,
        email,
        companyName: email,
        token,
        matchReason: "kézzel hozzáadott külső beszállító",
      },
    });
    await sendRfqInviteEmail({
      to: email,
      companyName: email,
      rfqId: rfq.id,
      rfqTitle: rfq.title,
      buyerCompany: rfq.company.name,
      summary,
      deadline: deadlineStr,
      token,
    });
  }

  await db.rfq.update({ where: { id: rfq.id }, data: { status: "SENT" } });
  await db.auditLog.create({
    data: {
      rfqId: rfq.id,
      actor: buyer.email,
      event: "RFQ_SENT",
      meta: `${supplierIds.length} hálózati + ${extraEmails.length} külső beszállító`,
    },
  });
  await track("rfq_sent", buyer.id, { invites: supplierIds.length + extraEmails.length });

  return { ok: true, rfqId: rfq.id };
}
