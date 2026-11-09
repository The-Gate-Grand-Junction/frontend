import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Server-side defenses for the website forms. Anything the browser reports
 * (how long the form was open, which fields it has) can be forged by a script
 * that POSTs the endpoint directly, so each check here rests on something the
 * server controls instead. From the RMWS build.
 */

// ─── Form token ──────────────────────────────────────────────────────────────
// The page asks for a signed timestamp when a form appears and sends it back
// on submit. A submission without one never loaded the page; one returned too
// soon was filled in faster than a person types; one a day old was replayed.
// The signing key is FORM_TOKEN_SECRET, or derived from a secret the site
// already holds, so the check works without another environment variable.

const MAX_TOKEN_AGE_SECONDS = 24 * 60 * 60;

function signingKey(): string | null {
  const base = process.env.FORM_TOKEN_SECRET || process.env.RESEND_API_KEY || process.env.FORMS_INTAKE_SECRET;
  return base ? createHash('sha256').update(`pws-form-token:${base}`).digest('hex') : null;
}

const sign = (key: string, issued: string) => createHmac('sha256', key).update(issued).digest('base64url');

export function issueToken(): string | null {
  const key = signingKey();
  if (!key) return null;
  const issued = String(Math.floor(Date.now() / 1000));
  return `${issued}.${sign(key, issued)}`;
}

/** Null when the token is good; otherwise the message to show the visitor. */
export function checkToken(token: unknown, minimumSeconds: number): string | null {
  const key = signingKey();
  if (!key) return null; // nothing to sign with: fall back to the other checks
  const reload = 'This form has expired. Please reload the page and try again.';
  if (typeof token !== 'string' || !/^\d+\.[\w-]+$/.test(token)) return reload;
  const [issued, mac] = token.split('.');
  const expected = Buffer.from(sign(key, issued));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return reload;
  const age = Date.now() / 1000 - Number(issued);
  if (age > MAX_TOKEN_AGE_SECONDS) return reload;
  if (age < minimumSeconds) return 'That was submitted a little too quickly. Please try again.';
  return null;
}

// ─── Same-site requests ──────────────────────────────────────────────────────

/** Browsers always send Origin on a cross-site POST; it must be this site. */
export function fromThisSite(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin fetches may omit it; the token still applies
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

// ─── Content ─────────────────────────────────────────────────────────────────
// SEO and "guest post" spam is made of links; real inquiries rarely carry more
// than one or two. A match is kept out of the email but still stored in the
// dashboard inbox (archived, with the reason), so a false positive isn't lost.

const LINK = /\bhttps?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]{2,}/gi;
const MARKUP = /<a\s+href|\[url[=\]]|\[link[=\]]/i;

export function spamReason(values: string[]): string | null {
  const text = values.join('\n');
  if (MARKUP.test(text)) return 'contains link markup';
  const links = text.match(LINK)?.length ?? 0;
  if (links > 2) return `contains ${links} links`;
  return null;
}

// ─── Attachments ─────────────────────────────────────────────────────────────
// File questions accept documents (résumés, quotes). The file's name and
// stated type come from the browser, so its first bytes decide what it is.

const DOCUMENT_TYPES: Record<string, { type: string; matches: (head: Buffer) => boolean }> = {
  pdf: { type: 'application/pdf', matches: (h) => h.subarray(0, 5).toString('latin1') === '%PDF-' },
  doc: { type: 'application/msword', matches: (h) => h.subarray(0, 4).toString('hex') === 'd0cf11e0' },
  docx: {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    matches: (h) => h.subarray(0, 4).toString('hex') === '504b0304',
  },
  odt: { type: 'application/vnd.oasis.opendocument.text', matches: (h) => h.subarray(0, 4).toString('hex') === '504b0304' },
  rtf: { type: 'application/rtf', matches: (h) => h.subarray(0, 5).toString('latin1') === '{\\rtf' },
  txt: { type: 'text/plain', matches: (h) => !h.includes(0) },
};

export interface CheckedFile {
  filename: string;
  contentType: string;
  content: string;
}

/** The file with a clean name and a type the server determined, or null. */
export function checkAttachment(file: { filename?: string; content?: string }): CheckedFile | null {
  if (!file.filename || !file.content) return null;
  const ext = file.filename.toLowerCase().split('.').pop() ?? '';
  const kind = DOCUMENT_TYPES[ext];
  if (!kind) return null;
  const head = Buffer.from(file.content.slice(0, 1400), 'base64');
  if (!kind.matches(head)) return null;
  const base = file.filename
    .slice(0, -(ext.length + 1))
    .replace(/[^\p{L}\p{N} .()_-]+/gu, '_')
    .replace(/^[\s._]+/, '')
    .trim()
    .slice(0, 120);
  return { filename: `${base || 'attachment'}.${ext}`, contentType: kind.type, content: file.content };
}
