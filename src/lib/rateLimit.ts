// Simple in-memory sliding-window rate limiter. Per-instance only, which is
// fine for a single-node deployment; swap for a shared store (Redis/KV) when
// scaling horizontally.

const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 10_000;

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  // Crude memory cap: drop everything rather than grow unbounded under abuse
  if (!buckets.has(key) && buckets.size >= MAX_BUCKETS) buckets.clear();
  buckets.set(key, hits);
  return true;
}

export const RATE_LIMIT_MESSAGE =
  "Túl sok próbálkozás. Várj néhány percet, és próbáld újra.";
