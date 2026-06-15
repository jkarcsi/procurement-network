import { db } from "./db";

// Buyer reviews the winning supplier after the RFQ is decided. The denormalized
// ratingSum/ratingCount on the supplier profile feed the matching score.

export type ReviewResult = { ok: true } | { ok: false; error: string };

export async function submitReview(
  rfqId: string,
  buyer: { companyId: string },
  rating: number,
  comment: string | null,
): Promise<ReviewResult> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Az értékelés 1 és 5 csillag között legyen." };
  }

  const rfq = await db.rfq.findUnique({
    where: { id: rfqId },
    include: { offers: { where: { status: "ACCEPTED" }, include: { invite: true } }, review: true },
  });
  if (!rfq || rfq.companyId !== buyer.companyId) {
    return { ok: false, error: "Az ajánlatkérés nem található." };
  }
  if (rfq.status !== "DECIDED") {
    return { ok: false, error: "Csak eldöntött ajánlatkérést értékelhetsz." };
  }
  if (rfq.review) {
    return { ok: false, error: "Ezt az ajánlatkérést már értékelted." };
  }

  const supplierId = rfq.offers[0]?.invite?.supplierId ?? null;
  if (!supplierId) {
    return { ok: false, error: "A nyertes beszállító nem regisztrált, így nem értékelhető." };
  }

  await db.$transaction([
    db.review.create({
      data: { rfqId, supplierId, reviewerCompanyId: buyer.companyId, rating, comment: comment?.trim() || null },
    }),
    db.supplierProfile.update({
      where: { id: supplierId },
      data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 } },
    }),
    db.auditLog.create({
      data: { rfqId, actor: "buyer", event: "REVIEW_SUBMITTED", meta: `${rating}★` },
    }),
  ]);

  return { ok: true };
}

export function averageRating(sum: number, count: number): number | null {
  return count > 0 ? Math.round((sum / count) * 10) / 10 : null;
}
