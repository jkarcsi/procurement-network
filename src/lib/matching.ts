import { db } from "./db";

// AI supplier shortlist a riport logikája szerint: kategória + régió + múltbeli
// reakciók (válaszarány) alapján pontoz, determinisztikusan és auditálhatóan.

export type SupplierMatch = {
  supplierId: string;
  companyName: string;
  email: string;
  score: number;
  reason: string;
  certifications: string | null;
  regionNames: string[];
  responseRate: number | null;
};

export async function shortlistSuppliers(
  categoryId: string,
  regionId: string | null,
  limit = 10,
): Promise<SupplierMatch[]> {
  const suppliers = await db.supplierProfile.findMany({
    where: { categories: { some: { categoryId } } },
    include: {
      company: true,
      regions: { include: { region: true } },
    },
  });

  const scored = suppliers.map((s) => {
    let score = 50;
    const reasons: string[] = ["kategória egyezés"];

    const regionMatch = regionId ? s.regions.some((r) => r.regionId === regionId) : false;
    if (regionMatch) {
      score += 30;
      reasons.push("régió egyezés");
    } else if (s.nationwide) {
      score += 20;
      reasons.push("országos lefedettség");
    }

    const responseRate = s.inviteCount > 0 ? s.responseCount / s.inviteCount : null;
    if (responseRate !== null) {
      score += Math.round(responseRate * 15);
      if (responseRate >= 0.5) reasons.push("megbízható válaszadó");
    }

    if (s.certifications) {
      score += 5;
      reasons.push("tanúsítvánnyal rendelkezik");
    }

    return {
      supplierId: s.id,
      companyName: s.company.name,
      email: s.email,
      score,
      reason: reasons.join(", "),
      certifications: s.certifications,
      regionNames: s.regions.map((r) => r.region.name),
      responseRate,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
