import Link from "next/link";
import { registerAction } from "@/lib/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const { error, role } = await searchParams;
  const defaultRole = role === "SUPPLIER" ? "SUPPLIER" : "BUYER";

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Regisztráció</h1>

      {error && (
        <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <form action={registerAction} className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label
            className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50"
          >
            <input type="radio" name="role" value="BUYER" defaultChecked={defaultRole === "BUYER"} />
            <span className="text-sm">Vevő vagyok</span>
          </label>
          <label
            className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 cursor-pointer has-checked:border-indigo-600 has-checked:bg-indigo-50"
          >
            <input type="radio" name="role" value="SUPPLIER" defaultChecked={defaultRole === "SUPPLIER"} />
            <span className="text-sm">Beszállító vagyok</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Teljes név</label>
          <input
            type="text"
            name="name"
            required
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Cégnév</label>
          <input
            type="text"
            name="companyName"
            required
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">E-mail cím</label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Jelszó (min. 8 karakter)</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700">
          Fiók létrehozása
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        Van már fiókod?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Lépj be itt
        </Link>
      </p>
    </div>
  );
}
