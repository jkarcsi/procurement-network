import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";

const TX_TYPE: Record<string, string> = {
  BONUS: "Bónusz",
  PURCHASE: "Vásárlás",
  USAGE: "Felhasználás",
};

export default async function AdminCreditsPage() {
  await requireAdmin();

  const transactions = await db.creditTransaction.findMany({
    include: { company: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Időpont</th>
            <th className="px-4 py-3 font-medium">Cég</th>
            <th className="px-4 py-3 font-medium">Típus</th>
            <th className="px-4 py-3 font-medium">Leírás</th>
            <th className="px-4 py-3 font-medium text-right">Összeg</th>
            <th className="px-4 py-3 font-medium text-right">Egyenleg utána</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                Még nincs kredittranzakció.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(tx.createdAt)}</td>
                <td className="px-4 py-3 text-slate-600">{tx.company.name}</td>
                <td className="px-4 py-3 text-slate-600">{TX_TYPE[tx.type] ?? tx.type}</td>
                <td className="px-4 py-3 text-slate-800">{tx.description}</td>
                <td className={`px-4 py-3 text-right font-medium ${tx.amount > 0 ? "text-emerald-700" : "text-slate-900"}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                </td>
                <td className="px-4 py-3 text-right text-slate-500">{tx.balanceAfter}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
