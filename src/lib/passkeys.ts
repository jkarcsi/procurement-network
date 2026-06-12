import crypto from "crypto";
import { cookies } from "next/headers";

// WebAuthn relying-party config and challenge storage. The challenge is
// kept in a short-lived HMAC-signed cookie between the options and verify
// steps, so no server-side challenge table is needed.

const SECRET = process.env.AUTH_SECRET ?? "dev-only-secret-change-in-production";
const CHALLENGE_COOKIE = "webauthn-challenge";
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const rpName = "Procura";
export const rpID = new URL(BASE_URL).hostname;
export const expectedOrigin = new URL(BASE_URL).origin;

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

export async function storeChallenge(challenge: string) {
  const expires = Date.now() + CHALLENGE_TTL_MS;
  const payload = `${challenge}.${expires}`;
  (await cookies()).set(CHALLENGE_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CHALLENGE_TTL_MS / 1000,
  });
}

// Single use: the cookie is cleared on read.
export async function consumeChallenge(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(CHALLENGE_COOKIE)?.value;
  store.delete(CHALLENGE_COOKIE);
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [challenge, expires, sig] = parts;
  if (sign(`${challenge}.${expires}`) !== sig) return null;
  if (Number(expires) < Date.now()) return null;
  return challenge;
}
