import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { formatDate, RFQ_STATUS } from "@/lib/format";
import { CATEGORIES } from "@/lib/taxonomy";

const PAGE_SIZE = 10;

function pageUrl(params: { q?: string; status?: string; category?: string }, page: number) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status) sp.set("status", params.status);
  if (params.category) sp.set("category", params.category);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}) {
  const { q, status: statusFilter, category, page: pageParam } = await searchParams;
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.companyId) redirect("/login?next=/dashboard");

  const where = {
    companyId: user.companyId,
    ...(q ? { title: { contains: q } } : {}),
    ...(statusFilter && RFQ_STATUS[statusFilter] ? { status: statusFilter } : {}),
    ...(category ? { categoryId: category } : {}),
  };

  const total = await db.rfq.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1), pageCount);

  const rfqs = await db.rfq.findMany({
    where,
    include: { category: true, region: true, _count: { select: { offers: true, invites: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const hasFilter = Boolean(q || statusFilter || category);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ajánlatkéréseim</h1>
          <p className="text-sm text-slate-500">{user.company?.name}</p>
        </div>
        <Link
          href="/rfq/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Új ajánlatkérés
        </Link>
      </div>

      <form className="mt-6 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Keresés cím szerint…"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Minden státusz</option>
          {Object.entries(RFQ_STATUS).map(([value, s]) => (
            <option key={value} value={value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={category ?? ""}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Minden kategória</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="bg-slate-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700">
          Szűrés
        </button>
        {hasFilter && (
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-indigo-700 self-center"
          >
            Törlés
          </Link>
        )}
      </form>

      {rfqs.length === 0 ? (
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-10 text-center">
          {hasFilter ? (
            <p className="text-slate-600">Nincs a szűrésnek megfelelő ajánlatkérés.</p>
          ) : (
            <>
              <p className="text-slate-600">Még nincs ajánlatkérésed.</p>
              <p className="mt-1 text-sm text-slate-400">
                Írd le egy mondatban, mire van szükséged, a többit a Procura intézi.
              </p>
              <Link
                href="/rfq/new"
                className="mt-4 inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700"
              >
                Első ajánlatkérés indítása
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Ajánlatkérés</th>
                <th className="px-4 py-3 font-medium">Kategória</th>
                <th className="px-4 py-3 font-medium">Régió</th>
                <th className="px-4 py-3 font-medium">Státusz</th>
                <th className="px-4 py-3 font-medium text-right">Meghívók</th>
                <th className="px-4 py-3 font-medium text-right">Ajánlatok</th>
                <th className="px-4 py-3 font-medium">Létrehozva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rfqs.map((rfq) => {
                const status = RFQ_STATUS[rfq.status] ?? RFQ_STATUS.READY;
                return (
                  <tr key={rfq.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/rfq/${rfq.id}`} className="font-medium text-indigo-700 hover:underline">
                        {rfq.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{rfq.category?.name ?? "–"}</td>
                    <td className="px-4 py-3 text-slate-600">{rfq.region?.name ?? "–"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{rfq._count.invites}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{rfq._count.offers}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(rfq.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            {total} találat · {page}/{pageCount}. oldal
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageUrl({ q, status: statusFilter, category }, page - 1)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 hover:border-indigo-600 hover:text-indigo-700"
              >
                ← Előző
              </Link>
            )}
            {page < pageCount && (
              <Link
                href={pageUrl({ q, status: statusFilter, category }, page + 1)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 hover:border-indigo-600 hover:text-indigo-700"
              >
                Következő →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
