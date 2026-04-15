import crypto from "crypto";

function getSecret(): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("CRON_SECRET is not configured");
  return secret;
}

export function signUnsubscribe(userId: string): string {
  return crypto.createHmac("sha256", getSecret()).update(userId).digest("hex");
}

export function verifyUnsubscribe(userId: string, token: string): boolean {
  const expected = signUnsubscribe(userId);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
