import { db } from "./db";
import { sendOfferAcceptedEmail } from "./email";
import { notifyCompanyUsers } from "./notifications";
import { track } from "./analytics";

// Shared offer business logic used by both the web server actions and the
// mobile API, so accepting an offer always produces the same audit trail,
// emails, notifications, and analytics.

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
