import type { Instrumentation } from "next";

// Server-side error tracking without an SDK dependency: every captured
// server error is logged in a structured form, and optionally forwarded to
// any observability endpoint (Sentry-compatible collector, Slack webhook,
// custom service) via ERROR_WEBHOOK_URL. Opt-in by design.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const message = err instanceof Error ? err.message : String(err);
  const digest =
    err && typeof err === "object" && "digest" in err ? String(err.digest) : undefined;

  console.error(
    `[server-error] ${request.method} ${request.path} | ${context.routerKind}/${context.routeType} | ${message}${digest ? ` | digest=${digest}` : ""}`,
  );

  const webhook = process.env.ERROR_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        digest,
        stack: err instanceof Error ? err.stack : undefined,
        path: request.path,
        method: request.method,
        routeType: context.routeType,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (forwardErr) {
    console.error("[server-error] forwarding failed:", forwardErr);
  }
};
