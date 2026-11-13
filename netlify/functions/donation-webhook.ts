/**
 * Stripe tells this endpoint when a gift is paid. For each one it emails the
 * donor a receipt for their tax records, tells the organization, and files the
 * gift in the dashboard inbox (kind "donation"). A monthly gift does this
 * every month it is charged.
 *
 * Only payments this site started (metadata source = website-donation) are
 * handled; anything else on the client's Stripe account is acknowledged and
 * ignored.
 *
 * Stripe → Developers → Webhooks: endpoint https://<domain>/api/donation-webhook,
 * events checkout.session.completed, checkout.session.async_payment_succeeded,
 * invoice.paid.
 *
 * Env: STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, CONTACT_TO_EMAIL,
 *      CONTACT_FROM_EMAIL, DONATION_ORG_NAME (legal name on the receipt;
 *      defaults to the business name), DONATION_EIN (when set, the receipt
 *      carries it and the no-goods-or-services statement),
 *      STRIPE_PORTAL_LOGIN_URL (Stripe's customer portal link, where monthly
 *      donors change or cancel), FORMS_INTAKE_URL + FORMS_INTAKE_SECRET,
 *      VITE_SITE_TIMEZONE
 */
import type { Config, Context } from '@netlify/functions';
import { Resend } from 'resend';
import { storeConfigured, storeSubmission } from '../lib/submissions';
import { verifyWebhook } from '../lib/stripe';

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'info@thegategj.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';
const ORG_NAME = process.env.DONATION_ORG_NAME || 'The Gate: A Meeting Venue';
const SITE_DOMAIN = 'thegategj.com';
const BRAND_COLOR = '#D3B063';
const SOURCE = 'website-donation';

export interface Gift {
  id: string;
  cents: number;
  email: string;
  name: string;
  monthly: boolean;
  /** Unix seconds */
  paidAt: number;
}

/** The paid gift an event describes, or null when it isn't one of this site's. */
export function giftFrom(event: any): Gift | null {
  const o = event?.data?.object;
  if (!o) return null;

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    // Monthly gifts are recorded from their invoices, first month included
    if (o.mode !== 'payment' || o.metadata?.source !== SOURCE || o.payment_status !== 'paid') return null;
    return {
      id: String(o.payment_intent ?? o.id),
      cents: Number(o.amount_total) || 0,
      email: String(o.customer_details?.email ?? ''),
      name: String(o.customer_details?.name ?? ''),
      monthly: false,
      paidAt: Number(event.created) || Math.floor(Date.now() / 1000),
    };
  }

  if (event.type === 'invoice.paid') {
    // Subscription metadata moved under `parent` in newer API versions; read both
    const meta = o.parent?.subscription_details?.metadata ?? o.subscription_details?.metadata;
    if (meta?.source !== SOURCE || !(Number(o.amount_paid) > 0)) return null;
    return {
      id: String(o.id),
      cents: Number(o.amount_paid),
      email: String(o.customer_email ?? ''),
      name: String(o.customer_name ?? ''),
      monthly: true,
      paidAt: Number(o.status_transitions?.paid_at ?? event.created) || Math.floor(Date.now() / 1000),
    };
  }
  return null;
}

