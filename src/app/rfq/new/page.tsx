import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { CATEGORIES, REGIONS } from "@/lib/taxonomy";
import RfqWizard from "./wizard";

export default async function NewRfqPage({
  searchParams,
}: {
  searchParams: Promise<{ text?: string }>;
}) {
  const { text } = await searchParams;
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER") {
    const next = text ? `/rfq/new?text=${encodeURIComponent(text)}` : "/rfq/new";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Új ajánlatkérés</h1>
      <p className="mt-1 text-sm text-slate-500">
        Írd le egy mondatban az igényt – a Procura pontosító kérdésekkel strukturált
        ajánlatkéréssé alakítja.
      </p>
      <RfqWizard
        initialText={text ?? ""}
        categories={CATEGORIES.map((c) => ({ id: c.id, name: c.name }))}
        regions={REGIONS}
      />
    </div>
  );
}
