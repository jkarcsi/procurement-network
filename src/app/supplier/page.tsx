import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { formatDateTime, INVITE_STATUS } from "@/lib/format";
import { findOpenRfqsForSupplier } from "@/lib/matching";

const PAGE_SIZE = 10;

function pageUrl(params: { q?: string; status?: string }, page: number) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status) sp.set("status", params.status);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/supplier?${qs}` : "/supplier";
}

export default async function SupplierPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status: statusFilter, page: pageParam } = await searchParams;
  const user = await getSessionUser();
  const profile = user?.company?.supplierProfile;
  if (!user || user.role !== "SUPPLIER" || !profile) redirect("/login?next=/supplier");

  const where = {
    supplierId: profile.id,
    ...(statusFilter && INVITE_STATUS[statusFilter] ? { status: statusFilter } : {}),
    ...(q ? { rfq: { title: { contains: q } } } : {}),
  };

  const [total, categories, openRfqs] = await Promise.all([
    db.rfqInvite.count({ where }),
    db.supplierCategory.findMany({
      where: { supplierId: profile.id },
      include: { category: true },
    }),
    findOpenRfqsForSupplier(profile.id),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1), pageCount);

  const invites = await db.rfqInvite.findMany({
    where,
    include: { rfq: { include: { category: true, region: true, company: true } } },
    orderBy: { sentAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const hasFilter = Boolean(q || statusFilter);
  const responseRate =
    profile.inviteCount > 0 ? Math.round((profile.responseCount / profile.inviteCount) * 100) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Beszállítói portál</h1>
          <p className="text-sm text-slate-500">
            {user.company?.name} · {categories.map((c) => c.category.name).join(", ") || "nincs kategória beállítva"}
          </p>
        </div>
        <Link href="/supplier/profile" className="text-sm text-indigo-600 hover:underline">
          Profil szerkesztése →
        </Link>
      </div>

      {openRfqs.length > 0 && (
        <Link
          href="/supplier/opportunities"
          className="block bg-indigo-50 border border-indigo-200 rounded-2xl p-4 hover:bg-indigo-100"
        >
          <p className="text-sm font-medium text-indigo-900">
            🔎 {openRfqs.length} nyílt ajánlatkérés illik a profilodhoz – jelentkezz meghívás nélkül →
          </p>
        </Link>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Kapott meghívás", value: String(profile.inviteCount) },
          { label: "Beadott ajánlat", value: String(profile.responseCount) },
          { label: "Válaszarány", value: responseRate !== null ? `${responseRate}%` : "–" },
          {
            label: "Átl. válaszidő",
            value: profile.avgResponseHours !== null ? `${Math.round(profile.avgResponseHours)} óra` : "–",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Beérkezett ajánlatkérések</h2>

        <form className="mt-4 flex flex-col sm:flex-row gap-3">
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
            {Object.entries(INVITE_STATUS).map(([value, s]) => (
              <option key={value} value={value}>
                {s.label}
              </option>
            ))}
          </select>
          <button className="bg-slate-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700">
            Szűrés
          </button>
          {hasFilter && (
            <Link href="/supplier" className="text-sm text-slate-500 hover:text-indigo-700 self-center">
              Törlés
            </Link>
          )}
        </form>

        {invites.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            {hasFilter
              ? "Nincs a szűrésnek megfelelő ajánlatkérés."
              : "Még nem érkezett ajánlatkérés. Állítsd be a kategóriáidat és régióidat a profilodban, hogy a matching megtaláljon."}
          </p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 font-medium">Ajánlatkérés</th>
                <th className="py-2 font-medium">Ajánlatkérő</th>
                <th className="py-2 font-medium">Kategória / régió</th>
                <th className="py-2 font-medium">Érkezett</th>
                <th className="py-2 font-medium">Státusz</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invites.map((invite) => {
                const istatus = INVITE_STATUS[invite.status] ?? INVITE_STATUS.SENT;
                return (
                  <tr key={invite.id}>
                    <td className="py-2 pr-3 font-medium text-slate-800">{invite.rfq.title}</td>
                    <td className="py-2 pr-3 text-slate-600">{invite.rfq.company.name}</td>
                    <td className="py-2 pr-3 text-slate-600">
                      {invite.rfq.category?.name ?? "Egyéb"} · {invite.rfq.region?.name ?? "–"}
                    </td>
                    <td className="py-2 pr-3 text-slate-500">{formatDateTime(invite.sentAt)}</td>
                    <td className="py-2 pr-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${istatus.className}`}>
                        {istatus.label}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/r/${invite.token}`}
                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                      >
                        {invite.status === "OFFERED" ? "Megtekintés" : "Válaszadás"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {pageCount > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              {total} találat · {page}/{pageCount}. oldal
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={pageUrl({ q, status: statusFilter }, page - 1)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 hover:border-indigo-600 hover:text-indigo-700"
                >
                  ← Előző
                </Link>
              )}
              {page < pageCount && (
                <Link
                  href={pageUrl({ q, status: statusFilter }, page + 1)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 hover:border-indigo-600 hover:text-indigo-700"
                >
                  Következő →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
