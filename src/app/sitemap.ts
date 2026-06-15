import type { MetadataRoute } from "next";
import { CATEGORIES, REGIONS } from "@/lib/taxonomy";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = ["", "/pricing", "/terms", "/privacy", "/tenders", "/register", "/login"];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${BASE_URL}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.6,
  }));

  // Programmatic category × region landing pages.
  const serviceEntries: MetadataRoute.Sitemap = CATEGORIES.flatMap((c) =>
    REGIONS.map((r) => ({
      url: `${BASE_URL}/szolgaltatas/${c.id}/${r.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  );

  return [...staticEntries, ...serviceEntries];
}
