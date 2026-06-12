import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { deletePasskeyAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import AddPasskey from "./add-passkey";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const passkeys = await db.passkey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

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
    </div>
  );
}
