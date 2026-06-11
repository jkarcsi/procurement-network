import Anthropic from "@anthropic-ai/sdk";
import {
  CATEGORIES,
  REGIONS,
  REGION_KEYWORDS,
  GENERIC_CLARIFY_QUESTIONS,
} from "./taxonomy";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic();
}

export type ClarifyResult = {
  title: string;
  categoryId: string | null;
  regionId: string | null;
  questions: string[];
  aiUsed: boolean;
};

export type RfqSpec = {
  summary: string;
  scope: string[];
  location: string;
  schedule: string;
  contractType: string;
  requirements: string[];
  notes: string;
};

export type QA = { question: string; answer: string };

function firstTextBlock(content: Anthropic.ContentBlock[]): string {
  for (const block of content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

// --- Szabály-alapú fallback (API kulcs nélkül is működik a teljes loop) ---

function guessCategory(text: string): string | null {
  const lower = text.toLowerCase();
  let best: { id: string; hits: number } | null = null;
  for (const cat of CATEGORIES) {
    const hits = cat.keywords.filter((k) => lower.includes(k)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { id: cat.id, hits };
  }
  return best?.id ?? null;
}

function guessRegion(text: string): string | null {
  const lower = text.toLowerCase();
  for (const region of REGIONS) {
    if (lower.includes(region.name.toLowerCase())) return region.id;
  }
  for (const [id, keywords] of Object.entries(REGION_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return id;
  }
  return null;
}

function fallbackClarify(intakeText: string): ClarifyResult {
  const categoryId = guessCategory(intakeText);
  const regionId = guessRegion(intakeText);
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const title = category
    ? `${category.name} – ajánlatkérés`
    : intakeText.length > 60
      ? `${intakeText.slice(0, 57)}…`
      : intakeText;
  return {
    title,
    categoryId,
    regionId,
    questions: category ? category.clarifyQuestions : GENERIC_CLARIFY_QUESTIONS,
    aiUsed: false,
  };
}

function fallbackSpec(intakeText: string, qa: QA[], regionName: string | null): RfqSpec {
  const answered = qa.filter((x) => x.answer.trim().length > 0);
  return {
    summary: intakeText,
    scope: answered.map((x) => `${x.question} — ${x.answer}`),
    location: regionName ?? "Egyeztetés alapján",
    schedule: "Egyeztetés alapján",
    contractType: "Egyeztetés alapján",
    requirements: [],
    notes: "Az ajánlatkérés AI-segítség nélkül, a megadott válaszok alapján készült.",
  };
}

// --- AI-hívások (Claude, strukturált kimenettel) ---

export async function clarifyIntake(intakeText: string): Promise<ClarifyResult> {
  const client = getClient();
  if (!client) return fallbackClarify(intakeText);

  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["title", "categoryId", "regionId", "questions"],
    properties: {
      title: {
        type: "string",
        description: "Rövid, tárgyilagos magyar cím az ajánlatkéréshez (max 80 karakter)",
      },
      categoryId: {
        type: "string",
        enum: [...CATEGORIES.map((c) => c.id), "egyeb"],
        description: "A legjobban illő kategória, vagy 'egyeb' ha egyik sem illik",
      },
      regionId: {
        type: "string",
        enum: [...REGIONS.map((r) => r.id), "ismeretlen"],
        description: "A teljesítés helye alapján a vármegye, vagy 'ismeretlen'",
      },
      questions: {
        type: "array",
        items: { type: "string" },
        description: "3-8 célzott pontosító kérdés magyarul",
      },
    },
  };

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system:
        "B2B beszerzési asszisztens vagy magyar KKV-knak. A vevő egy rövid mondatban írja le az igényét. " +
        "A feladatod: cím javaslása, kategória és régió felismerése, valamint 3-8 olyan pontosító kérdés megfogalmazása, " +
        "amelyek válaszaiból teljes értékű, beszállítóknak kiküldhető ajánlatkérés (RFQ) állítható össze. " +
        "Csak olyat kérdezz, ami az árazáshoz és a teljesítéshez tényleg kell. Ne kérdezz rá arra, ami a leírásból már kiderül.",
      messages: [{ role: "user", content: `A vevő igénye: "${intakeText}"` }],
      output_config: { format: { type: "json_schema", schema } },
    });
    const parsed = JSON.parse(firstTextBlock(response.content)) as {
      title: string;
      categoryId: string;
      regionId: string;
      questions: string[];
    };
    return {
      title: parsed.title,
      categoryId: parsed.categoryId === "egyeb" ? null : parsed.categoryId,
      regionId: parsed.regionId === "ismeretlen" ? null : parsed.regionId,
      questions: parsed.questions.slice(0, 8),
      aiUsed: true,
    };
  } catch (err) {
    console.error("AI clarifyIntake hiba, fallback módra váltás:", err);
    return fallbackClarify(intakeText);
  }
}

