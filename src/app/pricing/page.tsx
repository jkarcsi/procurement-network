import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { upgradeToProAction } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Árak – Procura",
};

const PLANS = [
  {
    name: "Alap",
    price: "0 Ft",
    period: "örökre ingyenes",
    cta: { label: "Kezdd el ingyen", href: "/register" },
    highlight: false,
    features: [
      "Legfeljebb 3 aktív ajánlatkérés",
      "Legfeljebb 5 meghívott beszállító ajánlatkérésenként",
      "Intelligens pontosító kérdések",
      "Automatikus beszállítói shortlist",
      "10 kredit ajándékba a Procura elemzéshez",
    ],
  },
  {
    name: "Pro",
    price: "4 990 Ft",
    period: "/ hó + áfa",
    cta: { label: "Kipróbálom a Prót", href: "/register" },
    highlight: true,
    features: [
      "Korlátlan aktív ajánlatkérés",
      "Korlátlan meghívott beszállító",
      "Kedvezményes kreditcsomagok a Procura elemzéshez",
      "Teljes eseménynapló (audit trail)",
      "Elsőbbségi e-mail támogatás",
    ],
  },
];

const FAQ = [
  {
    q: "Tényleg ingyenes az Alap csomag?",
    a: "Igen. Az Alap csomag korlátozás nélkül használható időben, csak az egyszerre futó ajánlatkérések és a meghívható beszállítók száma korlátozott.",
  },
  {
    q: "A beszállítóknak mennyibe kerül?",
    a: "Semennyibe. A beszállítói regisztráció és az ajánlatadás ingyenes – a meghívóból egy kattintással, regisztráció nélkül is lehet ajánlatot adni.",
  },
  {
    q: "Hogyan fizethetek?",
    a: "A Pro előfizetés bankkártyával fizethető, havi elszámolással. Bármikor lemondható, a már kifizetett időszak végéig a Pro funkciók elérhetők maradnak.",
  },
  {
    q: "Mi történik az adataimmal?",
    a: "Az ajánlatkérések és ajánlatok kizárólag az érintett felek számára láthatók. Részletek az Adatvédelmi tájékoztatóban.",
  },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ pro?: string; canceled?: string }>;
}) {
  const { pro, canceled } = await searchParams;
  const user = await getSessionUser();
  const company =
    user?.role === "BUYER" && user.companyId
      ? await db.company.findUnique({ where: { id: user.companyId } })
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Egyszerű, átlátható árazás</h1>
        <p className="mt-2 text-slate-600">
          Vevőként ingyen kezdhetsz, a beszállítóknak pedig mindig ingyenes.
        </p>
      </div>

      {pro && (
        <div className="mt-6 max-w-3xl mx-auto bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg p-3 text-center">
          A Pro csomagod aktív – korlátlan ajánlatkérés és meghívó.
        </div>
      )}
      {canceled && (
        <div className="mt-6 max-w-3xl mx-auto bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3 text-center">
          A fizetést megszakítottad, a kártyádat nem terheltük.
        </div>
      )}

      <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col ${
              plan.highlight ? "border-indigo-600 ring-1 ring-indigo-600" : "border-slate-200"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
              {plan.highlight && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  Ajánlott
                </span>
              )}
            </div>
            <p className="mt-3">
              <span className="text-3xl font-bold text-slate-900">{plan.price}</span>{" "}
              <span className="text-sm text-slate-500">{plan.period}</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-emerald-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {plan.highlight && company ? (
              company.plan === "PRO" ? (
                <p className="mt-6 text-center text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg py-2.5">
                  Ez az aktív csomagod
                </p>
              ) : (
                <form action={upgradeToProAction} className="mt-6">
                  <button className="w-full text-center font-medium px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                    Váltás Pro csomagra
                  </button>
                </form>
              )
            ) : (
              <Link
                href={plan.cta.href}
                className={`mt-6 text-center font-medium px-5 py-2.5 rounded-lg ${
                  plan.highlight
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-slate-300 text-slate-700 hover:border-indigo-600 hover:text-indigo-700"
                }`}
              >
                {plan.cta.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        {process.env.STRIPE_SECRET_KEY
          ? "A fizetés a Stripe biztonságos felületén történik – kártyaadatot nem tárolunk. Az előfizetés bármikor lemondható."
          : "Demo környezet: a csomagváltás azonnal, fizetés nélkül aktiválódik."}
      </p>

      <div className="mt-14 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-slate-900 text-center">Gyakori kérdések</h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="bg-white border border-slate-200 rounded-xl p-4">
              <summary className="font-medium text-slate-800 cursor-pointer">{item.q}</summary>
              <p className="mt-2 text-sm text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-14 bg-indigo-600 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold text-white">
          Egy mondat, és úton az első ajánlatkérésed
        </h2>
        <Link
          href="/rfq/new"
          className="mt-4 inline-block bg-white text-indigo-700 font-medium px-6 py-2.5 rounded-xl hover:bg-indigo-50"
        >
          Ajánlatot kérek
        </Link>
      </div>
    </div>
  );
}
