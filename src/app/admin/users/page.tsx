import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { toggleUserActiveAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Vevő",
  SUPPLIER: "Beszállító",
  ADMIN: "Admin",
};

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const users = await db.user.findMany({
    include: { company: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Név / e-mail</th>
            <th className="px-4 py-3 font-medium">Szerep</th>
            <th className="px-4 py-3 font-medium">Cég</th>
            <th className="px-4 py-3 font-medium">Csomag</th>
            <th className="px-4 py-3 font-medium">Regisztrált</th>
            <th className="px-4 py-3 font-medium">Állapot</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr key={u.id} className={u.active ? "" : "opacity-60"}>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{u.name}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </td>
              <td className="px-4 py-3 text-slate-600">{ROLE_LABEL[u.role] ?? u.role}</td>
              <td className="px-4 py-3 text-slate-600">{u.company?.name ?? "–"}</td>
              <td className="px-4 py-3 text-slate-600">{u.company?.plan ?? "–"}</td>
              <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {u.active ? "Aktív" : "Felfüggesztve"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {u.id !== admin.id && (
                  <form action={toggleUserActiveAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button
                      className={`text-xs px-3 py-1.5 rounded-lg ${
                        u.active
                          ? "text-rose-700 border border-rose-200 hover:bg-rose-50"
                          : "text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      {u.active ? "Felfüggesztés" : "Visszaállítás"}
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
