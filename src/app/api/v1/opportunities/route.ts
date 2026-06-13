import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";
import { findOpenRfqsForSupplier } from "@/lib/matching";

// Live RFQs that match the supplier's profile and have no invite yet — the
// open opportunities they can self-apply to.
export async function GET(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (!auth.userId) return apiError(403, "User session token required");

  const profile = await db.supplierProfile.findUnique({ where: { companyId: auth.company.id } });
  if (!profile) return apiError(403, "Not a supplier company");

  const rfqs = await findOpenRfqsForSupplier(profile.id);
  return Response.json({
    data: rfqs.map((r) => {
      const spec = r.spec ? (JSON.parse(r.spec) as { summary?: string }) : null;
      return {
        id: r.id,
        title: r.title,
        summary: spec?.summary ?? r.intakeText,
        category: r.category?.name ?? null,
        region: r.region?.name ?? null,
        buyer: r.company.name,
        deadline: r.deadline?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      };
    }),
  });
}
