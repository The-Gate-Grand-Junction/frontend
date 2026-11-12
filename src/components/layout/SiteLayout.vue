<script setup lang="ts">
import { onServerPrefetch, watch } from 'vue';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import { useSeo } from '@/composables/useSeo';
import { useRevealObserver } from '@/composables/useRevealObserver';
import { useSanity } from '@/composables/useSanity';
import { useSiteStore } from '@/stores/useSiteStore';
import { sanityImage } from '@/composables/useSanityImage';

/** A Studio image field as fetched: asset reference plus crop/hotspot */
type SanityImage = { asset?: { _ref?: string }; crop?: unknown; hotspot?: unknown };

useSeo();
useRevealObserver();

// Fetch site settings and navigation from Sanity, sync into the Pinia store
const site = useSiteStore();

// ── Site Settings ──
interface SiteSettings {
  siteName?: string;
  logo?: SanityImage;
  darkLogo?: SanityImage;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaHeadline?: string;
  ctaSubtext?: string;
  ctaFooterLabel?: string;
  ctaFooterUrl?: string;
  copyrightText?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  socialLinks?: { platform: string; url: string }[];
  headerHours?: string;
  announcementText?: string;
  announcementLinkLabel?: string;
  announcementLinkUrl?: string;
  footerNewsletterHeading?: string;
  footerNewsletterText?: string;
}

const { data: settings, ready: settingsReady } = useSanity<SiteSettings>(
  `*[_type == "siteSettings"][0]{
    siteName,
    "logo": logo{ asset, crop, hotspot },
    "darkLogo": darkLogo{ asset, crop, hotspot },
    ctaLabel,
    ctaUrl,
    ctaHeadline,
    ctaSubtext,
    ctaFooterLabel,
    ctaFooterUrl,
    copyrightText,
    contactPhone,
    contactEmail,
    contactAddress,
    socialLinks[]{ platform, url },
    headerHours,
    announcementText,
    announcementLinkLabel,
    announcementLinkUrl,
    footerNewsletterHeading,
    footerNewsletterText
  }`
);

function applySettings(s: SiteSettings | null) {
  if (!s) return;
  if (s.siteName) site.name = s.siteName;
  // The builder applies the Studio crop (rect=…); HeaderLogo then sizes it
  if (s.logo?.asset) site.logo = sanityImage(s.logo).url();
  if (s.darkLogo?.asset) site.darkLogo = sanityImage(s.darkLogo).url();
  if (s.ctaLabel) site.ctaLabel = s.ctaLabel;
  if (s.ctaUrl) site.ctaUrl = s.ctaUrl;
  if (s.ctaHeadline) site.ctaHeadline = s.ctaHeadline;
  if (s.ctaSubtext) site.ctaSubtext = s.ctaSubtext;
  if (s.ctaFooterLabel) site.ctaFooterLabel = s.ctaFooterLabel;
  if (s.ctaFooterUrl) site.ctaFooterUrl = s.ctaFooterUrl;
  if (s.copyrightText) site.copyrightText = s.copyrightText;
  // Business facts live in Site Settings: footer, contact section and JSON-LD all read them from here
  if (s.contactPhone) site.contactPhone = s.contactPhone;
  if (s.contactEmail) site.contactEmail = s.contactEmail;
  if (s.contactAddress) site.address = s.contactAddress;
  if (s.socialLinks?.length) site.socialLinks = s.socialLinks.filter((l) => l.url);
  // Header extras (Utility Bar, Announcement): cleared when the editor empties them
  site.headerHours = s.headerHours?.trim() || '';
  site.announcement = s.announcementText?.trim()
    ? { text: s.announcementText.trim(), linkLabel: s.announcementLinkLabel?.trim() || '', linkUrl: s.announcementLinkUrl?.trim() || '' }
    : null;
  site.footerNewsletter = { heading: s.footerNewsletterHeading?.trim() || '', text: s.footerNewsletterText?.trim() || '' };
}

// ── Navigation ──
interface NavItem { label: string; url: string; children?: { label: string; url: string }[] }
interface NavDoc { navType: string; items: NavItem[] }

const { data: navDocs, ready: navReady } = useSanity<NavDoc[]>(
  `*[_type == "navigation"]{navType, items[]{label, url, children[]{label, url}}}`
);

function applyNav(docs: NavDoc[] | null) {
  if (!docs) return;
  for (const doc of docs) {
    const items = (doc.items || []).map((i) => ({
      label: i.label,
      to: i.url,
      ...(i.children?.length ? { children: i.children.map((c) => ({ label: c.label, to: c.url })) } : {}),
    }));
    if (doc.navType === 'main' && items.length) site.primaryNav = items;
    if (doc.navType === 'footer' && items.length) site.footerNav = items;
    if (doc.navType === 'legal' && items.length) site.legalNav = items;
  }
}

// In the browser: apply on arrival and after a refetch picks up a publish.
// During the prerender watchers don't run, so wait for the data and apply it
// there; the site store is serialised into the HTML with the result.
watch(settings, applySettings);
watch(navDocs, applyNav);
onServerPrefetch(async () => {
  await Promise.all([settingsReady, navReady]);
  applySettings(settings.value);
  applyNav(navDocs.value);
});
</script>

<template>
  <!-- Renders at once with the scaffolded name and nav; Sanity's settings and
       navigation replace them when they arrive, so the page query isn't held up -->
  <div class="site-layout">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <SiteHeader />
    <div id="main-content">
      <slot />
    </div>
    <SiteFooter />
  </div>
</template>

<style scoped>
.site-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

/* Keep the footer below the fold while the page's content loads */
#main-content:empty {
  min-height: 100dvh;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: var(--border-radius);
  z-index: 100;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 1rem;
}
</style>
