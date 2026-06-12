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

// --- Rule-based fallback (the full loop works without an API key) ---

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

// --- AI calls (Claude, structured output; user-facing text is Hungarian) ---

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
        description: "Short, matter-of-fact Hungarian title for the RFQ (max 80 characters)",
      },
      categoryId: {
        type: "string",
        enum: [...CATEGORIES.map((c) => c.id), "other"],
        description: "The best-matching category, or 'other' if none fits",
      },
      regionId: {
        type: "string",
        enum: [...REGIONS.map((r) => r.id), "unknown"],
        description: "The county based on the place of performance, or 'unknown'",
      },
      questions: {
        type: "array",
        items: { type: "string" },
        description: "3-8 targeted clarifying questions in Hungarian",
      },
    },
  };

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system:
        "You are a B2B procurement assistant for Hungarian SMEs. The buyer describes their need in a short sentence. " +
        "Your job: suggest a title, detect category and region, and formulate 3-8 clarifying questions whose answers " +
        "make a complete RFQ that can be sent to suppliers. Write the title and the questions in Hungarian. " +
        "Only ask what is genuinely needed for pricing and delivery. Don't ask about anything already clear from the description.",
      messages: [{ role: "user", content: `The buyer's need: "${intakeText}"` }],
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
      categoryId: parsed.categoryId === "other" ? null : parsed.categoryId,
      regionId: parsed.regionId === "unknown" ? null : parsed.regionId,
      questions: parsed.questions.slice(0, 8),
      aiUsed: true,
    };
  } catch (err) {
    console.error("AI clarifyIntake failed, switching to fallback mode:", err);
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
      summary: { type: "string", description: "2-3 sentence Hungarian summary for suppliers" },
      scope: { type: "array", items: { type: "string" }, description: "Scope of work as bullet points, in Hungarian" },
      location: { type: "string", description: "Place of performance" },
      schedule: { type: "string", description: "Schedule, frequency, start" },
      contractType: { type: "string", description: "Contract type (ongoing / project / one-off)" },
      requirements: { type: "array", items: { type: "string" }, description: "Expectations, certifications, conditions" },
      notes: { type: "string", description: "Other information important for quoting" },
    },
  };

  const qaText = qa
    .map((x) => `Q: ${x.question}\nA: ${x.answer.trim() || "(no answer)"}`)
    .join("\n\n");

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system:
        "You are a B2B procurement assistant. From the buyer's original need and the answers to the clarifying " +
        "questions, assemble a structured Hungarian-language RFQ specification that can be sent to suppliers. " +
        "Rely only on the information provided; don't invent data. Where something is unknown, write: 'Egyeztetés alapján'.",
      messages: [
        {
          role: "user",
          content:
            `Original need: "${intakeText}"\n` +
            `Category: ${categoryName ?? "unknown"}\n` +
            `Region: ${regionName ?? "unknown"}\n\n` +
            `Clarifying questions and answers:\n${qaText}`,
        },
      ],
      output_config: { format: { type: "json_schema", schema } },
    });
    const spec = JSON.parse(firstTextBlock(response.content)) as RfqSpec;
    return { spec, aiUsed: true };
  } catch (err) {
    console.error("AI buildSpec failed, switching to fallback mode:", err);
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
        `Offer ${i + 1} – ${o.companyName}\n` +
        `Net price: ${o.priceNet} HUF (${o.priceUnit})\n` +
        `Start: ${o.startDate ?? "not provided"}\n` +
        `Valid until: ${o.validUntil ?? "not provided"}\n` +
        `Notes: ${o.notes ?? "-"}`,
    )
    .join("\n\n");

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system:
        "You are a B2B procurement advisor for Hungarian SMEs. Compare the received offers objectively. " +
        "Highlight price/value considerations, risks, and missing information. " +
        "Finish with a short, justified recommendation, but stress that the decision belongs to the buyer. " +
        "Write concise, well-structured Hungarian text, at most 300 words. Use plain text and numbered lists only, no markdown formatting.",
      messages: [
        {
          role: "user",
          content: `RFQ summary: ${rfqSummary}\n\nReceived offers:\n\n${offerText}`,
        },
      ],
    });
    return { text: firstTextBlock(response.content), aiUsed: true };
  } catch (err) {
    console.error("AI compareOffers failed, switching to fallback mode:", err);
    return { text: fallbackComparison(offers), aiUsed: false };
  }
}
