// Centralized status labels + semantic badge colors for the mobile app,
// mirroring the web app's src/lib/format.ts. Labels are Hungarian (user-facing);
// colors encode meaning so an active request never looks like a closed one.

export type Badge = { label: string; bg: string; fg: string };

const RFQ_STATUS: Record<string, Badge> = {
  READY: { label: "Kiküldésre kész", bg: "#fef3c7", fg: "#b45309" },
  SENT: { label: "Kiküldve", bg: "#e0e7ff", fg: "#4338ca" },
  DECIDED: { label: "Eldöntve", bg: "#d1fae5", fg: "#047857" },
  CLOSED: { label: "Lezárva", bg: "#e2e8f0", fg: "#475569" },
};

const INVITE_STATUS: Record<string, Badge> = {
  SENT: { label: "Új megkeresés", bg: "#e0e7ff", fg: "#4338ca" },
  VIEWED: { label: "Megtekintve", bg: "#e2e8f0", fg: "#475569" },
  OFFERED: { label: "Ajánlat beadva", bg: "#d1fae5", fg: "#047857" },
  DECLINED: { label: "Elutasítva", bg: "#fee2e2", fg: "#b91c1c" },
};

const FALLBACK: Badge = { label: "", bg: "#e2e8f0", fg: "#475569" };

export function rfqStatusBadge(status: string): Badge {
  return RFQ_STATUS[status] ?? { ...FALLBACK, label: status };
}

export function inviteStatusBadge(status: string): Badge {
  return INVITE_STATUS[status] ?? { ...FALLBACK, label: status };
}
