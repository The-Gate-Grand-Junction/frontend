export interface NavItem {
  label: string;
  to: string;
  // Main menu with the Dropdown or Mega Menu header: the submenu (one level)
  children?: NavItem[];
}

/**
 * Hierarchical nav item used by headers that support accordion / dropdown menus.
 * Items with `children` render as expandable sections; without, as direct links.
 */
export interface HeaderNavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

export interface PageMeta {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
}

export interface SiteConfig {
  name: string;
  logo: string;
  darkLogo: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  ctaLabel: string;
  ctaUrl: string;
  ctaHeadline: string;
  ctaSubtext: string;
  ctaFooterLabel: string;
  ctaFooterUrl: string;
  copyrightText: string;
  primaryNav: NavItem[];
  footerNav: NavItem[];
  legalNav: NavItem[];
  socialLinks: { platform: string; url: string }[];
  // Build Tools "Dark mode" switch: shows the header toggle. Off = always light.
  darkMode: boolean;
  // Utility Bar header: the opening-hours line in its top bar
  headerHours: string;
  // Announcement header: the bar above the header (no text = no bar)
  announcement: { text: string; linkLabel: string; linkUrl: string } | null;
  // Newsletter footer: the heading and text beside its signup form
  footerNewsletter: { heading: string; text: string };
  // Optional — populated when a header variant supports hierarchical nav
  // (e.g. HeaderTransparentJC with accordion sections)
  headerNav?: HeaderNavItem[];
  volunteerUrl?: string;
  donateUrl?: string;
}
