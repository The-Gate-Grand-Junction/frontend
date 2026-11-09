/**
 * Keeps a copy of each form submission so the client's dashboard can list and
 * manage them. Email alone meant a submission existed only in someone's inbox:
 * nothing to search, no record of what had been dealt with, and an attachment
 * lost the moment a message was deleted.
 *
 * Posted to the dashboard's form-submissions function, which stores it in the
 * agency database through the Pipeline. The site holds no database credential:
 * the shared secret can add a submission to this client's inbox and nothing
 * else.
 *
 * Env:
 *   FORMS_INTAKE_URL      the dashboard's form-submissions function
 *   FORMS_INTAKE_SECRET   shared with the dashboard; sent as X-Forms-Secret
 */

export interface StoredField {
  label: string;
  name: string;
  value: string;
}

export interface StoredFile {
  filename: string;
  contentType: string;
  /** base64 */
  content: string;
}

/** Long enough for the dashboard and the Pipeline to store a résumé, short of the function's own limit. */
const INTAKE_TIMEOUT_MS = 8000;

export function storeConfigured(): boolean {
  return Boolean(process.env.FORMS_INTAKE_URL && process.env.FORMS_INTAKE_SECRET);
}

export async function storeSubmission(input: {
  formSlug: string;
  formTitle: string;
  pagePath: string;
  fields: StoredField[];
  files: StoredFile[];
  /** Defaults to 'new'; likely spam is filed as 'archived' with a note. */
  status?: 'new' | 'archived';
  notes?: string;
}): Promise<void> {
  const url = process.env.FORMS_INTAKE_URL;
  const secret = process.env.FORMS_INTAKE_SECRET;
  if (!url || !secret) throw new Error('Submission store is not configured');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Forms-Secret': secret },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(INTAKE_TIMEOUT_MS),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Dashboard intake returned ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`);
  }
}
