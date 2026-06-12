import Link from "next/link";
import { loginAction } from "@/lib/actions";
import PasskeyLogin from "./passkey-login";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Belépés</h1>
      <p className="mt-1 text-sm text-slate-500">
        Demo fiókok: <code className="bg-slate-100 px-1 rounded">demo@vevo.hu</code> /{" "}
        <code className="bg-slate-100 px-1 rounded">demo@beszallito.hu</code> (jelszó:{" "}
        <code className="bg-slate-100 px-1 rounded">demo1234</code>)
      </p>

      {error && (
        <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <form action={loginAction} className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
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
          <label className="block text-sm font-medium text-slate-700">Jelszó</label>
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700">
          Belépés
        </button>
      </form>

      <PasskeyLogin />

      <p className="mt-4 text-sm text-slate-500">
        Még nincs fiókod?{" "}
        <Link href="/register" className="text-indigo-600 hover:underline">
          Regisztrálj itt
        </Link>
      </p>
    </div>
  );
}
