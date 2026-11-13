/**
 * Starts a donation: validates the amount and sends the donor to Stripe
 * Checkout on the client's own Stripe account, one-time or monthly. Nothing is
 * recorded here; donation-webhook.ts files the gift and sends the receipt once
 * Stripe says it was paid. Same guard as the contact form, plus a tight rate
 * limit, because donation forms attract card testing.
 *
 * Env: STRIPE_SECRET_KEY (see ../lib/stripe.ts), DONATION_ORG_NAME (optional;
 *      defaults to the business name)
 */
import type { Config, Context } from '@netlify/functions';
import { checkToken, fromThisSite, issueToken } from '../lib/formGuard';
import { stripeConfigured, stripePost } from '../lib/stripe';

const ORG_NAME = process.env.DONATION_ORG_NAME || 'The Gate: A Meeting Venue';
/** Whole dollars. Below this a gift mostly feeds fees, and tiny charges are what card testers use. */
const MIN_DOLLARS = 5;
const MAX_DOLLARS = 10_000;
const MIN_ELAPSED_SECONDS = 2;
/** Marks the Checkout sessions and subscriptions this site creates, so the webhook ignores the account's other payments. */
const SOURCE = 'website-donation';

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async (req: Request, _context: Context) => {
  // `ready` doubles as the uptime monitor's check
  if (req.method === 'GET') return json({ token: issueToken(), ready: stripeConfigured(), min: MIN_DOLLARS, max: MAX_DOLLARS }, 200);
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!fromThisSite(req)) return json({ error: 'Forbidden' }, 403);
  if (!stripeConfigured()) {
    console.error('STRIPE_SECRET_KEY is not set.');
    return json({ error: 'Online giving is not available right now.' }, 503);
  }

  let body: { amount?: unknown; monthly?: unknown; pagePath?: unknown; token?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Malformed request.' }, 400);
  }
  // Bots that fill every field get nowhere, and learn nothing
  if (body.website) return json({ error: 'Please reload the page and try again.' }, 400);

  const tokenProblem = checkToken(body.token, MIN_ELAPSED_SECONDS);
  if (tokenProblem) return json({ error: tokenProblem }, 400);

  const dollars = Number(body.amount);
  if (!Number.isInteger(dollars) || dollars < MIN_DOLLARS || dollars > MAX_DOLLARS) {
    return json({ error: `Please enter a whole-dollar amount from $${MIN_DOLLARS} to $${MAX_DOLLARS.toLocaleString('en-US')}.` }, 400);
  }
  const monthly = body.monthly === true;
  // Back to the page they gave from; only a plain path on this site
  const path = typeof body.pagePath === 'string' && /^\/(?!\/)[\w\-./]*$/.test(body.pagePath) ? body.pagePath : '/';
  const origin = new URL(req.url).origin;

  const price = {
    currency: 'usd',
    unit_amount: dollars * 100,
    product_data: { name: monthly ? `Monthly gift to ${ORG_NAME}` : `Gift to ${ORG_NAME}` },
    ...(monthly ? { recurring: { interval: 'month' } } : {}),
  };

  try {
    const session = await stripePost<{ url: string }>('checkout/sessions', {
      mode: monthly ? 'subscription' : 'payment',
      line_items: { 0: { price_data: price, quantity: 1 } },
      success_url: `${origin}${path}?donation=thanks`,
      cancel_url: `${origin}${path}`,
      metadata: { source: SOURCE },
      ...(monthly
        ? { subscription_data: { metadata: { source: SOURCE } } }
        : { submit_type: 'donate', payment_intent_data: { metadata: { source: SOURCE } } }),
    });
    return json({ url: session.url }, 200);
  } catch (err) {
    console.error('Starting a donation failed:', err instanceof Error ? err.message : err);
    return json({ error: 'Online giving is not available right now. Please try again shortly.' }, 502);
  }
};

/** Tightly rate limited per visitor; the path also retires the default /.netlify/functions/ address. */
export const config: Config = {
  path: '/api/donate',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
