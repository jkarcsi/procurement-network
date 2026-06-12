import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { findOpenRfqsForSupplier } from "@/lib/matching";
import { joinOpenRfqAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import type { RfqSpec } from "@/lib/ai";

export const metadata: Metadata = {
  title: "Nyílt lehetőségek – Procura",
};

export default async function SupplierOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getSessionUser();
  const profile = user?.company?.supplierProfile;
  if (!user || user.role !== "SUPPLIER" || !profile) redirect("/login?next=/supplier/opportunities");

  const [rfqs, categoryCount] = await Promise.all([
    findOpenRfqsForSupplier(profile.id),
    db.supplierCategory.count({ where: { supplierId: profile.id } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nyílt lehetőségek</h1>
        <p className="mt-1 text-sm text-slate-500">
          Élő ajánlatkérések, amelyek illeszkednek a profilod kategóriáihoz és régióihoz – meghívás
          nélkül is jelentkezhetsz rájuk.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {rfqs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-600">
            Most nincs a profilodhoz illő nyílt ajánlatkérés.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {categoryCount === 0 ? (
              <>
                Még nincs kategória beállítva a profilodban –{" "}
                <Link href="/supplier/profile" className="text-indigo-600 hover:underline">
                  állítsd be a kategóriáidat és régióidat
                </Link>
                , hogy megjelenjenek a releváns lehetőségek.
              </>
            ) : (
              <>
                Minél több kategóriát és régiót fedsz le a{" "}
                <Link href="/supplier/profile" className="text-indigo-600 hover:underline">
                  profilodban
                </Link>
                , annál több lehetőséget látsz itt.
              </>
            )}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rfqs.map((rfq) => {
            const spec: RfqSpec | null = rfq.spec ? JSON.parse(rfq.spec) : null;
            return (
              <li key={rfq.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">{rfq.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {rfq.company.name} · {rfq.category?.name ?? "Egyéb"} ·{" "}
                      {rfq.region?.name ?? "régió nincs megadva"} · ajánlattételi határidő:{" "}
                      {formatDate(rfq.deadline)}
                    </p>
                    <p className="mt-2 text-sm text-slate-700 line-clamp-2">
                      {spec?.summary ?? rfq.intakeText}
                    </p>
                  </div>
                  <form action={joinOpenRfqAction} className="shrink-0">
                    <input type="hidden" name="rfqId" value={rfq.id} />
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                      Megnézem és ajánlatot adok
                    </button>
                  </form>
                </div>
                <p className="mt-3 text-xs text-slate-400">Közzétéve: {formatDate(rfq.createdAt)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
