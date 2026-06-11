import { db } from "@/lib/db";
import { submitOfferAction, declineInviteAction } from "@/lib/actions";
import { formatDate, formatHuf } from "@/lib/format";
import type { RfqSpec } from "@/lib/ai";

// Publikus, token-alapú beszállítói válaszoldal – regisztráció nélkül használható.
export default async function SupplierReplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { token } = await params;
  const { ok, error } = await searchParams;

  const invite = await db.rfqInvite.findUnique({
    where: { token },
    include: {
      rfq: { include: { company: true, category: true, region: true } },
      supplier: { include: { company: true } },
      offer: true,
    },
  });

  if (!invite) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">Érvénytelen link</h1>
        <p className="mt-2 text-sm text-slate-500">
          Ez az ajánlatkérési link nem létezik vagy már nem érvényes.
        </p>
      </div>
    );
  }

  if (invite.status === "SENT") {
    await db.rfqInvite.update({
      where: { id: invite.id },
      data: { status: "VIEWED", viewedAt: new Date() },
    });
    await db.auditLog.create({
      data: {
        rfqId: invite.rfqId,
        actor: invite.email,
        event: "INVITE_VIEWED",
        meta: invite.companyName,
      },
    });
  }

  const rfq = invite.rfq;
  const spec: RfqSpec | null = rfq.spec ? JSON.parse(rfq.spec) : null;
  const closed = rfq.status === "DECIDED" || rfq.status === "CLOSED";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <p className="text-sm text-indigo-600 font-medium">Ajánlatkérés a Procura hálózaton</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{rfq.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ajánlatkérő: {rfq.company.name} · {rfq.category?.name ?? "Egyéb"} ·{" "}
          {rfq.region?.name ?? "régió nincs megadva"} · ajánlattételi határidő: {formatDate(rfq.deadline)}
        </p>
      </div>

      {ok && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg p-4">
          <p className="font-medium">Köszönjük, az ajánlatod beérkezett!</p>
          <p className="mt-1">
            Az ajánlatkérő strukturált összehasonlításban látja majd, és e-mailben értesítünk a döntésről.
          </p>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Az igény részletei</h2>
        {spec ? (
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-slate-500">Összefoglaló</dt>
              <dd className="mt-1 text-slate-800">{spec.summary}</dd>
            </div>
            {spec.scope.length > 0 && (
              <div>
                <dt className="font-medium text-slate-500">Feladat terjedelme</dt>
                <dd className="mt-1">
                  <ul className="list-disc list-inside text-slate-800 space-y-1">
                    {spec.scope.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <dt className="font-medium text-slate-500">Helyszín</dt>
                <dd className="mt-1 text-slate-800">{spec.location}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Ütemezés</dt>
                <dd className="mt-1 text-slate-800">{spec.schedule}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Szerződés</dt>
                <dd className="mt-1 text-slate-800">{spec.contractType}</dd>
              </div>
            </div>
            {spec.requirements.length > 0 && (
              <div>
                <dt className="font-medium text-slate-500">Elvárások</dt>
                <dd className="mt-1 text-slate-800">{spec.requirements.join("; ")}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-700">{rfq.intakeText}</p>
        )}
      </div>

      {invite.offer ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Beküldött ajánlatod</h2>
          <p className="mt-3 text-sm text-slate-700">
            Nettó ár: <span className="font-semibold">{formatHuf(invite.offer.priceNet)}</span> (
            {invite.offer.priceUnit})
            {invite.offer.startDate ? ` · kezdés: ${invite.offer.startDate}` : ""}
            {invite.offer.validUntil ? ` · érvényes: ${invite.offer.validUntil}` : ""}
          </p>
          {invite.offer.notes && <p className="mt-2 text-sm text-slate-600">{invite.offer.notes}</p>}
          <p className="mt-3 text-xs text-slate-400">
            Státusz:{" "}
            {invite.offer.status === "ACCEPTED"
              ? "✅ Az ajánlatkérő elfogadta az ajánlatodat!"
              : invite.offer.status === "REJECTED"
                ? "Az ajánlatkérő másik ajánlatot választott."
                : "elbírálás alatt"}
          </p>
        </div>
      ) : closed ? (
        <div className="bg-slate-100 border border-slate-200 text-slate-600 text-sm rounded-2xl p-6">
          Ez az ajánlatkérés már lezárult, új ajánlat nem adható be.
        </div>
      ) : invite.status === "DECLINED" ? (
        <div className="bg-slate-100 border border-slate-200 text-slate-600 text-sm rounded-2xl p-6">
          Ezt a megkeresést korábban elutasítottad. Ha meggondoltad magad, vedd fel a kapcsolatot az
          ajánlatkérővel.
        </div>
      ) : (
        <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Ajánlatadás</h2>
          <p className="mt-1 text-sm text-slate-500">
            Nem kell regisztrálnod – az ajánlatod strukturált formában jut el az ajánlatkérőhöz.
          </p>

          <form action={submitOfferAction} className="mt-4 grid sm:grid-cols-2 gap-4">
            <input type="hidden" name="token" value={token} />
            {!invite.supplier && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Céged neve</label>
                  <input
                    name="companyName"
                    required
                    className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Kapcsolattartó e-mail</label>
                  <input
                    type="email"
                    name="contactEmail"
                    defaultValue={invite.email}
                    required
                    className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Nettó ár (Ft)</label>
              <input
                type="number"
                name="priceNet"
                min={1}
                required
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Ár egysége</label>
              <select
                name="priceUnit"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Ft/hó">Ft/hó</option>
                <option value="Ft/alkalom">Ft/alkalom</option>
                <option value="Ft/óra">Ft/óra</option>
                <option value="Ft/m²/hó">Ft/m²/hó</option>
                <option value="egyösszegű">egyösszegű</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Lehetséges kezdés</label>
              <input
                type="date"
                name="startDate"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Ajánlat érvényessége</label>
              <input
                type="date"
                name="validUntil"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Megjegyzés, tartalom, feltételek
              </label>
              <textarea
                name="notes"
                rows={3}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-4">
              <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700">
                Ajánlat beküldése
              </button>
            </div>
          </form>

          <form action={declineInviteAction} className="mt-3">
            <input type="hidden" name="token" value={token} />
            <button className="text-sm text-slate-400 hover:text-rose-600">
              Nem adok ajánlatot erre a megkeresésre
            </button>
          </form>
        </div>
      )}

      {!invite.supplier && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Szeretnél több ilyen megkeresést?</h3>
            <p className="mt-1 text-sm text-slate-300">
              Regisztrálj ingyenes beszállítói profilt: kategória- és régiófigyelés, korábbi értesítés,
              válaszstatisztikák.
            </p>
          </div>
          <a
            href="/register?role=SUPPLIER"
            className="shrink-0 bg-white text-slate-900 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-100"
          >
            Ingyenes regisztráció
          </a>
        </div>
      )}
    </div>
  );
}
