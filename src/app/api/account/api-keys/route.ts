import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiKey, hashApiKey } from "@/lib/apiAuth";

// Creates an API key for the user's company; the plaintext key is returned
// once here and never stored.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !user.companyId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim() || "API kulcs";

  const key = generateApiKey();
  await db.apiKey.create({
    data: { companyId: user.companyId, name, keyHash: hashApiKey(key) },
  });

  return Response.json({ key });
}
