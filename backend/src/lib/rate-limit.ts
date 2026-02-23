const store = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function checkLoginRateLimit(req: Request): { ok: true } | { ok: false; retryAfter: number } {
  const max = Math.max(1, parseInt(process.env.RATE_LIMIT_LOGIN_MAX ?? "10", 10));
  const windowMs = Math.max(1000, parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS ?? "60000", 10));
  const ip = getClientIp(req);
  const now = Date.now();
  let entry = store.get(ip);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(ip, entry);
  }
  entry.count++;
  if (entry.count > max)
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  return { ok: true };
}
