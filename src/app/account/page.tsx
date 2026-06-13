import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { deleteApiKeyAction, deleteAccountAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import CreateApiKey from "./create-api-key";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const apiKeys = user.companyId
    ? await db.apiKey.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fiók</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.name} · {user.email} · {user.company?.name}
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Mobilalkalmazás</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tölts le a Procura mobilalkalmazást, és lépj be ujjlenyomattal vagy arcfelismeréssel. A
          biometrikus belépés a mobilalkalmazásban érhető el; az asztali felületen e-mail-címmel és
          jelszóval jelentkezhetsz be.
        </p>
      </div>

      {user.companyId && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">API kulcsok</h2>
          <p className="mt-1 text-sm text-slate-500">
            A Procura API-val a saját rendszereidből (pl. ERP) kezelheted az ajánlatkéréseket.
            Dokumentáció: <code className="bg-slate-100 px-1 rounded">/api/v1/openapi.json</code>
          </p>

          {apiKeys.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-100">
              {apiKeys.map((key) => (
                <li key={key.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">🔑 {key.name}</p>
                    <p className="text-xs text-slate-400">
                      Létrehozva: {formatDateTime(key.createdAt)}
                      {key.lastUsedAt ? ` · utoljára használva: ${formatDateTime(key.lastUsedAt)}` : " · még nem használt"}
                    </p>
                  </div>
                  <form action={deleteApiKeyAction}>
                    <input type="hidden" name="apiKeyId" value={key.id} />
                    <button className="text-xs text-slate-400 hover:text-rose-600">Visszavonás</button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <CreateApiKey />
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Adatkezelés</h2>
        <p className="mt-1 text-sm text-slate-500">
          A GDPR alapján bármikor exportálhatod az adataidat, vagy törölheted a fiókodat.
        </p>

        <a
          href="/api/account/export"
          className="mt-4 inline-block border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg hover:border-indigo-600 hover:text-indigo-700"
        >
          ⬇ Adataim exportálása (JSON)
        </a>

        <details className="mt-5">
          <summary className="text-sm text-rose-600 cursor-pointer hover:underline">
            Fiók végleges törlése
          </summary>
          <form action={deleteAccountAction} className="mt-3 space-y-3 max-w-md">
            <p className="text-xs text-slate-500">
              A személyes adataidat azonnal töröljük, illetve anonimizáljuk. A lezárt üzleti
              tranzakciók (ajánlatkérések, ajánlatok, eseménynapló) anonimizálva, jogszabályi
              kötelezettség alapján megőrződnek. A művelet nem visszavonható.
            </p>
            <input
              name="confirmEmail"
              type="email"
              required
              placeholder={`Megerősítéshez írd be: ${user.email}`}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button className="bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-rose-700">
              Fiókom végleges törlése
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}
