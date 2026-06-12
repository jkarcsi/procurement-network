import Stripe from "stripe";

// STRIPE TEST MODE ONLY until launch sign-off: use sk_test_... keys.
// Returns null when Stripe is not configured — callers must keep working
// without it (demo mode).
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}
