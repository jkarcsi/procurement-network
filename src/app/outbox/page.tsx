import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

// Demo nézet: a "kiküldött" e-mailek itt jelennek meg, a beszállítói
// válaszlinkek innen nyithatók meg.
export default async function OutboxPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/outbox");

  const emails = await db.emailOutbox.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Kimenő e-mailek (demo outbox)</h1>
      <p className="mt-1 text-sm text-slate-500">
        Éles környezetben ezek valódi e-mailként mennének ki. Demo módban innen nyithatod meg a
        beszállítói válaszlinkeket.
      </p>

      {emails.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">Még nincs kimenő e-mail.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {emails.map((email) => {
            const linkMatch = email.body.match(/https?:\/\/\S+/);
            return (
              <div key={email.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>
                    Címzett: <span className="text-slate-600 font-medium">{email.to}</span>
                  </span>
                  <span>{formatDateTime(email.createdAt)}</span>
                </div>
                <p className="mt-1 font-semibold text-slate-900">{email.subject}</p>
                <pre className="mt-3 text-xs text-slate-600 whitespace-pre-wrap font-sans bg-slate-50 rounded-lg p-3">
                  {email.body}
                </pre>
                {linkMatch && (
                  <a
                    href={linkMatch[0]}
                    className="mt-3 inline-block text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Válaszlink megnyitása →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
