import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { shortlistSuppliers } from "@/lib/matching";
import { sendRfqAction, acceptOfferAction, compareOffersAction } from "@/lib/actions";
import { formatDate, formatDateTime, formatHuf, RFQ_STATUS, INVITE_STATUS, OFFER_STATUS } from "@/lib/format";
import type { RfqSpec } from "@/lib/ai";

export default async function RfqDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.companyId) redirect(`/login?next=/rfq/${id}`);

  const rfq = await db.rfq.findUnique({
    where: { id },
    include: {
      category: true,
      region: true,
      questions: { orderBy: { order: "asc" } },
      invites: { orderBy: { sentAt: "asc" } },
      offers: { orderBy: { priceNet: "asc" } },
      auditLogs: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!rfq || rfq.companyId !== user.companyId) notFound();

  const spec: RfqSpec | null = rfq.spec ? JSON.parse(rfq.spec) : null;
  const status = RFQ_STATUS[rfq.status] ?? RFQ_STATUS.READY;
  const matches =
    rfq.status === "READY" && rfq.categoryId
      ? await shortlistSuppliers(rfq.categoryId, rfq.regionId)
      : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{rfq.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {rfq.category?.name ?? "Egyéb"} · {rfq.region?.name ?? "régió nincs megadva"} ·
            határidő: {formatDate(rfq.deadline)} · létrehozva: {formatDate(rfq.createdAt)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Structured specification */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Ajánlatkérés specifikációja</h2>
        <p className="mt-1 text-xs text-slate-400">Eredeti igény: „{rfq.intakeText}”</p>
        {spec ? (
          <dl className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="sm:col-span-2">
              <dt className="font-medium text-slate-500">Összefoglaló</dt>
              <dd className="mt-1 text-slate-800">{spec.summary}</dd>
            </div>
            {spec.scope.length > 0 && (
              <div className="sm:col-span-2">
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
            <div>
              <dt className="font-medium text-slate-500">Teljesítés helye</dt>
              <dd className="mt-1 text-slate-800">{spec.location}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Ütemezés</dt>
              <dd className="mt-1 text-slate-800">{spec.schedule}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Szerződés jellege</dt>
              <dd className="mt-1 text-slate-800">{spec.contractType}</dd>
            </div>
            {spec.requirements.length > 0 && (
              <div>
                <dt className="font-medium text-slate-500">Elvárások</dt>
                <dd className="mt-1 text-slate-800">{spec.requirements.join("; ")}</dd>
              </div>
            )}
            {spec.notes && (
              <div className="sm:col-span-2">
                <dt className="font-medium text-slate-500">Megjegyzés</dt>
                <dd className="mt-1 text-slate-800">{spec.notes}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Nincs strukturált specifikáció.</p>
        )}

        {rfq.questions.length > 0 && (
          <details className="mt-4">
            <summary className="text-sm text-indigo-600 cursor-pointer">
              Pontosító kérdések és válaszok ({rfq.questions.length})
            </summary>
            <ul className="mt-2 space-y-2 text-sm">
              {rfq.questions.map((q) => (
                <li key={q.id} className="border-l-2 border-slate-200 pl-3">
                  <p className="text-slate-500">{q.question}</p>
                  <p className="text-slate-800">{q.answer ?? "(nincs válasz)"}</p>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Shortlist + send-out (in READY state) */}
      {rfq.status === "READY" && (
        <form action={sendRfqAction} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <input type="hidden" name="rfqId" value={rfq.id} />
          <h2 className="font-semibold text-slate-900">Ajánlott beszállítók</h2>
          <p className="mt-1 text-sm text-slate-500">
            Kategória, régió és korábbi válaszadási statisztika alapján rangsorolva. Pipáld ki, kiknek menjen az ajánlatkérés.
          </p>

          {matches.length === 0 ? (
            <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Ehhez a kategóriához még nincs beszállító a hálózatban – adj meg külső e-mail címeket lent.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {matches.map((m, i) => (
                <li key={m.supplierId} className="py-3 flex items-center gap-4">
                  <input
                    type="checkbox"
                    name="supplierIds"
                    value={m.supplierId}
                    defaultChecked
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">
                      {i + 1}. {m.companyName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {m.reason}
                      {m.certifications ? ` · ${m.certifications}` : ""}
                      {m.regionNames.length > 0 ? ` · ${m.regionNames.join(", ")}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold text-indigo-700">{m.score} pont</span>
                    {m.responseRate !== null && (
                      <p className="text-xs text-slate-400">
                        válaszarány {Math.round(m.responseRate * 100)}%
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">
              További beszállítók e-mail címei (vesszővel vagy soronként)
            </label>
            <textarea
              name="extraEmails"
              rows={2}
              placeholder="pl. ajanlat@kedvencbeszallitom.hu"
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button className="mt-4 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700">
            Ajánlatkérés kiküldése
          </button>
          <p className="mt-2 text-xs text-slate-400">
            Demo módban az e-mailek az Outbox oldalra kerülnek – onnan nyithatod meg a beszállítói válaszlinkeket.
          </p>
        </form>
      )}

      {/* Invite statuses */}
      {rfq.invites.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Kiküldött meghívók ({rfq.invites.length})</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 font-medium">Beszállító</th>
                <th className="py-2 font-medium">Pontszám</th>
                <th className="py-2 font-medium">Státusz</th>
                <th className="py-2 font-medium">Kiküldve</th>
                <th className="py-2 font-medium">Reakció</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rfq.invites.map((invite) => {
                const istatus = INVITE_STATUS[invite.status] ?? INVITE_STATUS.SENT;
                return (
                  <tr key={invite.id}>
                    <td className="py-2">
                      <p className="font-medium text-slate-800">
                        {invite.companyName}
                        {invite.source === "SELF" && (
                          <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                            maga jelentkezett
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">{invite.email}</p>
                    </td>
                    <td className="py-2 text-slate-600">
                      {invite.matchScore !== null ? `${invite.matchScore} pont` : "–"}
                    </td>
                    <td className="py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${istatus.className}`}>
                        {istatus.label}
                      </span>
                    </td>
                    <td className="py-2 text-slate-500">{formatDateTime(invite.sentAt)}</td>
                    <td className="py-2 text-slate-500">{formatDateTime(invite.respondedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Offer comparison */}
      {rfq.status !== "READY" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">
              Beérkezett ajánlatok ({rfq.offers.length})
            </h2>
            {rfq.offers.length >= 2 && rfq.status === "SENT" && (
              <form action={compareOffersAction}>
                <input type="hidden" name="rfqId" value={rfq.id} />
                <button className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700">
                  ⚡ Procura elemzés (1 kredit)
                </button>
              </form>
            )}
          </div>

          {rfq.offers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Még nincs beérkezett ajánlat. A beszállítók a kapott linken keresztül válaszolnak.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Beszállító</th>
                    <th className="py-2 pr-4 font-medium text-right">Nettó ár</th>
                    <th className="py-2 pr-4 font-medium">Egység</th>
                    <th className="py-2 pr-4 font-medium">Kezdés</th>
                    <th className="py-2 pr-4 font-medium">Érvényes</th>
                    <th className="py-2 pr-4 font-medium">Megjegyzés</th>
                    <th className="py-2 pr-4 font-medium">Státusz</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rfq.offers.map((offer) => {
                    const ostatus = OFFER_STATUS[offer.status] ?? OFFER_STATUS.SUBMITTED;
                    return (
                      <tr key={offer.id} className={offer.status === "ACCEPTED" ? "bg-emerald-50" : ""}>
                        <td className="py-2 pr-4">
                          <p className="font-medium text-slate-800">{offer.companyName}</p>
                          <p className="text-xs text-slate-400">{offer.contactEmail}</p>
                        </td>
                        <td className="py-2 pr-4 text-right font-semibold text-slate-900">
                          {formatHuf(offer.priceNet)}
                        </td>
                        <td className="py-2 pr-4 text-slate-600">{offer.priceUnit}</td>
                        <td className="py-2 pr-4 text-slate-600">{offer.startDate ?? "–"}</td>
                        <td className="py-2 pr-4 text-slate-600">{offer.validUntil ?? "–"}</td>
                        <td className="py-2 pr-4 text-slate-600 max-w-50 truncate" title={offer.notes ?? ""}>
                          {offer.notes ?? "–"}
                        </td>
                        <td className="py-2 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ostatus.className}`}>
                            {ostatus.label}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          {rfq.status === "SENT" && (
                            <form action={acceptOfferAction}>
                              <input type="hidden" name="offerId" value={offer.id} />
                              <button className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">
                                Elfogadás
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {rfq.aiComparison && (
            <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-indigo-900">Procura elemzés</h3>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{rfq.aiComparison}</p>
              <p className="mt-2 text-xs text-slate-400">
                Az összefoglaló döntéstámogatás – a végső döntés a tiéd.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Audit trail */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Eseménynapló (audit trail)</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {rfq.auditLogs.map((log) => (
            <li key={log.id} className="flex gap-3 text-slate-600">
              <span className="text-slate-400 shrink-0 font-mono text-xs pt-0.5">
                {formatDateTime(log.createdAt)}
              </span>
              <span>
                <span className="font-medium text-slate-700">{log.event}</span>
                {" – "}
                {log.actor}
                {log.meta ? ` (${log.meta})` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
