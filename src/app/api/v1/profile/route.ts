import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";
import { getSupplierProfile, updateSupplierProfile } from "@/lib/suppliers";

async function supplierProfile(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return { error: apiError(auth.status, auth.message) };
  if (!auth.userId) return { error: apiError(403, "User session token required") };
  const profile = await db.supplierProfile.findUnique({ where: { companyId: auth.company.id } });
  if (!profile) return { error: apiError(403, "Not a supplier company") };
  return { profileId: profile.id };
}

// The supplier's matching profile (categories, regions, certifications, …).
export async function GET(req: Request) {
  const ctx = await supplierProfile(req);
  if (ctx.error) return ctx.error;
  return Response.json({ data: await getSupplierProfile(ctx.profileId) });
}

// Updates the matching profile; returns the saved state.
export async function PUT(req: Request) {
  const ctx = await supplierProfile(req);
  if (ctx.error) return ctx.error;

  const body = await req.json().catch(() => ({}));
  await updateSupplierProfile(ctx.profileId, {
    description: body.description,
    phone: body.phone,
    website: body.website,
    certifications: body.certifications,
    nationwide: body.nationwide,
    categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds.map(String) : [],
    regionIds: Array.isArray(body.regionIds) ? body.regionIds.map(String) : [],
  });
  return Response.json({ data: await getSupplierProfile(ctx.profileId) });
}
