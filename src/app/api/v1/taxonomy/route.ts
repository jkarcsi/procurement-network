import { CATEGORIES, REGIONS } from "@/lib/taxonomy";
import { authenticateBearer, apiError } from "@/lib/apiAuth";

// Category and region reference data for client pickers (e.g. the mobile
// new-RFQ form). Kept behind auth for a uniform API surface.
export async function GET(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);

  return Response.json({
    categories: CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
    regions: REGIONS,
  });
}
