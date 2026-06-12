import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { grantCredits, CREDIT_PACKAGES } from "@/lib/credits";
import { db } from "@/lib/db";

// Stripe webhook (TEST MODE): grants purchased credits and flips the Pro
// plan when Checkout sessions complete; downgrades when the subscription
// is cancelled. Signature is always verified; the credit grant is
// idempotent via the session id, so Stripe retries are safe.
// Local testing: stripe listen --forward-to localhost:3000/api/webhooks/stripe
export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return new Response("Stripe is not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const companyId = session.metadata?.companyId;

    if (session.mode === "subscription" && companyId) {
      await db.company.update({
        where: { id: companyId },
        data: {
          plan: "PRO",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null,
        },
      });
    } else {
      const pkg = CREDIT_PACKAGES.find((p) => p.id === session.metadata?.packageId);
      if (companyId && pkg && session.payment_status === "paid") {
        await grantCredits(
          companyId,
          pkg.credits,
          "PURCHASE",
          `${pkg.name} (${pkg.credits} kredit) – bankkártyás fizetés`,
          session.id,
        );
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await db.company.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { plan: "FREE", stripeSubscriptionId: null },
    });
  }

  return new Response("ok");
}
