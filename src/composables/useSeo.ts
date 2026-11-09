import { useHead } from '@unhead/vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSiteStore } from '@/stores/useSiteStore';
import { usePageSeoStore } from '@/composables/pageSeo';

const siteUrl = import.meta.env.VITE_SITE_URL || 'https://thegategj.com';
// Social preview image: add public/og-image.png (1200×630) and set this to `${siteUrl}/og-image.png`.
// A page's own Share image (Studio → Search & Social) wins. Without either, no image tags are emitted.
const defaultImage = '';

// Fallback search copy from Build Tools. Each page's Search & Social fields in Studio win,
// so the client owns their search results.
const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Home',
    description: 'The Gate is a meeting venue for worship, connection, and life-changing encounters. Explore a welcoming space for ministries, leaders, and community gatherings.',
  },
  '/about': {
    title: 'About',
    description: 'Learn about The Gate, a professional meeting venue built for worship, connection, collaboration, and leadership development. Meet the vision behind the space.',
  },
  '/contact': {
    title: 'Contact',
    description: 'Contact The Gate to ask about availability and plan your next meeting, worship gathering, or event. We\'d love to help you find the right space for your people.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: '',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    description: '',
  },
  '/accessibility': {
    title: 'Accessibility Statement',
    description: '',
  },
  '/donate': {
    title: 'Donate',
    description: 'Support The Gate and help keep our doors open for worship, connection, and life-changing encounters. Your gift sustains a welcoming space for the community.',
  },
};

// Structured data from Build Tools; name, phone, email, address and social profiles
// follow Site Settings in Studio (one source for the business's facts)
const baseJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "NGO",
  "name": "The Gate : A Meeting Venue",
  "url": "https://thegategj.com",
  "email": "ljkurtz00@msn.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2825 North Ave",
    "addressLocality": "Grand Junction",
    "addressRegion": "CO",
    "postalCode": "81501",
    "addressCountry": "US"
  }
};
const scaffoldedAddress = '2825 North Ave, Grand Junction, CO 81501';

// Google cuts titles at about 60 characters and descriptions at about 158
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 158;

function trimAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,;:.–—-]+$/, '')}…`;
}

function composeTitle(title: string, siteName: string): string {
  if (!title || title === siteName) return trimAtWord(siteName, TITLE_MAX);
  if (title.includes(siteName)) return trimAtWord(title, TITLE_MAX);
  const full = `${title} | ${siteName}`;
  return full.length <= TITLE_MAX ? full : trimAtWord(title, TITLE_MAX);
}

export function useSeo() {
  const route = useRoute();
  const site = useSiteStore();
  const pageSeo = usePageSeoStore();

  const own = computed(() => (pageSeo.path === route.path ? pageSeo : null));
  const notFound = computed(() => route.name === 'NotFound');
  // Search results pages are kept out of search engines
  const searchPage = computed(() => route.name === 'Search');
  const fallback = computed(() => (notFound.value
    ? { title: 'Page not found', description: '' }
    : searchPage.value ? { title: 'Search', description: '' } : pageMeta[route.path]));

  const title = computed(() => composeTitle(own.value?.title || fallback.value?.title || '', site.name));
  const description = computed(() =>
    trimAtWord(own.value?.description || fallback.value?.description || site.tagline || '', DESCRIPTION_MAX),
  );
  const image = computed(() => own.value?.image || defaultImage);
  const canonicalUrl = computed(() => `${siteUrl}${route.path === '/' ? '' : route.path}`);

  // Deploy previews and the *.netlify.app address must not compete with the real domain
  const noindex = typeof window !== 'undefined' && window.location.hostname.endsWith('.netlify.app');

  const jsonLd = computed(() => {
    const sameAs = (site.socialLinks || []).map((l) => l.url).filter(Boolean);
    return {
      ...baseJsonLd,
      name: site.name,
      ...(site.contactPhone ? { telephone: site.contactPhone } : {}),
      ...(site.contactEmail ? { email: site.contactEmail } : {}),
      // An address edited in Studio replaces the scaffolded structured one
      ...(site.address && site.address !== scaffoldedAddress ? { address: site.address } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    };
  });

  useHead({
    title,
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
    meta: computed(() => [
      { name: 'description', content: description.value },
      ...(noindex || notFound.value ? [{ name: 'robots', content: 'noindex, nofollow' }] : searchPage.value ? [{ name: 'robots', content: 'noindex, follow' }] : []),
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: site.name },
      { property: 'og:title', content: title.value },
      { property: 'og:description', content: description.value },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:locale', content: 'en_US' },
      { name: 'twitter:card', content: image.value ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: title.value },
      { name: 'twitter:description', content: description.value },
      ...(image.value
        ? [{ property: 'og:image', content: image.value }, { name: 'twitter:image', content: image.value }]
        : []),
    ]),
    script: computed(() => [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd.value),
      },
    ]),
  });
}
