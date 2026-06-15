import { db } from "./db";
import { getStripe } from "./stripe";

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

// Tops the balance back up when it drops below the company's threshold, if
// auto-recharge is enabled. With Stripe it charges the saved card off-session
// (needs stripeCustomerId + stripePaymentMethodId); without Stripe it grants
// the package immediately (demo). Never throws.
export async function maybeAutoRecharge(companyId: string): Promise<void> {
  try {
    const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });
    if (!company.autoRechargeEnabled) return;
    if (company.creditBalance >= company.autoRechargeThreshold) return;

    const pkg =
      CREDIT_PACKAGES.find((p) => p.id === company.autoRechargePackageId) ?? CREDIT_PACKAGES[0];

    const stripe = getStripe();
    if (stripe) {
      // Off-session charge of the saved card. A SetupIntent flow to collect and
      // save the card is the remaining production piece; until then, skip safely.
      if (!company.stripeCustomerId || !company.stripePaymentMethodId) return;
      const pi = await stripe.paymentIntents.create({
        amount: pkg.priceHuf * 100,
        currency: "huf",
        customer: company.stripeCustomerId,
        payment_method: company.stripePaymentMethodId,
        off_session: true,
        confirm: true,
        metadata: { companyId, packageId: pkg.id, reason: "auto_recharge" },
      });
      if (pi.status === "succeeded") {
        await grantCredits(companyId, pkg.credits, "PURCHASE", `${pkg.name} – automatikus feltöltés`, pi.id);
      }
      return;
    }

    // Demo mode: grant immediately.
    await grantCredits(companyId, pkg.credits, "PURCHASE", `${pkg.name} – automatikus feltöltés (demo)`);
  } catch (err) {
    console.error("auto-recharge failed:", err);
  }
}
