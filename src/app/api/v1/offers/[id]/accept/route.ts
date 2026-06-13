import { authenticateBearer, apiError } from "@/lib/apiAuth";
import { acceptOffer } from "@/lib/offers";

// Buyer accepts an offer (decides the RFQ). Shares the web logic in
// src/lib/offers.ts, so emails/notifications/audit are identical.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (auth.company.type !== "BUYER") return apiError(403, "Only buyer companies can accept offers");

  const { id } = await ctx.params;
  const result = await acceptOffer(id, {
    id: auth.userId ?? auth.actor,
    email: auth.actor,
    companyId: auth.company.id,
  });
  if (!result.ok) return apiError(400, result.error);
  return Response.json({ ok: true, rfqId: result.rfqId });
}
