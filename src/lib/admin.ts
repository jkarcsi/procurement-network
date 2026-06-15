import { redirect } from "next/navigation";
import { getSessionUser } from "./auth";
import { db } from "./db";
import { CATEGORIES, REGIONS } from "./taxonomy";

// Every /admin page calls this itself (project convention: no middleware).
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/login?next=/admin");
  return user;
}

export type SupplyGapRow = {
  id: string;
  name: string;
  demand: number; // RFQs in this category/region
  supply: number; // suppliers covering it (incl. nationwide for regions)
  gap: boolean; // demand present but supply thin
};

// Demand (RFQs) vs. supply (suppliers) per category and per region, flagging
// gaps to target supplier acquisition (cold outreach / lead-discovery).
export async function getSupplyGaps(): Promise<{ categories: SupplyGapRow[]; regions: SupplyGapRow[] }> {
  const [rfqByCat, supByCat, rfqByRegion, supByRegion, nationwide] = await Promise.all([
    db.rfq.groupBy({ by: ["categoryId"], _count: true }),
    db.supplierCategory.groupBy({ by: ["categoryId"], _count: true }),
    db.rfq.groupBy({ by: ["regionId"], _count: true }),
    db.supplierRegion.groupBy({ by: ["regionId"], _count: true }),
    db.supplierProfile.count({ where: { nationwide: true } }),
  ]);

  const catDemand = new Map(rfqByCat.map((r) => [r.categoryId, r._count]));
  const catSupply = new Map(supByCat.map((r) => [r.categoryId, r._count]));
  const regDemand = new Map(rfqByRegion.map((r) => [r.regionId, r._count]));
  const regSupply = new Map(supByRegion.map((r) => [r.regionId, r._count]));

  const flag = (demand: number, supply: number) => demand > 0 && supply < Math.max(2, demand);

  const categories: SupplyGapRow[] = CATEGORIES.map((c) => {
    const demand = catDemand.get(c.id) ?? 0;
    const supply = catSupply.get(c.id) ?? 0;
    return { id: c.id, name: c.name, demand, supply, gap: flag(demand, supply) };
  }).sort((a, b) => b.demand - a.demand || a.supply - b.supply);

  const regions: SupplyGapRow[] = REGIONS.map((r) => {
    const demand = regDemand.get(r.id) ?? 0;
    // Nationwide suppliers serve every region.
    const supply = (regSupply.get(r.id) ?? 0) + nationwide;
    return { id: r.id, name: r.name, demand, supply, gap: flag(demand, supply) };
  }).sort((a, b) => b.demand - a.demand || a.supply - b.supply);

  return { categories, regions };
}
