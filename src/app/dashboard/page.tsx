import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { formatDate, RFQ_STATUS } from "@/lib/format";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.companyId) redirect("/login?next=/dashboard");

  const rfqs = await db.rfq.findMany({
    where: { companyId: user.companyId },
    include: { category: true, region: true, _count: { select: { offers: true, invites: true } } },
    orderBy: { createdAt: "desc" },
  });

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

      {rfqs.length === 0 ? (
        <div className="mt-10 bg-white border border-slate-200 rounded-2xl p-10 text-center">
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
    </div>
  );
}
