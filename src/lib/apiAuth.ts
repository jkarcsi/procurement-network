import crypto from "crypto";
import type { Company } from "@prisma/client";
import { db } from "./db";
import { rateLimit } from "./rateLimit";

// Public API v1 auth: "Authorization: Bearer procura_..." keys, stored as
// SHA-256 hashes.

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): string {
  return `procura_${crypto.randomBytes(24).toString("base64url")}`;
}

export type ApiAuthResult =
  | { ok: true; company: Company }
  | { ok: false; status: 401 | 429; message: string };

export async function authenticateApiKey(req: Request): Promise<ApiAuthResult> {
  const header = req.headers.get("authorization") ?? "";
  const key = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!key.startsWith("procura_")) {
    return { ok: false, status: 401, message: "Invalid or missing API key" };
  }

  const apiKey = await db.apiKey.findUnique({
    where: { keyHash: hashApiKey(key) },
    include: { company: true },
  });
  if (!apiKey) return { ok: false, status: 401, message: "Invalid or missing API key" };
  if (!rateLimit(`api:${apiKey.id}`, 60, 60_000)) {
    return { ok: false, status: 429, message: "Rate limit exceeded (60 requests/minute)" };
  }

  await db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
  return { ok: true, company: apiKey.company };
}

export function apiError(status: number, message: string) {
  return Response.json({ error: message }, { status });
}
