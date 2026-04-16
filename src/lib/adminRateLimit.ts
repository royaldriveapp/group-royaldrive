type Entry = {
  windowStartMs: number;
  count: number;
  blockedUntilMs?: number;
};

const attempts = new Map<string, Entry>();

const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_ATTEMPTS = 10; // per key per window
const DEFAULT_BLOCK_MS = 10 * 60 * 1000; // 10 minutes

export function checkRateLimit(
  key: string,
  opts?: { windowMs?: number; maxAttempts?: number; blockMs?: number }
) {
  const windowMs = opts?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxAttempts = opts?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const blockMs = opts?.blockMs ?? DEFAULT_BLOCK_MS;

  const now = Date.now();
  const existing = attempts.get(key);
  const entry: Entry =
    existing ??
    ({
      windowStartMs: now,
      count: 0,
    } satisfies Entry);

  if (entry.blockedUntilMs && now < entry.blockedUntilMs) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntilMs - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  if (now - entry.windowStartMs > windowMs) {
    entry.windowStartMs = now;
    entry.count = 0;
    entry.blockedUntilMs = undefined;
  }

  entry.count += 1;

  if (entry.count > maxAttempts) {
    entry.blockedUntilMs = now + blockMs;
    const retryAfterSeconds = Math.ceil(blockMs / 1000);
    attempts.set(key, entry);
    return { allowed: false, retryAfterSeconds };
  }

  attempts.set(key, entry);
  return { allowed: true as const };
}

