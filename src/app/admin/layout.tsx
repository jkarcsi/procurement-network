import Link from "next/link";

// Tab navigation only — auth runs in every page via requireAdmin().
const TABS = [
  { href: "/admin", label: "Áttekintés" },
  { href: "/admin/users", label: "Felhasználók" },
  { href: "/admin/rfqs", label: "Ajánlatkérések" },
  { href: "/admin/suppliers", label: "Beszállítók" },
  { href: "/admin/credits", label: "Kreditek" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
      <nav className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="text-sm px-3 py-1.5 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
