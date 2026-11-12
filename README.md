# pws-foundation-template

This is a **scaffold template** — not a live project. It is cloned and configured by [pws-scaffolder](https://github.com/EricPhifer/pws-scaffolder) to generate client-specific Foundation sites.

## Stack

Vite, Vue 3, TypeScript, Tailwind CSS 4, Vue Router, Pinia, Lucide Vue Next, @vueuse/core, @unhead/vue

## Placeholder Pattern

Values that vary per client use the `##PLACEHOLDER##` pattern. These are replaced by the scaffolder at generation time:

- `The Gate : A Meeting Venue` — client business name
- `` — short tagline
- `thegategj.com` — the site's primary domain (contact email, sitemap, SEO)
- `<!-- Simple Analytics — cookieless, privacy-first -->
    <script async data-hostname="thegategj.com" src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
    <noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif?hostname=thegategj.com" alt="" referrerpolicy="no-referrer-when-downgrade" /></noscript>` — the Simple Analytics or GA4 tag in `index.html`, chosen from the dashboard's analytics provider
- `ljkurtz00@msn.com`, ``, `2825 North Ave, Grand Junction, CO 81501` — contact info
- `#B3B063`, `#000000`, etc. — brand colors (light theme)
- `#c4c185`, `#1a1a1a`, etc. — brand colors (dark theme)
- `'Bebas Neue', sans-serif`, `'Montserrat', sans-serif` — full font stacks (`'Montserrat', sans-serif`, or the system stack for "System UI")
- `<!-- Fonts self-hosted from /fonts/ (Latin subset); the critical weights are preloaded -->
    <link rel="preload" href="/fonts/montserrat-400.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/bebas-neue-400.woff2" as="font" type="font/woff2" crossorigin />
    <style>
      @font-face { font-family: 'Bebas Neue'; font-style: normal; font-weight: 400; font-display: swap; src: url('/fonts/bebas-neue-400.woff2') format('woff2'); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
      @font-face { font-family: 'Montserrat'; font-style: normal; font-weight: 400; font-display: swap; src: url('/fonts/montserrat-400.woff2') format('woff2'); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
      @font-face { font-family: 'Montserrat'; font-style: normal; font-weight: 500; font-display: swap; src: url('/fonts/montserrat-500.woff2') format('woff2'); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
      @font-face { font-family: 'Montserrat'; font-style: normal; font-weight: 600; font-display: swap; src: url('/fonts/montserrat-600.woff2') format('woff2'); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
    </style>` — `<head>` markup for the self-hosted brand fonts (preloads + inline `@font-face`); the woff2 files go in `public/fonts/`
- `0` — global border radius
- `#767441`, `#111827` (and `DARK_` versions) — text-safe brand colors, derived by the scaffolder
- `dark` — the site theme from Build Tools: `light`, `both` (light and dark with a toggle) or `dark` (inline theme script in `index.html`)
- `##COPYRIGHT_YEAR##` — dynamically generated at runtime (not a placeholder)

Any token left unreplaced fails the scaffold.

## Structure

```
src/
  components/layout/   SiteHeader, SiteFooter, SiteLayout
  components/ui/       BaseButton, BaseCard, BaseSection
  components/seo/      SeoHead (renderless head injection)
  composables/         useTheme (dark mode), useSeo (per-page meta)
  pages/               HomePage, AboutPage, ContactPage
  pages/legal/         PrivacyPolicy, Terms, Accessibility, CookiePolicy
  stores/              useSiteStore (site config: name, nav, contact)
  types/               SiteConfig, NavItem, PageMeta
```

## Rendering: client-side, or prerendered on Growth

The same code runs both ways:

- **Starter / Foundation / Enrich**: `src/main.ts` mounts a client-rendered app. CMS edits show as soon as they're published.
- **Growth**: the scaffolder swaps in a ViteSSG entry and builds with `vite-ssg build`. Every public route (and its Sanity content) is prerendered to HTML; unknown URLs get `404.html` with a real 404 status (no catch-all rewrite). Publishing in the Studio doesn't rebuild: editors click **Publish site** once for a batch of edits (`netlify/functions/trigger-deploy.ts`, called by a signed Sanity webhook). Visitors still see newer content, because each prerendered query is refetched once the page is idle.

Rules that keep prerendering working:

- Fetch through `useSanity` (it fetches during the prerender and caches in the content store). Don't fetch in `onMounted` directly.
- Watchers don't run during the prerender: anything derived from fetched data must be set in `onServerPrefetch` too (see `SiteLayout.vue`, `usePageSeo`).
- No `window` / `document` outside `onMounted` or event handlers.
- `src/router/index.ts` exports the route table only; `main.ts` creates the router.
- Check the built HTML in `dist/`, not just the dev server.

## Sections

`src/components/sections/` is the library of generic page sections. The scaffolder keeps only the ones the site's pages use, chosen from the Build Tools blocks:
- it writes `useSections.ts` with just those
- it deletes the other section components
- the Studio's page schema offers the same set

The registry is `SECTION_TYPES` in `pws-scaffolder/lib/sections.js`, and the Build Tools list in `src/data/scaffoldedVariants.ts` mirrors it. A section that lists documents (Portfolio → `caseStudy`) also brings its detail page and route, and an entry in `seo-routes.json` `detailPages`, for the sitemap and the prerender. A section's own files (a function, a helper) are removed with it unless another used section needs them; a `growthOnly` section is left out on other tiers.

Every field a section's schema offers must be rendered by its component; `pnpm smoke` in the scaffolder checks this (`scripts/check-sections.js`). To add a section:
1. Add the component here.
2. Add its schema and registry entry in `sections.js`.
3. Add its block IDs to the Build Tools list.

## Color, dark mode and accessibility

- **Primary has two tokens:**
  - `--color-primary` is a surface (buttons, bands), with `--color-on-primary` text on it.
  - `--color-primary-ink` is primary used as text, links and focus rings on the page.
  - The scaffolder derives both per theme (`pws-scaffolder/lib/color.js`). Ink reaches 4.5:1 on the background and the surface; on-primary is white or near-black. Use ink for anything that's read, never `--color-primary`.
- **Dark mode:**
  - Build Tools sets the site theme: light only, light and dark, or dark only.
  - Light and dark: an inline script in `index.html` applies the stored theme, or else the system preference, before first paint. `useTheme` is a two-state toggle that remembers the visitor's choice. It reads the theme only once mounted, so the prerendered HTML hydrates cleanly.
  - Light only always renders light. Dark only always renders dark, with no toggle: `theme.css` carries the dark colors on `:root`, so it's dark even before scripts run. It shows the dark logo when there is one.
- **Contrast audit:** `pnpm build && pnpm preview`, then `pnpm audit:contrast`. It checks every route in `seo-routes.json` in each theme the site offers and confirms each suspect against screenshot pixels.
  - Run `AUDIT_SELFTEST=1 pnpm audit:contrast` to prove it catches 3 planted failures.
  - On first use, run `pnpm exec playwright install --only-shell chromium`.
- **Accessibility baseline (WCAG 2.2 AA):**
  - Rich-text headings are raised to keep the outline in order (`src/lib/richText.ts`) and keep the editor's size.
  - Escape closes the mobile menu and returns focus to its button.
  - Focus rings use the ink color.
  - The contact form has autofill hints and a focused error message.
  - Hero photos get a neutral scrim, darker on phones.

## Contact form and security

- **Studio forms (Form section):** forms are defined in the Studio under "Forms" (`dynamicForm`): questions, answer types, widths, file questions, recipient and thank-you message. The Form section places one on a page. `netlify/functions/send-form.ts` (`/api/send-form`) has the same protections as the contact form. It also:
  - looks the form up by ID on the server and accepts only its fields
  - enforces the required answers
  - checks attachments by their first bytes
  - sends to the form's "Send submissions to" address, falling back to `CONTACT_TO_EMAIL`
- **Event Registration (Growth only):** the section places one Studio event, whose registration settings say whether it's open, its capacity and the largest party. `netlify/functions/event-registration.ts` (`/api/event-registration`) has the contact form's protections. It also:
  - counts places in the client's own Turso database (`netlify/lib/turso.ts`, over HTTP, no driver), checking capacity and inserting in one statement so the last places can't be oversold
  - closes registration when it's switched off, the event is full, the closing date passes, or the event starts
  - emails the event's "Notify" address (else `CONTACT_TO_EMAIL`), sends the person a confirmation, and files a copy in the dashboard inbox
  - GET `?event=<id>` returns places left and `ready` (false without Turso), for the page and an uptime monitor
  - shows times in `VITE_SITE_TIMEZONE` (default America/Denver), on the page and in emails
  The scaffolder leaves it out below Growth. To free a cancelled registration's places, delete its row from `event_registrations`.
- **Newsletter Signup (every tier):** `netlify/functions/newsletter-signup.ts` (`/api/newsletter`) has the contact form's protections. A signup is filed in the dashboard inbox as kind `newsletter` and emailed to `CONTACT_TO_EMAIL`. On Growth, the Pipeline also adds it to the client's list in the agency AWeber account (chosen on the client's page in the Pipeline), so the site holds no AWeber credentials.
- **Donation (every tier):** donations go through Stripe Checkout on the client's **own** Stripe account, one-time or monthly; card details never touch the site. The section shows preset amounts (editable), an "Other amount" and a one-time/monthly switch.
  - `netlify/functions/donate.ts` (`/api/donate`, 5 requests a minute per visitor; donation forms attract card testing) has the contact form's protections, takes whole dollars from $5 to $10,000, and returns the Checkout address. GET returns `ready` (false without `STRIPE_SECRET_KEY`).
  - `netlify/functions/donation-webhook.ts` (`/api/donation-webhook`; Stripe webhook events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`) checks Stripe's signature (`netlify/lib/stripe.ts`), then for each paid gift, every month for a monthly one: emails the donor a receipt (amount, date, `DONATION_ORG_NAME`, and with `DONATION_EIN` the EIN and "No goods or services were provided"), tells `CONTACT_TO_EMAIL`, and files it in the dashboard inbox as kind `donation`. Payments the site didn't start are ignored. Stripe retries only when none of the three went out, so a partial failure doesn't send a second receipt.
  - Monthly donors change or cancel through Stripe's customer portal (`STRIPE_PORTAL_LOGIN_URL`, linked in their receipt).
- **Page title:** `PageSections` gives every page exactly one h1. That's the opening hero's title, or the page title when the page doesn't start with a hero; a later hero uses h2.

- **Contact form:** `netlify/functions/send-message.ts` at `/api/send-message`, rate limited to 10 requests a minute per visitor. The old `/.netlify/functions/send-message` address no longer answers.
  - **GET** returns a signed form token, plus `ready`, which is false when neither email nor the dashboard inbox is configured. Point a keyword uptime monitor at it and look for `"ready":true`.
  - **POST** refuses other origins and tokens that are missing, expired or too fast (`netlify/lib/formGuard.ts`). It drops honeypot hits.
  - **Delivery:** messages go to Resend email and to the dashboard inbox; either one is enough. A link-stuffed message is filed in the inbox as archived and not emailed.
- **Headers:** `netlify.toml` sets the CSP, HSTS (own host only, no `includeSubDomains`), nosniff, frame-ancestors and Permissions-Policy. The scaffolder writes the CSP per site. A new third-party host, such as an embed or widget, has to be added there or it is blocked; the browser console shows it.
- **Sentry (optional):** set `VITE_SENTRY_DSN` and it loads after the page is idle (`src/monitoring.ts`). Set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` on the build to upload hidden source maps, which are then deleted from `dist`.

## Do Not

- Run this template directly as a project
- Add client-specific values — use `##PLACEHOLDER##` pattern instead
- Remove placeholder comments in legal pages — scaffolder replaces them