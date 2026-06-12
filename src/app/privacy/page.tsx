import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adatvédelmi tájékoztató – Procura",
};

// Placeholder legal copy until reviewed by counsel before launch.
export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Adatvédelmi tájékoztató</h1>
      <p className="mt-2 text-sm text-slate-400">Hatályos: 2026. június 12-től (tervezet)</p>

      <div className="mt-6 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-slate-900">1. Kezelt adatok</h2>
          <p className="mt-1">
            Fiókadatok (név, e-mail cím, cégnév, jelszó titkosított formában), az
            ajánlatkérések és ajánlatok tartalma, valamint a kiküldött e-mailek naplója. A
            jelszavakat bcrypt hash-eléssel tároljuk, visszafejthető formában soha.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">2. Az adatkezelés célja</h2>
          <p className="mt-1">
            A beszerzési folyamat lebonyolítása: ajánlatkérések összeállítása és kiküldése,
            beszállítói párosítás, ajánlatok fogadása és összehasonlítása, valamint a
            kapcsolódó értesítések küldése.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">3. Automatizált elemzés</h2>
          <p className="mt-1">
            Az ajánlatkérések szövegét és a beérkezett ajánlatok adatait az elemzési funkciók
            elkészítéséhez adatfeldolgozóként igénybe vett külső nyelvi-modell szolgáltató
            (Anthropic) dolgozza fel. A feldolgozás a szolgáltatás működéséhez szükséges
            mértékre korlátozódik.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">4. Adattovábbítás</h2>
          <p className="mt-1">
            Az ajánlatkérés tartalmát a vevő által kiválasztott beszállítók kapják meg. Az
            e-mail-kézbesítéshez külső szolgáltatót (Resend) veszünk igénybe.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">5. Jogaid</h2>
          <p className="mt-1">
            Bármikor kérheted adataid helyesbítését, törlését vagy az adatkezelés
            korlátozását a hello@procura.hu címen. A fiók törlésével a személyes adatok
            törlésre kerülnek; a már lezárt tranzakciók auditnaplója jogszabályi kötelezettség
            alapján őrződhet meg.
          </p>
        </section>
      </div>

      <p className="mt-8 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        Ez a dokumentum tervezet: a piaci indulás előtt adatvédelmi szakértői felülvizsgálatra
        kerül.
      </p>
    </div>
  );
}
