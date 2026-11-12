import type { Config, Context } from '@netlify/functions';
import { Resend } from 'resend';
import { checkToken, fromThisSite, issueToken, spamReason } from '../lib/formGuard';

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'info@thegategj.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';
const SITE_DOMAIN = 'thegategj.com';
const BRAND_COLOR = '#D3B063';

/** Seconds a person needs, at least, to fill in the form. */
const MIN_ELAPSED_SECONDS = 3;
const MAX_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 10_000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Field {
  label: string;
  name: string;
  value: string;
}

/**
 * A copy of each message goes to the client dashboard's inbox
 * (form-submissions there, stored in the agency database through the
 * Pipeline). The site holds only a write-only secret for it, never a database
 * credential or the dashboard key.
 *
 * Env: FORMS_INTAKE_URL (https://dashboard.<domain>/.netlify/functions/form-submissions),
 *      FORMS_INTAKE_SECRET (same value as the dashboard's)
 */
const inboxConfigured = () => Boolean(process.env.FORMS_INTAKE_URL && process.env.FORMS_INTAKE_SECRET);

async function saveToInbox(entry: { fields: Field[]; pagePath: string | null; spam: string | null }): Promise<void> {
  const res = await fetch(process.env.FORMS_INTAKE_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Forms-Secret': process.env.FORMS_INTAKE_SECRET! },
    body: JSON.stringify({
      formSlug: 'contact',
      formTitle: 'Contact',
      pagePath: entry.pagePath,
      fields: entry.fields,
      // Likely spam is kept, out of the way, rather than thrown away
      ...(entry.spam ? { status: 'archived', notes: `Filed automatically as likely spam (${entry.spam}).` } : {}),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Dashboard inbox returned ${res.status}`);
}

async function sendEmail(fields: Field[], replyTo: string): Promise<void> {
  const [name, email, message] = fields.map((f) => escapeHtml(f.value));
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    replyTo,
    subject: `New message from ${fields[0].value.replace(/[\r\n]+/g, ' ')} via ${SITE_DOMAIN}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${BRAND_COLOR}; margin-bottom: 24px;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; vertical-align: top; width: 100px;">Name</td>
            <td style="padding: 8px 12px; color: #1f2937;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; vertical-align: top;">Email</td>
            <td style="padding: 8px 12px; color: #1f2937;"><a href="mailto:${email}" style="color: ${BRAND_COLOR};">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; vertical-align: top;">Message</td>
            <td style="padding: 8px 12px; color: #1f2937; white-space: pre-wrap;">${message}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">Sent from the contact form on ${SITE_DOMAIN}</p>
      </div>
    `,
  });
  if (error) throw new Error(`Resend: ${JSON.stringify(error)}`);
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default async (req: Request, _context: Context) => {
  // GET hands the page a signed token when the form appears (see formGuard.ts).
  // `ready` doubles as the uptime monitor's keyword check: false means both
  // delivery routes (email and dashboard inbox) are missing.
  if (req.method === 'GET') {
    const ready = Boolean(process.env.RESEND_API_KEY) || inboxConfigured();
    return new Response(JSON.stringify({ token: issueToken(), ready }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!fromThisSite(req)) return json({ error: 'Forbidden' }, 403);

  const canEmail = Boolean(process.env.RESEND_API_KEY);
  const canStore = inboxConfigured();
  if (!canEmail && !canStore) {
    console.error('Neither RESEND_API_KEY nor the dashboard inbox is configured.');
    return json({ error: 'The contact form is not set up yet. Please email or call us instead.' }, 500);
  }

  let body: { name?: unknown; email?: unknown; message?: unknown; website?: unknown; token?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Malformed request.' }, 400);
  }

  // Honeypot filled: answer as if sent so the bot gets no signal, deliver nothing
  if (body.website) return json({ success: true }, 200);

  const tokenProblem = checkToken(body.token, MIN_ELAPSED_SECONDS);
  if (tokenProblem) return json({ error: tokenProblem }, 400);

  const name = String(body.name ?? '').trim().slice(0, MAX_NAME_LENGTH);
  const email = String(body.email ?? '').trim().slice(0, MAX_NAME_LENGTH);
  const message = String(body.message ?? '').trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!name || !email || !message) return json({ error: 'Name, email, and message are required.' }, 400);
  if (!EMAIL.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);

  let pagePath: string | null = null;
  try {
    pagePath = new URL(req.headers.get('referer') ?? '').pathname;
  } catch { /* no referer */ }

  const fields: Field[] = [
    { label: 'Name', name: 'name', value: name },
    { label: 'Email', name: 'email', value: email },
    { label: 'Message', name: 'message', value: message },
  ];
  const spam = spamReason([name, message]);

  // Likely spam isn't emailed. With no inbox to file it in, it's emailed after
  // all, so a false positive still reaches someone.
  const emailIt = canEmail && (!spam || !canStore);

  // Side by side and judged together: one failing must not lose a message the
  // other has already delivered.
  const [stored, emailed] = await Promise.allSettled([
    canStore ? saveToInbox({ fields, pagePath, spam }) : Promise.reject(new Error('not configured')),
    emailIt ? sendEmail(fields, email) : Promise.reject(new Error('not sent')),
  ]);
  if (canStore && stored.status === 'rejected') console.error('Saving to the dashboard inbox failed:', stored.reason);
  if (emailIt && emailed.status === 'rejected') console.error('Emailing the message failed:', emailed.reason);

  if (stored.status === 'rejected' && emailed.status === 'rejected') {
    return json({ error: 'Failed to send your message. Please try again.' }, 502);
  }
  return json({ success: true }, 200);
};

/**
 * One path for the page's GET and POST, limited per visitor: plenty for a
 * person, far too few for a script. Setting a path also retires the default
 * /.netlify/functions/send-message address, which would bypass the limit.
 */
export const config: Config = {
  path: '/api/send-message',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
