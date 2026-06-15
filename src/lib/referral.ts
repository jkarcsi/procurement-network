import crypto from "crypto";
import { db } from "./db";
import { grantCredits } from "./credits";

// Referral program: a company shares its code; when a new company registers
// with it, both sides get credits (credits are a buyer feature, so only buyer
// accounts are rewarded). Capped per referrer to limit abuse.

export const REFERRAL_BONUS = 5;
const MAX_REFERRAL_REWARDS = 25;

export async function ensureReferralCode(companyId: string): Promise<string> {
  const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });
  if (company.referralCode) return company.referralCode;
  for (let i = 0; i < 6; i++) {
    const code = crypto.randomBytes(6).toString("base64url").slice(0, 8).toLowerCase();
    try {
      await db.company.update({ where: { id: companyId }, data: { referralCode: code } });
      return code;
    } catch {
      // unique collision — retry
    }
  }
  throw new Error("could not generate a referral code");
}

// Applies a referral code to a freshly registered company. Returns whether a
// referral link was recorded.
export async function applyReferral(
  newCompany: { id: string; type: string },
  refCode: string,
): Promise<boolean> {
  const referrer = await db.company.findUnique({ where: { referralCode: refCode.toLowerCase() } });
  if (!referrer || referrer.id === newCompany.id) return false;

  const current = await db.company.findUniqueOrThrow({ where: { id: newCompany.id } });
  if (current.referredById) return false; // already attributed

  const priorReferrals = await db.company.count({ where: { referredById: referrer.id } });
  await db.company.update({ where: { id: newCompany.id }, data: { referredById: referrer.id } });

  // Referee reward (buyer only)
  if (newCompany.type === "BUYER") {
    await grantCredits(newCompany.id, REFERRAL_BONUS, "BONUS", "Meghívóval érkeztél – jóváírás");
  }
  // Referrer reward (buyer only, under the cap)
  if (referrer.type === "BUYER" && priorReferrals < MAX_REFERRAL_REWARDS) {
    await grantCredits(referrer.id, REFERRAL_BONUS, "BONUS", "Ajánlásért járó jóváírás");
  }
  return true;
}
