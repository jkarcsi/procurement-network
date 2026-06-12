import crypto from "crypto";
import { db } from "./db";
import { rateLimit } from "./rateLimit";

// Public API v1 auth: "Authorization: Bearer procura_..." keys, stored as
// SHA-256 hashes. Returns the owning company or null.

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): string {
  return `procura_${crypto.randomBytes(24).toString("base64url")}`;
}

export async function authenticateApiKey(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const key = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!key.startsWith("procura_")) return null;

  const apiKey = await db.apiKey.findUnique({
    where: { keyHash: hashApiKey(key) },
    include: { company: true },
  });
  if (!apiKey) return null;
  if (!rateLimit(`api:${apiKey.id}`, 60, 60_000)) return null;

  await db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
  return apiKey.company;
}

export function apiError(status: number, message: string) {
  return Response.json({ error: message }, { status });
}
