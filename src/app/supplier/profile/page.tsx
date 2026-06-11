import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { updateSupplierProfileAction } from "@/lib/actions";
import { CATEGORIES, REGIONS } from "@/lib/taxonomy";

export default async function SupplierProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const user = await getSessionUser();
  const profile = user?.company?.supplierProfile;
  if (!user || user.role !== "SUPPLIER" || !profile) redirect("/login?next=/supplier/profile");

  const [myCategories, myRegions] = await Promise.all([
    db.supplierCategory.findMany({ where: { supplierId: profile.id } }),
    db.supplierRegion.findMany({ where: { supplierId: profile.id } }),
  ]);
  const categoryIds = new Set(myCategories.map((c) => c.categoryId));
  const regionIds = new Set(myRegions.map((r) => r.regionId));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Beszállítói profil</h1>
      <p className="mt-1 text-sm text-slate-500">
        Minél pontosabb a profil, annál relevánsabb ajánlatkéréseket kapsz a matchingtől.
      </p>

      {ok && (
        <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg p-3">
          Profil elmentve.
        </div>
      )}

      <form
        action={updateSupplierProfileAction}
        className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Bemutatkozás</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={profile.description ?? ""}
            placeholder="Mivel foglalkoztok, milyen referenciáitok vannak?"
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Telefon</label>
            <input
              name="phone"
              defaultValue={profile.phone ?? ""}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Weboldal</label>
            <input
              name="website"
              defaultValue={profile.website ?? ""}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Tanúsítványok, engedélyek (vesszővel elválasztva)
          </label>
          <input
            name="certifications"
            defaultValue={profile.certifications ?? ""}
            placeholder="pl. ISO 9001, NKVH F-Gáz képesítés"
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">Kategóriák</p>
          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="categories"
                  value={cat.id}
                  defaultChecked={categoryIds.has(cat.id)}
                  className="w-4 h-4 accent-indigo-600"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">Szolgáltatási régiók</p>
          <label className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="nationwide"
              defaultChecked={profile.nationwide}
              className="w-4 h-4 accent-indigo-600"
            />
            Országos lefedettség
          </label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REGIONS.map((region) => (
              <label key={region.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="regions"
                  value={region.id}
                  defaultChecked={regionIds.has(region.id)}
                  className="w-4 h-4 accent-indigo-600"
                />
                {region.name}
              </label>
            ))}
          </div>
        </div>

        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700">
          Profil mentése
        </button>
      </form>
    </div>
  );
}
