import { requireAdmin, getSupplyGaps, type SupplyGapRow } from "@/lib/admin";

function GapTable({ title, rows }: { title: string; rows: SupplyGapRow[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Név</th>
            <th className="px-4 py-3 font-medium text-right">Kereslet (ajánlatkérés)</th>
            <th className="px-4 py-3 font-medium text-right">Kínálat (beszállító)</th>
            <th className="px-4 py-3 font-medium">Állapot</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id} className={r.gap ? "bg-amber-50" : ""}>
              <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
              <td className="px-4 py-3 text-right text-slate-600">{r.demand}</td>
              <td className="px-4 py-3 text-right text-slate-600">{r.supply}</td>
              <td className="px-4 py-3">
                {r.gap ? (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    ⚠ kínálati rés
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    rendben
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminSupplyGapsPage() {
  await requireAdmin();
  const { categories, regions } = await getSupplyGaps();

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Ahol kereslet van, de kevés a beszállító, ott érdemes új beszállítókat szerezni (pl.
        célzott megkeresés). A sárgával jelölt sorok jelzik a kínálati réseket.
      </p>
      <GapTable title="Kategóriák" rows={categories} />
      <GapTable title="Régiók" rows={regions} />
    </div>
  );
}
