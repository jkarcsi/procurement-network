import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { deletePasskeyAction, deleteApiKeyAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import AddPasskey from "./add-passkey";
import CreateApiKey from "./create-api-key";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const [passkeys, apiKeys] = await Promise.all([
    db.passkey.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    user.companyId
      ? db.apiKey.findMany({ where: { companyId: user.companyId }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fiók</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.name} · {user.email} · {user.company?.name}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Biometrikus belépés (passkey)</h2>
        <p className="mt-1 text-sm text-slate-500">
          A passkey-vel jelszó nélkül, ujjlenyomattal vagy arcfelismeréssel léphetsz be ezen az
          eszközön. A jelszavas belépés tartalék megoldásként megmarad.
        </p>

        {passkeys.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Még nincs passkey-d ehhez a fiókhoz.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {passkeys.map((pk) => (
              <li key={pk.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">🔐 {pk.name}</p>
                  <p className="text-xs text-slate-400">
                    Létrehozva: {formatDateTime(pk.createdAt)}
                    {pk.lastUsedAt ? ` · utoljára használva: ${formatDateTime(pk.lastUsedAt)}` : ""}
                  </p>
                </div>
                <form action={deletePasskeyAction}>
                  <input type="hidden" name="passkeyId" value={pk.id} />
                  <button className="text-xs text-slate-400 hover:text-rose-600">Törlés</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <AddPasskey />
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
    </div>
  );
}
