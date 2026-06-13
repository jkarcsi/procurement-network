import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { sendOfferAcceptedEmail, sendOfferReceivedEmail } from "./email";
import { notifyCompanyUsers, notifyUser } from "./notifications";
import { track } from "./analytics";

// Shared offer business logic used by both the web server actions and the
// mobile API, so submitting/accepting an offer always produces the same audit
// trail, emails, notifications, and analytics.

type InviteForOffer = Prisma.RfqInviteGetPayload<{
  include: { rfq: true; supplier: { include: { company: true } } };
}>;

export type SubmitOfferInput = {
  priceNet: number;
  priceUnit?: string | null;
  startDate?: string | null;
  validUntil?: string | null;
  notes?: string | null;
  companyName?: string | null;
  contactEmail?: string | null;
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitOffer(invite: InviteForOffer, input: SubmitOfferInput): Promise<SubmitResult> {
  if (invite.status === "OFFERED") return { ok: false, error: "Erre a megkeresésre már adtál ajánlatot." };
  if (invite.rfq.status === "DECIDED" || invite.rfq.status === "CLOSED") {
    return { ok: false, error: "Ez az ajánlatkérés már lezárult." };
  }
  if (!Number.isFinite(input.priceNet) || input.priceNet <= 0) {
    return { ok: false, error: "Adj meg érvényes nettó árat (Ft)." };
  }

  const priceUnit = (input.priceUnit ?? "").trim() || "egyösszegű";
  const companyName =
    invite.supplier?.company.name ?? ((input.companyName ?? "").trim() || invite.companyName);
  const contactEmail = (input.contactEmail ?? "").trim() || invite.email;

  await db.offer.create({
    data: {
      rfqId: invite.rfqId,
      inviteId: invite.id,
      companyName,
      contactEmail,
      priceNet: input.priceNet,
      priceUnit,
      startDate: (input.startDate ?? "").trim() || null,
      validUntil: (input.validUntil ?? "").trim() || null,
      notes: (input.notes ?? "").trim() || null,
    },
  });
  await db.rfqInvite.update({
    where: { id: invite.id },
    data: { status: "OFFERED", respondedAt: new Date() },
  });

  if (invite.supplierId && invite.supplier) {
    const hours = (Date.now() - invite.sentAt.getTime()) / 3_600_000;
    const n = invite.supplier.responseCount + 1;
    const prevAvg = invite.supplier.avgResponseHours ?? hours;
    await db.supplierProfile.update({
      where: { id: invite.supplierId },
      data: { responseCount: { increment: 1 }, avgResponseHours: (prevAvg * (n - 1) + hours) / n },
    });
  }

  await db.auditLog.create({
    data: {
      rfqId: invite.rfqId,
      actor: contactEmail,
      event: "OFFER_SUBMITTED",
      meta: `${companyName}: ${input.priceNet} Ft (${priceUnit})`,
    },
  });

  const buyerUser = invite.rfq.createdById
    ? await db.user.findUnique({ where: { id: invite.rfq.createdById } })
    : await db.user.findFirst({ where: { companyId: invite.rfq.companyId } });
  if (buyerUser) {
    await sendOfferReceivedEmail({
      to: buyerUser.email,
      rfqId: invite.rfqId,
      rfqTitle: invite.rfq.title,
      supplierCompany: companyName,
      priceText: `${input.priceNet.toLocaleString("hu-HU")} Ft (${priceUnit})`,
    });
    await notifyUser({
      userId: buyerUser.id,
      type: "OFFER_RECEIVED",
      message: `${companyName} ajánlatot adott: ${invite.rfq.title}`,
      linkUrl: `/rfq/${invite.rfqId}`,
    });
  }

  await track("offer_submitted", contactEmail, { source: invite.source });
  return { ok: true };
}

export type AcceptResult = { ok: true; rfqId: string } | { ok: false; error: string };

export async function acceptOffer(
  offerId: string,
  buyer: { id: string; email: string; companyId: string },
): Promise<AcceptResult> {
  const offer = await db.offer.findUnique({
    where: { id: offerId },
    include: { rfq: { include: { company: true } }, invite: true },
  });
  if (!offer || offer.rfq.companyId !== buyer.companyId) {
    return { ok: false, error: "Az ajánlat nem található." };
  }
  if (offer.rfq.status === "DECIDED" || offer.rfq.status === "CLOSED") {
    return { ok: false, error: "Ez az ajánlatkérés már lezárult." };
  }

  await db.offer.update({ where: { id: offer.id }, data: { status: "ACCEPTED" } });
  await db.offer.updateMany({
    where: { rfqId: offer.rfqId, id: { not: offer.id } },
    data: { status: "REJECTED" },
  });
  await db.rfq.update({ where: { id: offer.rfqId }, data: { status: "DECIDED" } });
  await db.auditLog.create({
    data: {
      rfqId: offer.rfqId,
      actor: buyer.email,
      event: "OFFER_ACCEPTED",
      meta: `${offer.companyName}: ${offer.priceNet} Ft (${offer.priceUnit})`,
    },
  });

  await sendOfferAcceptedEmail({
    to: offer.contactEmail,
    rfqId: offer.rfqId,
    rfqTitle: offer.rfq.title,
    supplierCompany: offer.companyName,
    buyerCompany: offer.rfq.company.name,
    token: offer.invite?.token ?? null,
  });
  if (offer.invite?.supplierId) {
    const supplierProfile = await db.supplierProfile.findUnique({
      where: { id: offer.invite.supplierId },
    });
    if (supplierProfile) {
      await notifyCompanyUsers({
        companyId: supplierProfile.companyId,
        type: "OFFER_ACCEPTED",
        message: `Elfogadták az ajánlatodat: ${offer.rfq.title} (${offer.rfq.company.name})`,
        linkUrl: offer.invite ? `/r/${offer.invite.token}` : undefined,
      });
    }
  }
  await track("offer_accepted", buyer.id, { priceNet: offer.priceNet });

  return { ok: true, rfqId: offer.rfqId };
}
