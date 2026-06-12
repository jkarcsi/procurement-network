"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateApiKey() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/account/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok || !data.key) {
        setError("A kulcs létrehozása nem sikerült. Próbáld újra.");
        return;
      }
      setCreatedKey(data.key);
      setName("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {createdKey && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-amber-800">
            Az új kulcsot csak most látod – másold ki és tárold biztonságosan:
          </p>
          <code className="mt-2 block bg-white border border-amber-200 rounded px-2 py-1.5 text-xs break-all select-all">
            {createdKey}
          </code>
        </div>
      )}
      <div className="flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kulcs neve (pl. ERP integráció)"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleCreate}
          disabled={busy}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Létrehozás…" : "+ Új API kulcs"}
        </button>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
