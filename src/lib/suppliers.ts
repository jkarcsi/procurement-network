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

// Links any prior cold invites (sent to this email with no registered supplier
// yet) to a newly registered supplier, pre-fills the profile's categories and
// regions from those RFQs, and reflects the history in the response stats.
// Returns how many invites were claimed.
export async function claimInvitesForSupplier(
  profileId: string,
  email: string,
  companyName: string,
): Promise<number> {
  const invites = await db.rfqInvite.findMany({
    where: { supplierId: null, email: email.toLowerCase() },
    include: { rfq: true, offer: true },
  });
  if (invites.length === 0) return 0;

  await db.rfqInvite.updateMany({
    where: { id: { in: invites.map((i) => i.id) } },
    data: { supplierId: profileId, companyName },
  });

  const categoryIds = [...new Set(invites.map((i) => i.rfq.categoryId).filter((x): x is string => !!x))];
  const regionIds = [...new Set(invites.map((i) => i.rfq.regionId).filter((x): x is string => !!x))];
  for (const categoryId of categoryIds) {
    await db.supplierCategory.upsert({
      where: { supplierId_categoryId: { supplierId: profileId, categoryId } },
      update: {},
      create: { supplierId: profileId, categoryId },
    });
  }
  for (const regionId of regionIds) {
    await db.supplierRegion.upsert({
      where: { supplierId_regionId: { supplierId: profileId, regionId } },
      update: {},
      create: { supplierId: profileId, regionId },
    });
  }

  const responded = invites.filter((i) => i.offer || i.status === "OFFERED").length;
  await db.supplierProfile.update({
    where: { id: profileId },
    data: { inviteCount: { increment: invites.length }, responseCount: { increment: responded } },
  });

  for (const inv of invites) {
    await db.auditLog.create({
      data: { rfqId: inv.rfqId, actor: email, event: "SUPPLIER_CLAIMED", meta: companyName },
    });
  }
  return invites.length;
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
