import { defineStore } from 'pinia';
import type { SiteConfig } from '@/types/site';

export const useSiteStore = defineStore('site', {
  state: (): SiteConfig => ({
    name: 'The Gate: A Meeting Venue',
    logo: '',
    darkLogo: '',
    tagline: '',
    // Public address only (forwards to the owners); never the personal inbox
    contactEmail: 'info@thegategj.com',
    contactPhone: '',
    address: '2825 North Ave, Grand Junction, CO 81501',
    ctaLabel: '',
    ctaUrl: '/contact',
    // Footer band shows only when Site Settings fills these in
    ctaHeadline: '',
    ctaSubtext: '',
    ctaFooterLabel: '',
    ctaFooterUrl: '',
    copyrightText: '',
    // Tier 1 launch: Home only, so no unfinished page shows before Studio's menu loads.
    // Full launch: add back About (/about), Contact (/contact), Donate (/donate).
    primaryNav: [
      { label: 'Home', to: '/' },
    ],
    footerNav: [

    ],
    legalNav: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms-and-conditions' },
      { label: 'Accessibility Statement', to: '/accessibility' },
    ],
    socialLinks: [],
    darkMode: false,
    // Utility Bar / Announcement headers fill these from Site Settings
    headerHours: '',
    announcement: null,
    footerNewsletter: { heading: '', text: '' },
  }),
});
