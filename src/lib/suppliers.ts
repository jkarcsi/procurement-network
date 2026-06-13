import { db } from "./db";
import { CATEGORIES, REGIONS } from "./taxonomy";

// Supplier profile read/update shared by the web action and the mobile API.
// Category/region ids are validated against the taxonomy so a direct API call
// can't insert unknown ids (which would otherwise break the FK).

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.id));
const VALID_REGIONS = new Set(REGIONS.map((r) => r.id));

export type SupplierProfileInput = {
  description?: string | null;
  phone?: string | null;
  website?: string | null;
  certifications?: string | null;
  nationwide?: boolean;
  categoryIds?: string[];
  regionIds?: string[];
};

export async function updateSupplierProfile(profileId: string, input: SupplierProfileInput) {
  await db.supplierProfile.update({
    where: { id: profileId },
    data: {
      phone: (input.phone ?? "").trim() || null,
      website: (input.website ?? "").trim() || null,
      description: (input.description ?? "").trim() || null,
      certifications: (input.certifications ?? "").trim() || null,
      nationwide: Boolean(input.nationwide),
    },
  });

  const categoryIds = (input.categoryIds ?? []).filter((id) => VALID_CATEGORIES.has(id));
  const regionIds = (input.regionIds ?? []).filter((id) => VALID_REGIONS.has(id));

  await db.supplierCategory.deleteMany({ where: { supplierId: profileId } });
  await db.supplierRegion.deleteMany({ where: { supplierId: profileId } });
  if (categoryIds.length > 0) {
    await db.supplierCategory.createMany({
      data: categoryIds.map((categoryId) => ({ supplierId: profileId, categoryId })),
    });
  }
  if (regionIds.length > 0) {
    await db.supplierRegion.createMany({
      data: regionIds.map((regionId) => ({ supplierId: profileId, regionId })),
    });
  }
}

export async function getSupplierProfile(profileId: string) {
  const [profile, categories, regions] = await Promise.all([
    db.supplierProfile.findUniqueOrThrow({ where: { id: profileId } }),
    db.supplierCategory.findMany({ where: { supplierId: profileId } }),
    db.supplierRegion.findMany({ where: { supplierId: profileId } }),
  ]);
  return {
    description: profile.description,
    phone: profile.phone,
    website: profile.website,
    certifications: profile.certifications,
    nationwide: profile.nationwide,
    categoryIds: categories.map((c) => c.categoryId),
    regionIds: regions.map((r) => r.regionId),
  };
}
