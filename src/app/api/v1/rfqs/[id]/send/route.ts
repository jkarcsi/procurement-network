import { authenticateBearer, apiError } from "@/lib/apiAuth";
import { sendRfq } from "@/lib/rfqs";

// Sends a READY RFQ to the selected suppliers (and optional extra emails).
// Shares the web logic in src/lib/rfqs.ts.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (auth.company.type !== "BUYER") return apiError(403, "Only buyer companies can send RFQs");

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const supplierIds = Array.isArray(body.supplierIds) ? body.supplierIds.map(String) : [];
  const extraEmails = Array.isArray(body.extraEmails) ? body.extraEmails.map(String) : [];

  const result = await sendRfq(
    id,
    { id: auth.userId ?? auth.actor, email: auth.actor, companyId: auth.company.id },
    { supplierIds, extraEmails },
  );
  if (!result.ok) return apiError(400, result.error);
  return Response.json({ ok: true, rfqId: result.rfqId });
}
