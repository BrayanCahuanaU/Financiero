type Attempt = { count: number; resetAt: number };

const attempts = new Map<string, Attempt>();
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, value] of attempts) {
    if (value.resetAt < now) attempts.delete(key);
  }
}

export function rateLimit(key: string, limit = 10, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  cleanup(now);
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  current.count += 1;
  if (current.count > limit) {
    return { allowed: false, remaining: 0, retryIn: Math.ceil((current.resetAt - now) / 1000) };
  }
  return { allowed: true, remaining: limit - current.count };
}

export function resetRateLimit(key: string) {
  attempts.delete(key);
}
