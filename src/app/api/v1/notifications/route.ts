import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";

// Notifications for the signed-in mobile user. Session token only (an API key
// has no associated user).
export async function GET(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (!auth.userId) return apiError(403, "User session token required");

  const items = await db.notification.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return Response.json({
    data: items.map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      linkUrl: n.linkUrl,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
    unread: items.filter((n) => !n.read).length,
  });
}

// Marks all of the user's notifications read.
export async function POST(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (!auth.userId) return apiError(403, "User session token required");

  await db.notification.updateMany({
    where: { userId: auth.userId, read: false },
    data: { read: true },
  });
  return Response.json({ ok: true });
}
