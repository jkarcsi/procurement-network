import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import type { RfqSpec } from "@/lib/ai";

export const metadata: Metadata = {
  title: "Nyílt tenderek – Procura",
  description:
    "Élő, nyilvános ajánlatkérések magyar KKV-któl. Regisztrálj beszállítóként, és adj ajánlatot.",
};

// Public, no-auth tender board: live RFQs the buyer chose to publish. Drives
// inbound supplier registration.
export default async function TendersPage() {
  const rfqs = await db.rfq.findMany({
    where: {
      isPublic: true,
      status: "SENT",
      OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
    },
    include: { company: true, category: true, region: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Nyílt tenderek</h1>
        <p className="mt-2 text-slate-600">
          Élő ajánlatkérések magyar vállalkozásoktól. Regisztrálj beszállítóként, és adj ajánlatot –
          a profilodhoz illő további megkereséseket is megkapod.
        </p>
        <Link
          href="/register?role=SUPPLIER"
          className="mt-4 inline-block bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-indigo-700"
        >
          Beszállítói regisztráció
        </Link>
      </div>

      {rfqs.length === 0 ? (
        <p className="mt-12 text-center text-slate-500">Jelenleg nincs nyilvános tender.</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {rfqs.map((rfq) => {
            const spec: RfqSpec | null = rfq.spec ? JSON.parse(rfq.spec) : null;
            return (
              <li key={rfq.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900">{rfq.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {rfq.company.name} · {rfq.category?.name ?? "Egyéb"} ·{" "}
                  {rfq.region?.name ?? "régió nincs megadva"} · határidő: {formatDate(rfq.deadline)}
                </p>
                <p className="mt-2 text-sm text-slate-700 line-clamp-2">
                  {spec?.summary ?? rfq.intakeText}
                </p>
                <Link
                  href="/register?role=SUPPLIER"
                  className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
                >
                  Ajánlatot adnék →
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
