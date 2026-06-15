import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { purchaseCreditsAction, setAutoRechargeAction } from "@/lib/actions";
import { CREDIT_PACKAGES, COMPARISON_COST } from "@/lib/credits";
import { formatHuf, formatDateTime } from "@/lib/format";

const TX_TYPE: Record<string, string> = {
  BONUS: "Bónusz",
  PURCHASE: "Vásárlás",
  USAGE: "Felhasználás",
};

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; canceled?: string; saved?: string }>;
}) {
  const { ok, canceled, saved } = await searchParams;
  const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.companyId) redirect("/login?next=/credits");

  const [company, transactions] = await Promise.all([
    db.company.findUniqueOrThrow({ where: { id: user.companyId } }),
    db.creditTransaction.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kreditek</h1>
        <p className="mt-1 text-sm text-slate-500">
          A Procura elemzés és a további prémium funkciók kreditet használnak. Egy
          ajánlat-elemzés {COMPARISON_COST} kreditbe kerül.
        </p>
      </div>

      {ok && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg p-3">
          {stripeEnabled
            ? "Sikeres fizetés! A krediteket pár másodpercen belül jóváírjuk."
            : "Sikeres vásárlás, a krediteket jóváírtuk."}
        </div>
      )}
      {canceled && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3">
          A fizetést megszakítottad, a kártyádat nem terheltük.
        </div>
      )}

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg p-3">
          Az automatikus feltöltés beállításait elmentettük.
        </div>
      )}

      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white">
        <p className="text-sm text-indigo-200">Egyenleged</p>
        <p className="mt-1 text-4xl font-bold">
          {company.creditBalance} <span className="text-lg font-medium text-indigo-200">kredit</span>
        </p>
        <p className="mt-2 text-xs text-indigo-200">{company.name}</p>
      </div>

      <form action={setAutoRechargeAction} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Automatikus feltöltés</h2>
        <p className="mt-1 text-sm text-slate-500">
          Ha az egyenleged a megadott szint alá csökken, automatikusan feltöltjük a kiválasztott
          csomaggal{stripeEnabled ? " (a mentett bankkártyádról)" : " (demo módban azonnal jóváírva)"}.
        </p>
        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={company.autoRechargeEnabled}
            className="w-4 h-4 accent-indigo-600"
          />
          Automatikus feltöltés bekapcsolása
        </label>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Küszöb (kredit alatt)</label>
            <input
              type="number"
              name="threshold"
              min={1}
              defaultValue={company.autoRechargeThreshold}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Feltöltő csomag</label>
            <select
              name="packageId"
              defaultValue={company.autoRechargePackageId ?? CREDIT_PACKAGES[0].id}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CREDIT_PACKAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} – {p.credits} kredit
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="mt-4 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700">
          Mentés
        </button>
        {stripeEnabled && !company.stripePaymentMethodId && company.autoRechargeEnabled && (
          <p className="mt-2 text-xs text-amber-700">
            Az automatikus terheléshez ments el egy bankkártyát egy vásárlás során.
          </p>
        )}
      </form>

      <div>
        <h2 className="font-semibold text-slate-900">Kreditcsomagok</h2>
        <div className="mt-3 grid sm:grid-cols-3 gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <form
              key={pkg.id}
              action={purchaseCreditsAction}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col"
            >
              <input type="hidden" name="packageId" value={pkg.id} />
              <p className="font-medium text-slate-900">{pkg.name}</p>
              <p className="mt-2">
                <span className="text-2xl font-bold text-slate-900">{pkg.credits}</span>{" "}
                <span className="text-sm text-slate-500">kredit</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">{formatHuf(pkg.priceHuf)} + áfa</p>
              <button className="mt-4 bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700">
                Megveszem
              </button>
            </form>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {stripeEnabled
            ? "A fizetés a Stripe biztonságos felületén történik – kártyaadatot nem tárolunk."
            : "Demo környezet: a vásárlás azonnal jóváíródik, fizetés nélkül."}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Tranzakciók</h2>
        {transactions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Még nincs tranzakciód.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 font-medium">Időpont</th>
                <th className="py-2 font-medium">Típus</th>
                <th className="py-2 font-medium">Leírás</th>
                <th className="py-2 font-medium text-right">Összeg</th>
                <th className="py-2 font-medium text-right">Egyenleg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2 pr-3 text-slate-500">{formatDateTime(tx.createdAt)}</td>
                  <td className="py-2 pr-3 text-slate-600">{TX_TYPE[tx.type] ?? tx.type}</td>
                  <td className="py-2 pr-3 text-slate-800">{tx.description}</td>
                  <td
                    className={`py-2 pr-3 text-right font-medium ${
                      tx.amount > 0 ? "text-emerald-700" : "text-slate-900"
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </td>
                  <td className="py-2 text-right text-slate-500">{tx.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
