import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";
import { unreadNotificationCount } from "@/lib/notifications";

// Current user/company for the mobile app. Requires a session token (not an
// integration API key, which has no associated user).
export async function GET(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  if (!auth.userId) return apiError(403, "User session token required");

  const [user, unread] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: auth.userId } }),
    unreadNotificationCount(auth.userId),
  ]);

  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    company: {
      id: auth.company.id,
      name: auth.company.name,
      type: auth.company.type,
      plan: auth.company.plan,
      creditBalance: auth.company.creditBalance,
    },
    unreadNotifications: unread,
  });
}
