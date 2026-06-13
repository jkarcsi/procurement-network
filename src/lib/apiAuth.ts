import crypto from "crypto";
import type { Company } from "@prisma/client";
import { db } from "./db";
import { rateLimit } from "./rateLimit";
import { userFromToken } from "./auth";

// Public API v1 auth. Two bearer credential types are accepted:
//  - "procura_..." API keys (integrations; company-level), stored as SHA-256
//    hashes
//  - HMAC session tokens (the mobile app; carries the signed-in user)

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): string {
  return `procura_${crypto.randomBytes(24).toString("base64url")}`;
}

export type BearerResult =
  | { ok: true; company: Company; userId: string | null; actor: string }
  | { ok: false; status: 401 | 429; message: string };

function bearerToken(req: Request): string {
  const header = req.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

// Resolves either credential type to the owning company. `userId` is set only
// for mobile session tokens; `actor` is a human-readable label for audit logs.
export async function authenticateBearer(req: Request): Promise<BearerResult> {
  const token = bearerToken(req);
  if (!token) return { ok: false, status: 401, message: "Missing bearer token" };

  if (token.startsWith("procura_")) {
    const apiKey = await db.apiKey.findUnique({
      where: { keyHash: hashApiKey(token) },
      include: { company: true },
    });
    if (!apiKey) return { ok: false, status: 401, message: "Invalid API key" };
    if (!rateLimit(`api:${apiKey.id}`, 60, 60_000)) {
      return { ok: false, status: 429, message: "Rate limit exceeded (60 requests/minute)" };
    }
    await db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
    return { ok: true, company: apiKey.company, userId: null, actor: `api:${apiKey.company.name}` };
  }

  const user = await userFromToken(token);
  if (!user || !user.companyId || !user.company) {
    return { ok: false, status: 401, message: "Invalid or expired session" };
  }
  if (!rateLimit(`mobile:${user.id}`, 120, 60_000)) {
    return { ok: false, status: 429, message: "Rate limit exceeded (120 requests/minute)" };
  }
  return { ok: true, company: user.company, userId: user.id, actor: user.email };
}

export function apiError(status: number, message: string) {
  return Response.json({ error: message }, { status });
}
