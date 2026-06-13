import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";

// Registers the device's Expo push token for the signed-in user. Upsert by
// token so a device that switches accounts re-points to the current user.
export async function POST(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (!auth.userId) return apiError(403, "User session token required");

  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "").trim();
  if (!token) return apiError(400, "token is required");
  const platform = body.platform ? String(body.platform) : null;

  await db.pushToken.upsert({
    where: { token },
    update: { userId: auth.userId, platform },
    create: { userId: auth.userId, token, platform },
  });
  return Response.json({ ok: true });
}

// Removes a device token (e.g. on sign-out) so we stop pushing to it.
export async function DELETE(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (!auth.userId) return apiError(403, "User session token required");

  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "").trim();
  if (!token) return apiError(400, "token is required");

  await db.pushToken.deleteMany({ where: { token, userId: auth.userId } });
  return Response.json({ ok: true });
}
