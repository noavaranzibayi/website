import { prisma } from "@/lib/prisma";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

/**
 * Simple fixed-window rate limiter backed by the database, so limits survive
 * process restarts and apply across all app instances. Callers should key by
 * `${action}:ip:${ip}` and/or `${action}:email:${email}` to cover both
 * per-client and per-account brute-force attempts.
 */
export async function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMs);

  const count = await prisma.rateLimitAttempt.count({
    where: { key, createdAt: { gte: windowStart } },
  });

  if (count >= limit) {
    const oldest = await prisma.rateLimitAttempt.findFirst({
      where: { key, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const retryAfterMs = oldest
      ? oldest.createdAt.getTime() + windowMs - Date.now()
      : windowMs;
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(retryAfterMs, 0) };
  }

  await prisma.rateLimitAttempt.create({ data: { key } });

  // Opportunistic cleanup of stale rows for this key (best-effort, non-blocking).
  void prisma.rateLimitAttempt
    .deleteMany({ where: { key, createdAt: { lt: windowStart } } })
    .catch(() => {});

  return { allowed: true, remaining: limit - count - 1, retryAfterMs: 0 };
}

export const RATE_LIMITS = {
  login: { limit: 8, windowMs: 10 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  forgotPassword: { limit: 5, windowMs: 60 * 60 * 1000 },
  resendVerification: { limit: 5, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitOptions>;
