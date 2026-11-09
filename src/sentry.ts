import type { App } from 'vue';
import type { Router } from 'vue-router';
import * as Sentry from '@sentry/vue';

/**
 * Error monitoring, loaded by monitoring.ts once the page is idle: Sentry,
 * and Session Replay in particular, is about half the site's JavaScript, and
 * on AoS loading it up front held back first paint on phones.
 */
export function initSentry(app: App, router: Router, dsn: string) {
  Sentry.init({
    app,
    dsn,
    // Set VITE_SENTRY_ENV per Netlify context (production, staging) to filter in Sentry
    environment: import.meta.env.VITE_SENTRY_ENV || import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],
    // Small sites on the free plan: a sample of page loads, and a replay only
    // for sessions that hit an error.
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    // Tracing headers go to this site's own functions only, never third parties
    tracePropagationTargets: [window.location.origin],
  });
}
