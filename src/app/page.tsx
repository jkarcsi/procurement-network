import Link from "next/link";
import { CATEGORIES } from "@/lib/taxonomy";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <section className="py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
          Egy mondat. <span className="text-indigo-600">Tíz releváns ajánlat.</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Írd le egy mondatban, mire van szükséged. A Procura pontosító kérdésekkel
          ajánlatkéréssé alakítja, kiválasztja a legjobb beszállítókat, és
          összehasonlítható formában hozza vissza az ajánlatokat.
        </p>

        <form action="/rfq/new" method="GET" className="mt-8 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="text"
              placeholder="Pl.: Heti két alkalommal takarítót keresek 600 m²-es budapesti irodánkba"
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-sm"
            >
              Ajánlatot kérek
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Ingyenes, kötelezettség nélkül. A döntés végig nálad marad.
          </p>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <span
              key={cat.id}
              className="text-sm bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full"
            >
              {cat.name}
            </span>
          ))}
        </div>
      </section>

      <section className="py-8 grid sm:grid-cols-3 gap-4 text-center">
        {[
          { value: "1 mondat", text: "ennyi kell egy teljes értékű ajánlatkéréshez" },
          { value: "48 órán belül", text: "érkeznek az első összehasonlítható ajánlatok" },
          { value: "0 Ft", text: "a vevői indulás és a beszállítói részvétel" },
        ].map((item) => (
          <div key={item.value} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <p className="text-2xl font-bold text-indigo-700">{item.value}</p>
            <p className="mt-1 text-sm text-slate-600">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="py-12 grid sm:grid-cols-3 gap-6">
        {[
          {
            step: "1",
            title: "Írd le az igényt",
            text: "Egy mondat elég. A Procura 3-8 célzott kérdéssel kiegészíti, és strukturált ajánlatkérést készít belőle.",
          },
          {
            step: "2",
            title: "Okos shortlist és kiküldés",
            text: "A rendszer kategória, régió és korábbi reakciók alapján kiválasztja a legrelevánsabb beszállítókat, és kiküldi az ajánlatkérést.",
          },
          {
            step: "3",
            title: "Hasonlítsd össze, dönts",
            text: "Az ajánlatok egységes, összehasonlítható formában érkeznek vissza. A Procura elemzés összefoglal, de a döntés a tiéd.",
          },
        ].map((item) => (
          <div key={item.step} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
              {item.step}
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="py-12 mb-8 bg-white rounded-2xl border border-slate-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Beszállító vagy?</h2>
          <p className="mt-1 text-sm text-slate-600">
            Regisztrálj ingyen, és kapj releváns ajánlatkéréseket a kategóriáidban és régióidban –
            regisztráció nélkül is válaszolhatsz, fiókkal pedig előnyt élvezel.
          </p>
        </div>
        <Link
          href="/register?role=SUPPLIER"
          className="shrink-0 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-700"
        >
          Beszállítói regisztráció
        </Link>
      </section>
    </div>
  );
}
