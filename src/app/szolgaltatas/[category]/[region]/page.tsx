import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CATEGORIES, REGIONS } from "@/lib/taxonomy";

type Params = { category: string; region: string };

function lookup(category: string, region: string) {
  const cat = CATEGORIES.find((c) => c.id === category);
  const reg = REGIONS.find((r) => r.id === region);
  return cat && reg ? { cat, reg } : null;
}

// Pre-render every category × region landing page for SEO.
export function generateStaticParams(): Params[] {
  return CATEGORIES.flatMap((c) => REGIONS.map((r) => ({ category: c.id, region: r.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, region } = await params;
  const found = lookup(category, region);
  if (!found) return { title: "Procura" };
  const title = `${found.cat.name} – ${found.reg.name} | Ajánlatkérés a Procurán`;
  return {
    title,
    description: `Kérj ingyenes ajánlatot ${found.cat.name.toLowerCase()} szolgáltatásra ${found.reg.name} területén. Több beszállító, összehasonlítható ajánlatok, a döntés a tiéd.`,
    alternates: { canonical: `/szolgaltatas/${category}/${region}` },
  };
}

export default async function ServiceRegionPage({ params }: { params: Promise<Params> }) {
  const { category, region } = await params;
  const found = lookup(category, region);
  if (!found) notFound();
  const { cat, reg } = found;

  const supplierCount = await db.supplierCategory.count({
    where: {
      categoryId: cat.id,
      supplier: { OR: [{ nationwide: true }, { regions: { some: { regionId: reg.id } } }] },
    },
  });

  const intake = `Keresek ${cat.name.toLowerCase()} szolgáltatást ${reg.name} területén.`;
  const otherRegions = REGIONS.filter((r) => r.id !== reg.id).slice(0, 8);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <p className="text-sm text-indigo-600 font-medium">{reg.name}</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">
        {cat.name} – {reg.name}
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Kérj ingyenes, kötelezettség nélküli ajánlatot {cat.name.toLowerCase()} szolgáltatásra{" "}
        {reg.name} területén. Írd le egy mondatban az igényed, a Procura strukturált
        ajánlatkérést készít, és összehasonlítható formában hozza vissza az ajánlatokat.
      </p>

      {supplierCount > 0 && (
        <p className="mt-4 text-sm text-slate-500">
          Jelenleg <span className="font-semibold text-slate-700">{supplierCount}</span> beszállító
          érhető el ebben a kategóriában és régióban.
        </p>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href={`/rfq/new?text=${encodeURIComponent(intake)}`}
          className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 text-center"
        >
          Ajánlatot kérek
        </Link>
        <Link
          href="/register?role=SUPPLIER"
          className="border border-slate-300 text-slate-700 font-medium px-6 py-3 rounded-xl hover:border-indigo-600 hover:text-indigo-700 text-center"
        >
          Beszállító vagyok
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          {cat.name} más régiókban
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {otherRegions.map((r) => (
            <Link
              key={r.id}
              href={`/szolgaltatas/${cat.id}/${r.id}`}
              className="text-sm bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full hover:border-indigo-300 hover:text-indigo-700"
            >
              {cat.name} – {r.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Más szolgáltatások {reg.name} területén
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.id !== cat.id).map((c) => (
            <Link
              key={c.id}
              href={`/szolgaltatas/${c.id}/${reg.id}`}
              className="text-sm bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full hover:border-indigo-300 hover:text-indigo-700"
            >
              {c.name} – {reg.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
