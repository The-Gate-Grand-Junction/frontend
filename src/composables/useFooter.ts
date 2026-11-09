import { computed } from 'vue';
import { useSiteStore } from '@/stores/useSiteStore';

/**
 * What the footer variants share: the copyright line, and link columns built
 * from the Studio menus (Main → "Pages", Footer → "More", Legal → "Legal";
 * empty menus are left out). Editors change the columns in Studio → Menus.
 */
export function useFooter() {
  const site = useSiteStore();
  const copyright = computed(() => site.copyrightText || `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`);
  const columns = computed(() =>
    [
      // Submenu pages listed after their parent
      { title: 'Pages', links: site.primaryNav.flatMap((i) => [i, ...(i.children ?? [])]) },
      { title: 'More', links: site.footerNav },
      { title: 'Legal', links: site.legalNav },
    ].filter((c) => c.links.length),
  );
  const hasContact = computed(() => Boolean(site.address || site.contactPhone || site.contactEmail));
  return { site, copyright, columns, hasContact };
}
