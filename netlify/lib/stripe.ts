import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * The few Stripe calls the donation flow makes, over Stripe's REST API (no
 * SDK in the function bundle). The account is the client's own: donations
 * never pass through the agency.
 *
 * Env: STRIPE_SECRET_KEY (a restricted key is enough: Checkout Sessions,
 *      Products and Prices write), STRIPE_WEBHOOK_SECRET (whsec_…, from the
 *      webhook endpoint for /api/donation-webhook)
 */

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

/** Stripe's form encoding: nested objects become a[b][c]=value. */
function encode(params: Record<string, unknown>, prefix = '', out = new URLSearchParams()): URLSearchParams {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === 'object') encode(value as Record<string, unknown>, name, out);
    else out.append(name, String(value));
  }
  return out;
}

export async function stripePost<T = any>(path: string, params: Record<string, unknown>): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encode(params),
    signal: AbortSignal.timeout(10_000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Stripe ${path} ${res.status}: ${data?.error?.message ?? 'no detail'}`);
  return data as T;
}

/** Older events are refused, so a captured one can't be replayed later. */
const SIGNATURE_TOLERANCE_SECONDS = 300;

/**
 * Checks the Stripe-Signature header against the raw body (Stripe's scheme:
 * HMAC-SHA256 of "<timestamp>.<body>" with the endpoint secret). Returns the
 * parsed event, or null when it isn't from Stripe.
 */
export function verifyWebhook(rawBody: string, header: string | null, now = Date.now()): any | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return null;
  const parts = header.split(',').map((p) => p.trim().split('='));
  const timestamp = parts.find(([k]) => k === 't')?.[1];
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v ?? '');
  if (!timestamp || !/^\d+$/.test(timestamp) || !signatures.length) return null;
  if (Math.abs(now / 1000 - Number(timestamp)) > SIGNATURE_TOLERANCE_SECONDS) return null;

  const expected = Buffer.from(createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex'));
  const matches = signatures.some((sig) => {
    const given = Buffer.from(sig);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
  if (!matches) return null;
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}
