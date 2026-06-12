import { db } from "@/lib/db";
import { authenticateApiKey, apiError } from "@/lib/apiAuth";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  const company = auth.company;

  const { id } = await ctx.params;
  const rfq = await db.rfq.findUnique({
    where: { id },
    include: {
      category: true,
      region: true,
      offers: { orderBy: { priceNet: "asc" } },
      invites: { orderBy: { sentAt: "asc" } },
    },
  });
  if (!rfq || rfq.companyId !== company.id) return apiError(404, "RFQ not found");

  return Response.json({
    data: {
      id: rfq.id,
      title: rfq.title,
      status: rfq.status,
      intakeText: rfq.intakeText,
      category: rfq.category ? { id: rfq.category.id, name: rfq.category.name } : null,
      region: rfq.region ? { id: rfq.region.id, name: rfq.region.name } : null,
      deadline: rfq.deadline?.toISOString() ?? null,
      spec: rfq.spec ? JSON.parse(rfq.spec) : null,
      createdAt: rfq.createdAt.toISOString(),
      invites: rfq.invites.map((i) => ({
        id: i.id,
        companyName: i.companyName,
        status: i.status,
        sentAt: i.sentAt.toISOString(),
      })),
      offers: rfq.offers.map((o) => ({
        id: o.id,
        companyName: o.companyName,
        priceNet: o.priceNet,
        priceUnit: o.priceUnit,
        startDate: o.startDate,
        validUntil: o.validUntil,
        notes: o.notes,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
    },
  });
}
