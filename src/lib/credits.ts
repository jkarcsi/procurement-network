import { db } from "./db";

// Credit accounting for premium analysis features. All mutations go through
// this module so every balance change leaves a ledger row.

export const WELCOME_BONUS = 10;
export const COMPARISON_COST = 1;

export const CREDIT_PACKAGES = [
  { id: "s", credits: 10, priceHuf: 2990, name: "Kezdő csomag" },
  { id: "m", credits: 50, priceHuf: 9990, name: "Üzleti csomag" },
  { id: "l", credits: 200, priceHuf: 29990, name: "Vállalati csomag" },
] as const;

// `reference` (e.g. a Stripe checkout session id) makes the grant idempotent:
// a second call with the same reference is a no-op.
export async function grantCredits(
  companyId: string,
  amount: number,
  type: "BONUS" | "PURCHASE",
  description: string,
  reference?: string,
) {
  await db.$transaction(async (tx) => {
    if (reference) {
      const existing = await tx.creditTransaction.findUnique({ where: { reference } });
      if (existing) return;
    }
    const company = await tx.company.update({
      where: { id: companyId },
      data: { creditBalance: { increment: amount } },
    });
    await tx.creditTransaction.create({
      data: {
        companyId,
        amount,
        balanceAfter: company.creditBalance,
        type,
        description,
        reference: reference ?? null,
      },
    });
  });
}

// Returns false without changing anything when the balance is insufficient.
export async function chargeCredits(
  companyId: string,
  amount: number,
  description: string,
): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const company = await tx.company.findUniqueOrThrow({ where: { id: companyId } });
    if (company.creditBalance < amount) return false;
    const updated = await tx.company.update({
      where: { id: companyId },
      data: { creditBalance: { decrement: amount } },
    });
    await tx.creditTransaction.create({
      data: {
        companyId,
        amount: -amount,
        balanceAfter: updated.creditBalance,
        type: "USAGE",
        description,
      },
    });
    return true;
  });
}
