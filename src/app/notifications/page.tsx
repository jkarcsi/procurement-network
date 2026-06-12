import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { markAllNotificationsReadAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";

const TYPE_ICON: Record<string, string> = {
  OFFER_RECEIVED: "📥",
  OFFER_ACCEPTED: "✅",
  RFQ_INVITE: "📨",
};

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/notifications");

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Értesítések</h1>
        {unread > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button className="text-sm text-indigo-600 hover:underline">
              Mind olvasottnak jelölése ({unread})
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-slate-600">Még nincs értesítésed.</p>
          <p className="mt-1 text-sm text-slate-400">
            Itt jelennek meg az ajánlatkéréseiddel és ajánlataiddal kapcsolatos események.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {notifications.map((n) => {
            const inner = (
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  n.read
                    ? "bg-white border-slate-200"
                    : "bg-indigo-50 border-indigo-200"
                }`}
              >
                <span className="text-lg shrink-0">{TYPE_ICON[n.type] ?? "🔔"}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${n.read ? "text-slate-700" : "font-medium text-slate-900"}`}>
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(n.createdAt)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 mt-1.5 rounded-full bg-indigo-600 shrink-0" />}
              </div>
            );
            return (
              <li key={n.id}>
                {n.linkUrl ? (
                  <Link href={n.linkUrl} className="block hover:opacity-90">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
