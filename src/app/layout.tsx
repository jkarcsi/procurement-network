import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Procura – AI-támogatott B2B beszerzési hálózat",
  description:
    "Egy mondatból kiküldhető ajánlatkérés: AI-intake, beszállítói shortlist, strukturált ajánlat-összehasonlítás magyar KKV-knak.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="hu" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200">
          <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-indigo-700">Procura</span>
              <span className="hidden sm:inline text-xs text-slate-500">
                AI-támogatott B2B beszerzési hálózat
              </span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              {user?.role === "BUYER" && (
                <>
                  <Link href="/dashboard" className="text-slate-600 hover:text-indigo-700">
                    Ajánlatkéréseim
                  </Link>
                  <Link
                    href="/rfq/new"
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                  >
                    + Új ajánlatkérés
                  </Link>
                </>
              )}
              {user?.role === "SUPPLIER" && (
                <>
                  <Link href="/supplier" className="text-slate-600 hover:text-indigo-700">
                    Beszállítói portál
                  </Link>
                  <Link href="/supplier/opportunities" className="text-slate-600 hover:text-indigo-700">
                    Nyílt lehetőségek
                  </Link>
                  <Link href="/supplier/profile" className="text-slate-600 hover:text-indigo-700">
                    Profil
                  </Link>
                </>
              )}
              {user && (
                <Link href="/outbox" className="text-slate-400 hover:text-indigo-700" title="Demo: kimenő e-mailek">
                  Outbox
                </Link>
              )}
              {user ? (
                <form action={logoutAction} className="flex items-center gap-3">
                  <span className="hidden md:inline text-slate-400">{user.email}</span>
                  <button className="text-slate-600 hover:text-indigo-700">Kilépés</button>
                </form>
              ) : (
                <>
                  <Link href="/login" className="text-slate-600 hover:text-indigo-700">
                    Belépés
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                  >
                    Regisztráció
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-400 flex justify-between">
            <span>Procura MVP – demo környezet</span>
            <span>Beachhead: facility + compliance szolgáltatások</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
