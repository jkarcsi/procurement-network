"use client";

import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";

export default function PasskeyLogin() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setBusy(true);
    try {
      const options = await fetch("/api/passkeys/login-options", { method: "POST" }).then((r) =>
        r.json(),
      );
      const response = await startAuthentication({ optionsJSON: options });
      const result = await fetch("/api/passkeys/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      }).then((r) => r.json());
      if (result.verified) {
        window.location.href = result.redirect ?? "/dashboard";
        return;
      }
      setError("A passkey-belépés nem sikerült. Próbáld újra, vagy lépj be jelszóval.");
    } catch {
      setError("A passkey-belépés megszakadt vagy nem támogatott ezen az eszközön.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleLogin}
        disabled={busy}
        className="w-full border border-slate-300 text-slate-700 font-medium py-2.5 rounded-lg hover:border-indigo-600 hover:text-indigo-700 disabled:opacity-50"
      >
        {busy ? "Azonosítás…" : "🔐 Belépés passkey-vel (ujjlenyomat / arcfelismerés)"}
      </button>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
