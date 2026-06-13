import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";
import { CREDIT_PACKAGES, grantCredits } from "@/lib/credits";
import { getStripe } from "@/lib/stripe";
import { track } from "@/lib/analytics";

// Buys a credit package. With Stripe configured, returns a hosted Checkout URL
// for the app to open; otherwise (demo) grants immediately and returns the new
// balance.
export async function POST(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);

  const body = await req.json().catch(() => ({}));
  const pkg = CREDIT_PACKAGES.find((p) => p.id === body.packageId);
  if (!pkg) return apiError(400, "Unknown package");

  const stripe = getStripe();
  if (stripe) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "huf",
            unit_amount: pkg.priceHuf * 100,
            product_data: { name: `Procura ${pkg.name} – ${pkg.credits} kredit` },
          },
        },
      ],
      success_url: `${baseUrl}/credits?ok=1`,
      cancel_url: `${baseUrl}/credits?canceled=1`,
      metadata: { companyId: auth.company.id, packageId: pkg.id },
    });
    return Response.json({ checkoutUrl: session.url });
  }

  await grantCredits(
    auth.company.id,
    pkg.credits,
    "PURCHASE",
    `${pkg.name} (${pkg.credits} kredit) – mobil (demo)`,
  );
  if (auth.userId) {
    await track("credits_purchased", auth.userId, { packageId: pkg.id, credits: pkg.credits, mode: "demo-mobile" });
  }
  const updated = await db.company.findUniqueOrThrow({ where: { id: auth.company.id } });
  return Response.json({ granted: true, balance: updated.creditBalance });
}
