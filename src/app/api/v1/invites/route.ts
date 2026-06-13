import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";

// The supplier's received RFQ invites, with enough RFQ detail to quote from.
export async function GET(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (!auth.userId) return apiError(403, "User session token required");

  const profile = await db.supplierProfile.findUnique({ where: { companyId: auth.company.id } });
  if (!profile) return apiError(403, "Not a supplier company");

  const invites = await db.rfqInvite.findMany({
    where: { supplierId: profile.id },
    include: { rfq: { include: { category: true, region: true, company: true } }, offer: true },
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  return Response.json({
    data: invites.map((inv) => {
      const spec = inv.rfq.spec ? (JSON.parse(inv.rfq.spec) as { summary?: string }) : null;
      return {
        id: inv.id,
        status: inv.status,
        source: inv.source,
        sentAt: inv.sentAt.toISOString(),
        rfq: {
          id: inv.rfq.id,
          title: inv.rfq.title,
          status: inv.rfq.status,
          summary: spec?.summary ?? inv.rfq.intakeText,
          category: inv.rfq.category?.name ?? null,
          region: inv.rfq.region?.name ?? null,
          buyer: inv.rfq.company.name,
          deadline: inv.rfq.deadline?.toISOString() ?? null,
        },
        offer: inv.offer
          ? { priceNet: inv.offer.priceNet, priceUnit: inv.offer.priceUnit, status: inv.offer.status }
          : null,
      };
    }),
  });
}
