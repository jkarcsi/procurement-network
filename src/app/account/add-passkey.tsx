"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startRegistration } from "@simplewebauthn/browser";

export default function AddPasskey() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    setBusy(true);
    try {
      const options = await fetch("/api/passkeys/register-options", { method: "POST" }).then(
        (r) => r.json(),
      );
      const response = await startRegistration({ optionsJSON: options });
      const result = await fetch("/api/passkeys/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response, name: defaultPasskeyName() }),
      }).then((r) => r.json());
      if (result.verified) {
        router.refresh();
        return;
      }
      setError("A passkey létrehozása nem sikerült. Próbáld újra.");
    } catch {
      setError("A passkey létrehozása megszakadt vagy nem támogatott ezen az eszközön.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleAdd}
        disabled={busy}
        className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {busy ? "Létrehozás…" : "+ Passkey hozzáadása ehhez az eszközhöz"}
      </button>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}

function defaultPasskeyName(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return "iOS eszköz";
  if (/Android/.test(ua)) return "Android eszköz";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows gép";
  return "Ez az eszköz";
}
