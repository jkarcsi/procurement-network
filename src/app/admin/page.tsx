import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { RFQ_STATUS } from "@/lib/format";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [users, buyers, suppliers, rfqsByStatus, offers, acceptedOffers, creditsUsed, creditsBought] =
    await Promise.all([
      db.user.count(),
      db.company.count({ where: { type: "BUYER" } }),
      db.supplierProfile.count(),
      db.rfq.groupBy({ by: ["status"], _count: true }),
      db.offer.count(),
      db.offer.count({ where: { status: "ACCEPTED" } }),
      db.creditTransaction.aggregate({ where: { type: "USAGE" }, _sum: { amount: true } }),
      db.creditTransaction.aggregate({ where: { type: "PURCHASE" }, _sum: { amount: true } }),
    ]);

  const stats = [
    { label: "Felhasználó", value: users },
    { label: "Vevő cég", value: buyers },
    { label: "Beszállítói profil", value: suppliers },
    { label: "Beérkezett ajánlat", value: offers },
    { label: "Elfogadott ajánlat", value: acceptedOffers },
    { label: "Vásárolt kredit", value: creditsBought._sum.amount ?? 0 },
    { label: "Felhasznált kredit", value: Math.abs(creditsUsed._sum.amount ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900">Ajánlatkérések státusz szerint</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {rfqsByStatus.length === 0 ? (
            <p className="text-sm text-slate-500">Még nincs ajánlatkérés.</p>
          ) : (
            rfqsByStatus.map((row) => {
              const status = RFQ_STATUS[row.status] ?? { label: row.status, className: "bg-slate-100 text-slate-600" };
              return (
                <span key={row.status} className={`px-3 py-1.5 rounded-full text-sm font-medium ${status.className}`}>
                  {status.label}: {row._count}
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
