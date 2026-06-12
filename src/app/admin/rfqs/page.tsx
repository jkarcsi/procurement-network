import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { formatDate, RFQ_STATUS } from "@/lib/format";

export default async function AdminRfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status: statusFilter } = await searchParams;

  const rfqs = await db.rfq.findMany({
    where: statusFilter && RFQ_STATUS[statusFilter] ? { status: statusFilter } : {},
    include: { company: true, category: true, _count: { select: { invites: true, offers: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/rfqs"
          className={`px-3 py-1.5 rounded-lg border ${!statusFilter ? "border-indigo-600 text-indigo-700 bg-indigo-50" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}
        >
          Mind
        </Link>
        {Object.entries(RFQ_STATUS).map(([value, s]) => (
          <Link
            key={value}
            href={`/admin/rfqs?status=${value}`}
            className={`px-3 py-1.5 rounded-lg border ${statusFilter === value ? "border-indigo-600 text-indigo-700 bg-indigo-50" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ajánlatkérés</th>
              <th className="px-4 py-3 font-medium">Vevő</th>
              <th className="px-4 py-3 font-medium">Kategória</th>
              <th className="px-4 py-3 font-medium">Státusz</th>
              <th className="px-4 py-3 font-medium text-right">Meghívó</th>
              <th className="px-4 py-3 font-medium text-right">Ajánlat</th>
              <th className="px-4 py-3 font-medium">Létrehozva</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rfqs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Nincs a szűrésnek megfelelő ajánlatkérés.
                </td>
              </tr>
            ) : (
              rfqs.map((rfq) => {
                const status = RFQ_STATUS[rfq.status] ?? RFQ_STATUS.READY;
                return (
                  <tr key={rfq.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{rfq.title}</td>
                    <td className="px-4 py-3 text-slate-600">{rfq.company.name}</td>
                    <td className="px-4 py-3 text-slate-600">{rfq.category?.name ?? "–"}</td>
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