const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const day = (seconds: number) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: process.env.VITE_SITE_TIMEZONE || 'America/Denver' }).format(seconds * 1000);
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The donor's receipt: what they gave, when, and what a tax preparer looks for. */
export function receipt(gift: Gift) {
  const ein = process.env.DONATION_EIN?.trim();
  const portal = process.env.STRIPE_PORTAL_LOGIN_URL?.trim();
  const lines = [
    `Thank you${gift.name ? `, ${gift.name.split(' ')[0]}` : ''}, for your ${gift.monthly ? 'monthly ' : ''}gift to ${ORG_NAME}.`,
    '',
    `Amount: ${money(gift.cents)}${gift.monthly ? ' (monthly)' : ''}`,
    `Date: ${day(gift.paidAt)}`,
    `Received by: ${ORG_NAME}${ein ? ` (EIN ${ein})` : ''}`,
    `Reference: ${gift.id}`,
    '',
    ...(ein ? ['No goods or services were provided in exchange for this contribution.', 'Please keep this receipt for your tax records.', ''] : []),
    ...(gift.monthly
      ? [portal ? `To change or cancel your monthly gift: ${portal}` : `To change or cancel your monthly gift, reply to this email.`, '']
      : []),
    `With gratitude,`,
    ORG_NAME,
  ];
  const text = lines.join('\n');
  const html = `<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937; line-height: 1.5;">
${lines
  .map((l) => {
    if (!l) return '';
    const safe = escapeHtml(l);
    if (portal && l.includes(portal)) return `<p>To change or cancel your monthly gift, <a href="${escapeHtml(portal)}" style="color: ${BRAND_COLOR};">manage it here</a>.</p>`;
    return /^(Amount|Date|Received by|Reference):/.test(l) ? `<p style="margin: 4px 0;">${safe.replace(/^([^:]+:)/, '<strong>$1</strong>')}</p>` : `<p>${safe}</p>`;
  })
  .join('\n')}
</div>`;
  return { subject: `Your ${gift.monthly ? 'monthly ' : ''}gift to ${ORG_NAME}: receipt`, text, html };
}

async function send(message: { to: string; subject: string; text: string; html?: string; replyTo?: string }) {
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM_EMAIL, ...message });
  if (error) throw new Error(`Resend: ${JSON.stringify(error)}`);
}

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const event = verifyWebhook(await req.text(), req.headers.get('stripe-signature'));
  if (!event) return new Response('Bad signature', { status: 400 });

  const gift = giftFrom(event);
  if (!gift) return new Response('Ignored', { status: 200 });

  const canEmail = Boolean(process.env.RESEND_API_KEY);
  const who = gift.name ? `${gift.name} <${gift.email}>` : gift.email || 'An anonymous donor';
  const summary = `${money(gift.cents)}${gift.monthly ? ' monthly gift' : ' gift'} from ${who} on ${day(gift.paidAt)}`;

  const [receipted, notified, stored] = await Promise.allSettled([
    canEmail && gift.email
      ? send({ to: gift.email, replyTo: TO_EMAIL, ...receipt(gift) })
      : Promise.reject(new Error(gift.email ? 'RESEND_API_KEY is not set' : 'no donor email')),
    canEmail
      ? send({ to: TO_EMAIL, subject: `New ${gift.monthly ? 'monthly ' : ''}gift: ${money(gift.cents)} via ${SITE_DOMAIN}`, text: `${summary}.\nStripe reference: ${gift.id}` })
      : Promise.reject(new Error('RESEND_API_KEY is not set')),
    storeConfigured()
      ? storeSubmission({
          formSlug: 'donation',
          formTitle: gift.monthly ? 'Monthly donation' : 'Donation',
          pagePath: '',
          fields: [
            { label: 'Name', name: 'name', value: gift.name },
            { label: 'Email', name: 'email', value: gift.email },
            { label: 'Amount', name: 'amount', value: money(gift.cents) },
            { label: 'Frequency', name: 'frequency', value: gift.monthly ? 'Monthly' : 'One-time' },
            { label: 'Stripe reference', name: 'stripeReference', value: gift.id },
          ],
          files: [],
        })
      : Promise.reject(new Error('not configured')),
  ]);
  for (const [what, result] of [['Receipt', receipted], ['Notice', notified], ['Inbox copy', stored]] as const) {
    if (result.status === 'rejected') console.error(`${what} for ${gift.id} failed:`, result.reason instanceof Error ? result.reason.message : result.reason);
  }

  // Stripe retries a failed delivery, which would repeat whatever did go out;
  // only ask for a retry when nothing did.
  const anything = [receipted, notified, stored].some((r) => r.status === 'fulfilled');
  return new Response(anything ? 'Recorded' : 'Not recorded', { status: anything ? 200 : 500 });
};

export const config: Config = { path: '/api/donation-webhook' };
