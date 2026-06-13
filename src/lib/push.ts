import { db } from "./db";

// Push delivery via Expo's push service. No SDK and no API key needed; the
// public endpoint accepts a batch of messages. Failures (and unreachable
// network) are swallowed and time-bounded so a push can never delay or break
// the business flow that triggered it.

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const PUSH_TIMEOUT_MS = 3000;

async function send(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  if (tokens.length === 0) return;
  const messages = tokens.map((to) => ({ to, title, body, sound: "default", data }));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PUSH_TIMEOUT_MS);
  try {
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages),
      signal: controller.signal,
    });
  } catch (err) {
    console.error("expo push failed:", err);
  } finally {
    clearTimeout(timer);
  }
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  const tokens = await db.pushToken.findMany({ where: { userId } });
  await send(
    tokens.map((t) => t.token),
    title,
    body,
    data,
  );
}

export async function sendPushToCompanyUsers(
  companyId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  const users = await db.user.findMany({ where: { companyId }, select: { id: true } });
  if (users.length === 0) return;
  const tokens = await db.pushToken.findMany({ where: { userId: { in: users.map((u) => u.id) } } });
  await send(
    tokens.map((t) => t.token),
    title,
    body,
    data,
  );
}
