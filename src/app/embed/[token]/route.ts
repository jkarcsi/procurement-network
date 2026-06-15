import { headers } from "next/headers";
import { db } from "@/lib/db";
import { createEmbeddedRfq } from "@/lib/embed";
import { rateLimit } from "@/lib/rateLimit";

// Chrome-free, iframe-embeddable quote-request widget served as plain HTML so
// it can be embedded on a buyer's own website. GET renders the form; POST
// creates a READY RFQ in the embedding company's account.

const PAGE_STYLE = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: #fff; color: #0f172a; }
  .wrap { max-width: 480px; margin: 0 auto; padding: 20px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  p { font-size: 13px; color: #64748b; margin: 0 0 14px; }
  textarea { width: 100%; min-height: 96px; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px; font: inherit; resize: vertical; }
  button { margin-top: 12px; width: 100%; background: #4f46e5; color: #fff; border: 0; border-radius: 10px; padding: 12px; font-weight: 600; font-size: 15px; cursor: pointer; }
  .err { color: #dc2626; font-size: 13px; margin-bottom: 8px; }
  .ok { background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; border-radius: 10px; padding: 16px; font-size: 14px; }
  .brand { margin-top: 14px; font-size: 11px; color: #94a3b8; text-align: center; }
`;

function shell(body: string): string {
  return `<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${PAGE_STYLE}</style></head><body><div class="wrap">${body}</div></body></html>`;
}

function html(body: string, status = 200): Response {
  return new Response(shell(body), { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function form(error?: string): string {
  return `
    <h1>Kérj ingyenes ajánlatot</h1>
    <p>Írd le egy mondatban, mire van szükséged.</p>
    ${error ? `<div class="err">${error}</div>` : ""}
    <form method="post">
      <textarea name="intakeText" required minlength="10" placeholder="Pl.: Heti két alkalommal takarítót keresek a 600 m²-es budapesti irodánkba"></textarea>
      <button type="submit">Ajánlatot kérek</button>
    </form>
    <div class="brand">Powered by Procura</div>`;
}

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const company = await db.company.findUnique({ where: { embedToken: token } });
  if (!company) return html("<h1>Érvénytelen űrlap</h1>", 404);
  return html(form());
}

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const company = await db.company.findUnique({ where: { embedToken: token } });
  if (!company || company.type !== "BUYER") return html("<h1>Érvénytelen űrlap</h1>", 404);

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`embed:${token}:${ip}`, 5, 60 * 60 * 1000)) {
    return html(form("Túl sok próbálkozás. Kérlek, próbáld újra később."), 429);
  }

  const data = await req.formData();
  const intakeText = String(data.get("intakeText") ?? "").trim();
  if (intakeText.length < 10) return html(form("Írd le legalább egy mondatban, mire van szükséged."), 400);

  await createEmbeddedRfq(company.id, intakeText);
  return html(
    `<div class="ok"><strong>Köszönjük!</strong><br>Megkeresésed rögzítettük, hamarosan ajánlatokkal keresünk.</div><div class="brand">Powered by Procura</div>`,
  );
}
