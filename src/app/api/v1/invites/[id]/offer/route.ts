import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";
import { submitOffer } from "@/lib/offers";

// Supplier submits an offer to one of their own invites. Shares the web
// submission logic in src/lib/offers.ts.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (!auth.userId) return apiError(403, "User session token required");

  const profile = await db.supplierProfile.findUnique({ where: { companyId: auth.company.id } });
  if (!profile) return apiError(403, "Not a supplier company");

  const { id } = await ctx.params;
  const invite = await db.rfqInvite.findUnique({
    where: { id },
    include: { rfq: true, supplier: { include: { company: true } } },
  });
  if (!invite || invite.supplierId !== profile.id) return apiError(404, "Invite not found");

  const body = await req.json().catch(() => ({}));
  const result = await submitOffer(invite, {
    priceNet: Number(body.priceNet),
    priceUnit: body.priceUnit,
    startDate: body.startDate,
    validUntil: body.validUntil,
    notes: body.notes,
  });
  if (!result.ok) return apiError(400, result.error);
  return Response.json({ ok: true });
}
