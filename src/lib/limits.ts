import { db } from "./db";

// Server-side plan limits. FREE tier caps volume; PRO removes the caps.
// Pro subscription checkout is wired in P3 part 2 — until then every
// company is FREE by default.

export const FREE_MAX_ACTIVE_RFQS = 3;
export const FREE_MAX_INVITES_PER_RFQ = 5;

type LimitResult = { ok: true } | { ok: false; error: string };

export async function checkRfqCreationLimit(companyId: string): Promise<LimitResult> {
  const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });
  if (company.plan === "PRO") return { ok: true };

  const activeCount = await db.rfq.count({
    where: { companyId, status: { in: ["READY", "SENT"] } },
  });
  if (activeCount >= FREE_MAX_ACTIVE_RFQS) {
    return {
      ok: false,
      error:
        `Az ingyenes csomagban legfeljebb ${FREE_MAX_ACTIVE_RFQS} aktív ajánlatkérésed lehet. ` +
        `Zárj le egy korábbit, vagy válts Pro csomagra az Árak oldalon.`,
    };
  }
  return { ok: true };
}

export async function checkInviteLimit(
  companyId: string,
  inviteCount: number,
): Promise<LimitResult> {
  const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });
  if (company.plan === "PRO") return { ok: true };

  if (inviteCount > FREE_MAX_INVITES_PER_RFQ) {
    return {
      ok: false,
      error:
        `Az ingyenes csomagban ajánlatkérésenként legfeljebb ${FREE_MAX_INVITES_PER_RFQ} beszállító hívható meg. ` +
        `Szűkítsd a listát, vagy válts Pro csomagra az Árak oldalon.`,
    };
  }
  return { ok: true };
}
