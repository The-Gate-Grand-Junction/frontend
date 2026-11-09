import { defineStore } from 'pinia';
import type { SiteConfig } from '@/types/site';

export const useSiteStore = defineStore('site', {
  state: (): SiteConfig => ({
    name: 'The Gate : A Meeting Venue',
    logo: '',
    darkLogo: '',
    tagline: '',
    contactEmail: 'ljkurtz00@msn.com',
    contactPhone: '',
    address: '2825 North Ave, Grand Junction, CO 81501',
    ctaLabel: '',
    ctaUrl: '/contact',
    ctaHeadline: 'Ready to get started?',
    ctaSubtext: 'Let\'s build something great together.',
    ctaFooterLabel: '',
    ctaFooterUrl: '',
    copyrightText: '',
    primaryNav: [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Donate', to: '/donate' },
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
