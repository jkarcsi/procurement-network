// Opt-in product analytics via the PostHog capture API. No-op unless
// POSTHOG_API_KEY is set; failures are swallowed so analytics can never
// break a business flow. No SDK dependency on purpose.

const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://eu.posthog.com";

export type AnalyticsEvent =
  | "user_registered"
  | "rfq_created"
  | "rfq_sent"
  | "offer_submitted"
  | "offer_accepted"
  | "credits_purchased"
  | "pro_upgraded";

export async function track(
  event: AnalyticsEvent,
  distinctId: string,
  properties: Record<string, string | number | boolean> = {},
) {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return;
  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        properties,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("analytics track failed:", err);
  }
}
