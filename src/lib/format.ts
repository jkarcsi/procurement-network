export function formatHuf(amount: number): string {
  return `${amount.toLocaleString("hu-HU")} Ft`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "–";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("hu-HU", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "–";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const RFQ_STATUS: Record<string, { label: string; className: string }> = {
  READY: { label: "Kiküldésre kész", className: "bg-amber-100 text-amber-800" },
  SENT: { label: "Kiküldve", className: "bg-blue-100 text-blue-800" },
  DECIDED: { label: "Eldöntve", className: "bg-emerald-100 text-emerald-800" },
  CLOSED: { label: "Lezárva", className: "bg-slate-200 text-slate-700" },
};

export const INVITE_STATUS: Record<string, { label: string; className: string }> = {
  SENT: { label: "Kiküldve", className: "bg-slate-200 text-slate-700" },
  VIEWED: { label: "Megtekintve", className: "bg-blue-100 text-blue-800" },
  DECLINED: { label: "Elutasítva", className: "bg-rose-100 text-rose-800" },
  OFFERED: { label: "Ajánlat érkezett", className: "bg-emerald-100 text-emerald-800" },
};

export const OFFER_STATUS: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Beérkezett", className: "bg-blue-100 text-blue-800" },
  ACCEPTED: { label: "Elfogadva", className: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "Elutasítva", className: "bg-slate-200 text-slate-500" },
};
