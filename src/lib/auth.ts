import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "./db";

const SECRET = process.env.AUTH_SECRET ?? "dev-only-secret-change-in-production";
const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

export async function createSession(userId: string) {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expires}`;
  const token = `${payload}.${sign(payload)}`;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, sig] = parts;
  if (sign(`${userId}.${expires}`) !== sig) return null;
  if (Number(expires) < Date.now()) return null;
  return db.user.findUnique({
    where: { id: userId },
    include: { company: { include: { supplierProfile: true } } },
  });
}
