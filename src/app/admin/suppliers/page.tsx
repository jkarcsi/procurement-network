import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export default async function AdminSuppliersPage() {
  await requireAdmin();

  const suppliers = await db.supplierProfile.findMany({
    include: {
      company: true,
      categories: { include: { category: true } },
      regions: { include: { region: true } },
    },
    orderBy: { inviteCount: "desc" },
    take: 200,
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Beszállító</th>
            <th className="px-4 py-3 font-medium">Kategóriák</th>
            <th className="px-4 py-3 font-medium">Régiók</th>
            <th className="px-4 py-3 font-medium text-right">Meghívó</th>
            <th className="px-4 py-3 font-medium text-right">Ajánlat</th>
            <th className="px-4 py-3 font-medium text-right">Válaszarány</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {suppliers.map((s) => {
            const rate = s.inviteCount > 0 ? Math.round((s.responseCount / s.inviteCount) * 100) : null;
            return (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{s.company.name}</p>
                  <p className="text-xs text-slate-400">{s.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {s.categories.map((c) => c.category.name).join(", ") || "–"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {s.nationwide ? "Országos" : s.regions.map((r) => r.region.name).join(", ") || "–"}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{s.inviteCount}</td>
                <td className="px-4 py-3 text-right text-slate-600">{s.responseCount}</td>
                <td className="px-4 py-3 text-right text-slate-600">{rate !== null ? `${rate}%` : "–"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
