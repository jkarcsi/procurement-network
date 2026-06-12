import { db } from "./db";

// In-app notifications. Notification failures must never break the business
// flow that triggered them, so the helpers swallow and log errors.

export async function notifyUser(params: {
  userId: string;
  type: "OFFER_RECEIVED" | "OFFER_ACCEPTED" | "RFQ_INVITE";
  message: string;
  linkUrl?: string;
}) {
  try {
    await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        message: params.message,
        linkUrl: params.linkUrl ?? null,
      },
    });
  } catch (err) {
    console.error("notifyUser failed:", err);
  }
}

export async function notifyCompanyUsers(params: {
  companyId: string;
  type: "OFFER_RECEIVED" | "OFFER_ACCEPTED" | "RFQ_INVITE";
  message: string;
  linkUrl?: string;
}) {
  try {
    const users = await db.user.findMany({ where: { companyId: params.companyId } });
    if (users.length === 0) return;
    await db.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: params.type,
        message: params.message,
        linkUrl: params.linkUrl ?? null,
      })),
    });
  } catch (err) {
    console.error("notifyCompanyUsers failed:", err);
  }
}

export async function unreadNotificationCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, read: false } });
}