export async function buildSpec(
  intakeText: string,
  qa: QA[],
  categoryName: string | null,
  regionName: string | null,
): Promise<{ spec: RfqSpec; aiUsed: boolean }> {
  const client = getClient();
  if (!client) return { spec: fallbackSpec(intakeText, qa, regionName), aiUsed: false };

  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["summary", "scope", "location", "schedule", "contractType", "requirements", "notes"],
    properties: {
      summary: { type: "string", description: "2-3 mondatos összefoglaló a beszállítóknak" },
      scope: { type: "array", items: { type: "string" }, description: "A feladat terjedelme pontokban" },
      location: { type: "string", description: "Teljesítés helye" },
      schedule: { type: "string", description: "Ütemezés, gyakoriság, kezdés" },
      contractType: { type: "string", description: "Szerződés jellege (folyamatos / projekt / eseti)" },
      requirements: { type: "array", items: { type: "string" }, description: "Elvárások, tanúsítványok, feltételek" },
      notes: { type: "string", description: "Egyéb fontos információ az ajánlatadáshoz" },
    },
  };

  const qaText = qa
    .map((x) => `K: ${x.question}\nV: ${x.answer.trim() || "(nincs válasz)"}`)
    .join("\n\n");

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system:
        "B2B beszerzési asszisztens vagy. Az eredeti vevői igényből és a pontosító kérdésekre adott válaszokból " +
        "állíts össze strukturált, beszállítóknak kiküldhető magyar nyelvű ajánlatkérés-specifikációt. " +
        "Csak a megadott információkra támaszkodj, ne találj ki adatokat. Ami nem ismert, ott írd: 'Egyeztetés alapján'.",
      messages: [
        {
          role: "user",
          content:
            `Eredeti igény: "${intakeText}"\n` +
            `Kategória: ${categoryName ?? "ismeretlen"}\n` +
            `Régió: ${regionName ?? "ismeretlen"}\n\n` +
            `Pontosító kérdések és válaszok:\n${qaText}`,
        },
      ],
      output_config: { format: { type: "json_schema", schema } },
    });
    const spec = JSON.parse(firstTextBlock(response.content)) as RfqSpec;
    return { spec, aiUsed: true };
  } catch (err) {
    console.error("AI buildSpec hiba, fallback módra váltás:", err);
    return { spec: fallbackSpec(intakeText, qa, regionName), aiUsed: false };
  }
}

export type OfferForComparison = {
  companyName: string;
  priceNet: number;
  priceUnit: string;
  startDate: string | null;
  validUntil: string | null;
  notes: string | null;
};

function fallbackComparison(offers: OfferForComparison[]): string {
  if (offers.length === 0) return "Még nincs beérkezett ajánlat.";
  const sorted = [...offers].sort((a, b) => a.priceNet - b.priceNet);
  const cheapest = sorted[0];
  const lines = sorted.map(
    (o, i) =>
      `${i + 1}. ${o.companyName}: ${o.priceNet.toLocaleString("hu-HU")} Ft (${o.priceUnit})` +
      (o.startDate ? `, kezdés: ${o.startDate}` : ""),
  );
  return (
    `Beérkezett ajánlatok ár szerint rendezve:\n\n${lines.join("\n")}\n\n` +
    `A legalacsonyabb nettó árat ${cheapest.companyName} adta ` +
    `(${cheapest.priceNet.toLocaleString("hu-HU")} Ft, ${cheapest.priceUnit}). ` +
    `Részletes AI-összehasonlításhoz adj meg ANTHROPIC_API_KEY-t a .env fájlban.`
  );
}

export async function compareOffers(
  rfqSummary: string,
  offers: OfferForComparison[],
): Promise<{ text: string; aiUsed: boolean }> {
  const client = getClient();
  if (!client) return { text: fallbackComparison(offers), aiUsed: false };

  const offerText = offers
    .map(
      (o, i) =>
        `Ajánlat ${i + 1} – ${o.companyName}\n` +
        `Nettó ár: ${o.priceNet} Ft (${o.priceUnit})\n` +
        `Kezdés: ${o.startDate ?? "nincs megadva"}\n` +
        `Érvényesség: ${o.validUntil ?? "nincs megadva"}\n` +
        `Megjegyzés: ${o.notes ?? "-"}`,
    )
    .join("\n\n");

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system:
        "B2B beszerzési tanácsadó vagy magyar KKV-knak. Hasonlítsd össze a beérkezett ajánlatokat tárgyilagosan. " +
        "Emeld ki az ár/érték szempontokat, a kockázatokat és a hiányzó információkat. " +
        "A végén adj rövid, indokolt javaslatot, de hangsúlyozd, hogy a döntés a vevőé. " +
        "Tömör, jól tagolt magyar szöveget írj, legfeljebb 300 szóban. Ne használj markdown formázást, csak sima szöveget és sorszámozott listákat.",
      messages: [
        {
          role: "user",
          content: `Az ajánlatkérés összefoglalója: ${rfqSummary}\n\nBeérkezett ajánlatok:\n\n${offerText}`,
        },
      ],
    });
    return { text: firstTextBlock(response.content), aiUsed: true };
  } catch (err) {
    console.error("AI compareOffers hiba, fallback módra váltás:", err);
    return { text: fallbackComparison(offers), aiUsed: false };
  }
}
