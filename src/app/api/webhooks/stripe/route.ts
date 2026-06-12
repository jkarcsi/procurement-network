import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { grantCredits, CREDIT_PACKAGES } from "@/lib/credits";

// Stripe webhook (TEST MODE): grants purchased credits when a Checkout
// session completes. Signature is always verified; the grant is idempotent
// via the session id, so Stripe retries are safe.
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

  return new Response("ok");
}
