import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";
import { joinOpenRfq } from "@/lib/rfqs";

// Supplier self-applies to an open RFQ. Returns the reply token (the new
// invite); the supplier then submits an offer via /api/v1/invites/[id]/offer.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (!auth.userId) return apiError(403, "User session token required");

  const profile = await db.supplierProfile.findUnique({ where: { companyId: auth.company.id } });
  if (!profile) return apiError(403, "Not a supplier company");

  const { id } = await ctx.params;
  const result = await joinOpenRfq(id, {
    id: profile.id,
    email: profile.email,
    nationwide: profile.nationwide,
    companyName: auth.company.name,
  });
  if (!result.ok) return apiError(400, result.error);
  return Response.json({ ok: true, token: result.token });
}
