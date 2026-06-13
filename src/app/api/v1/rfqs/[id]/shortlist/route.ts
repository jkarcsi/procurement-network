import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";
import { shortlistSuppliers } from "@/lib/matching";

// Ranked supplier shortlist for a buyer's READY RFQ, to pick recipients from.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);

  const { id } = await ctx.params;
  const rfq = await db.rfq.findUnique({ where: { id } });
  if (!rfq || rfq.companyId !== auth.company.id) return apiError(404, "RFQ not found");

  const matches =
    rfq.status === "READY" && rfq.categoryId
      ? await shortlistSuppliers(rfq.categoryId, rfq.regionId, 20)
      : [];

  return Response.json({
    data: matches.map((m) => ({
      supplierId: m.supplierId,
      companyName: m.companyName,
      score: m.score,
      reason: m.reason,
      certifications: m.certifications,
      regionNames: m.regionNames,
      responseRate: m.responseRate,
    })),
  });
}
