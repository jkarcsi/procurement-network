"use client";

import { useState } from "react";
import { clarifyRfqAction, createRfqAction } from "@/lib/actions";
import type { ClarifyResult } from "@/lib/ai";

type Option = { id: string; name: string };

export default function RfqWizard({
  initialText,
  categories,
  regions,
}: {
  initialText: string;
  categories: Option[];
  regions: Option[];
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clarify, setClarify] = useState<ClarifyResult | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);

  async function handleClarify() {
    setError(null);
    setLoading(true);
    try {
      const result = await clarifyRfqAction(text);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setClarify(result);
      setTitle(result.title);
      setCategoryId(result.categoryId ?? "");
      setRegionId(result.regionId ?? "");
      setAnswers(result.questions.map(() => ""));
      setStep(2);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!clarify) return;
    setError(null);
    setLoading(true);
    try {
      await createRfqAction({
        intakeText: text,
        title,
        categoryId: categoryId || null,
        regionId: regionId || null,
        deadline: deadline || null,
        qa: clarify.questions.map((q, i) => ({ question: q, answer: answers[i] ?? "" })),
      });
    } catch (err) {
      // A successful redirect is also thrown as an "error" – let that one through.
      if (err && typeof err === "object" && "digest" in err) throw err;
      setError("Nem sikerült létrehozni az ajánlatkérést. Próbáld újra.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h2 className="font-semibold text-slate-900">Mire van szükséged?</h2>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={step === 2}
          rows={3}
          placeholder="Pl.: Heti két alkalommal takarítót keresek 600 m²-es budapesti irodánkba"
          className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
        />
        {step === 1 && (
          <button
            onClick={handleClarify}
            disabled={loading || text.trim().length < 10}
            className="mt-3 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Az AI elemzi az igényt…" : "AI pontosítás indítása"}
          </button>
        )}
        {step === 2 && (
          <button
            onClick={() => {
              setStep(1);
              setClarify(null);
            }}
            className="mt-3 text-sm text-slate-500 hover:text-indigo-700"
          >
            ← Igény módosítása
          </button>
        )}
      </div>

      {step === 2 && clarify && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="font-semibold text-slate-900">Pontosítás</h2>
            {!clarify.aiUsed && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                sablon alapú (nincs AI kulcs)
              </span>
            )}
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Ajánlatkérés címe</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Kategória</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">– válassz –</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Régió</label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">– válassz –</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Ajánlattételi határidő (opcionális)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-500">
              Válaszolj az AI kérdéseire – minél több a részlet, annál pontosabb ajánlatokat kapsz.
              Az üresen hagyott kérdések kimaradnak.
            </p>
            {clarify.questions.map((q, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-slate-700">{q}</label>
                <input
                  value={answers[i] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))
                  }
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-6 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Specifikáció összeállítása…" : "Ajánlatkérés összeállítása →"}
          </button>
        </div>
      )}
    </div>
  );
}
