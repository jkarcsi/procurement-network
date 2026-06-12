import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Általános Szerződési Feltételek – Procura",
};

// Placeholder legal copy until reviewed by counsel before launch.
export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Általános Szerződési Feltételek</h1>
      <p className="mt-2 text-sm text-slate-400">Hatályos: 2026. június 12-től (tervezet)</p>

      <div className="mt-6 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-slate-900">1. A szolgáltatás</h2>
          <p className="mt-1">
            A Procura B2B beszerzési hálózat: a vevők ajánlatkéréseket állítanak
            össze és küldenek ki, a beszállítók pedig strukturált ajánlatot adnak. A Procura
            közvetítő platform – a felek között létrejövő szerződéseknek nem részese, az
            ajánlatok tartalmáért a beszállító, az ajánlatkérés tartalmáért a vevő felel.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">2. Regisztráció és fiók</h2>
          <p className="mt-1">
            A szolgáltatás vevői és beszállítói fiókkal használható; a meghívóból történő
            ajánlatadáshoz nem szükséges regisztráció. A fiók tulajdonosa felel a hozzáférési
            adatok biztonságáért és a fiókkal végzett tevékenységért.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">3. Díjak</h2>
          <p className="mt-1">
            Az Alap csomag díjmentes, a Pro csomag díját az Árak oldal tartalmazza. A
            beszállítói használat díjmentes. A díjak változtatásának jogát fenntartjuk; a
            változásról a felhasználókat előzetesen értesítjük.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">4. Elemzési funkciók és kreditek</h2>
          <p className="mt-1">
            A Procura által készített összefoglalók, kérdések és elemzések döntéstámogató
            jellegűek, nem minősülnek tanácsadásnak. A beszerzési döntés minden esetben a
            vevőé. Egyes elemzési funkciók kreditet használnak; a kreditek a megvásárlástól
            számított 12 hónapig használhatók fel, készpénzre nem válthatók, és a fel nem
            használt kreditek a fiók törlésével elvesznek.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">5. Felelősség</h2>
          <p className="mt-1">
            A platformot „adott állapotban” nyújtjuk. Nem vállalunk felelősséget a felek
            közötti szerződések teljesítéséért, valamint a felhasználók által megadott adatok
            helyességéért.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">6. Kapcsolat</h2>
          <p className="mt-1">Kérdés esetén írj a hello@procura.hu címre.</p>
        </section>
      </div>

      <p className="mt-8 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        Ez a dokumentum tervezet: a piaci indulás előtt jogi szakértői felülvizsgálatra kerül.
      </p>
    </div>
  );
}
