import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useEventListener } from '@vueuse/core';

/**
 * Desktop submenus for the Dropdown and Mega Menu headers (disclosure
 * pattern): the parent stays a link, a separate arrow button opens its
 * submenu. One open at a time; hovering opens it on devices with a mouse
 * (and leaving closes it, unless its arrow was clicked); Escape closes it and
 * returns focus to its button; focus leaving the item, a click outside or a
 * page change closes it.
 *
 * Mark each arrow button with data-submenu-toggle="<key>".
 */
export function useSubmenus() {
  const openKey = ref<string | null>(null);
  // Opened by hovering: leaving closes it, and a click on its arrow keeps it
  // open (rather than closing what the hover just opened)
  const byHover = ref(false);
  const close = () => {
    openKey.value = null;
    byHover.value = false;
  };
  const toggle = (key: string) => {
    if (openKey.value === key && byHover.value) byHover.value = false;
    else if (openKey.value === key) close();
    else {
      openKey.value = key;
      byHover.value = false;
    }
  };

  const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  const hoverOpen = (key: string) => {
    if (!canHover() || (openKey.value && !byHover.value)) return;
    openKey.value = key;
    byHover.value = true;
  };
  const hoverClose = () => {
    if (byHover.value) close();
  };

  // A click anywhere outside the open item closes it
  useEventListener('click', (e: MouseEvent) => {
    if (!openKey.value) return;
    const toggleEl = document.querySelector(`[data-submenu-toggle="${CSS.escape(openKey.value)}"]`);
    const item = toggleEl?.closest('li');
    if (item && !item.contains(e.target as Node)) close();
  });

  function onFocusOut(e: FocusEvent) {
    const item = e.currentTarget as HTMLElement;
    if (!item.contains(e.relatedTarget as Node | null)) close();
  }

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !openKey.value) return;
    const key = openKey.value;
    close();
    document.querySelector<HTMLElement>(`[data-submenu-toggle="${CSS.escape(key)}"]`)?.focus();
  });

  const route = useRoute();
  watch(() => route.path, close);

  return { openKey, toggle, close, hoverOpen, hoverClose, onFocusOut };
}
