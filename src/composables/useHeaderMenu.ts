import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useEventListener } from '@vueuse/core';
import { useMenuFocus } from '@/composables/useMenuFocus';

/**
 * The mobile (or hamburger-only) menu shared by the header variants: a
 * disclosure that opens below the header (see useMenuFocus), closes on
 * Escape with focus back on its button, and closes on every page change.
 *
 * Bind the returned refs in the template by name:
 *   <header ref="header"> … <nav ref="menu"> … <button ref="menuButton">
 */
export function useHeaderMenu() {
  const open = ref(false);
  const header = ref<HTMLElement | null>(null);
  const menu = ref<HTMLElement | null>(null);
  const menuButton = ref<HTMLButtonElement | null>(null);

  useMenuFocus({ open, menu, container: header, mode: 'disclosure' });

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !open.value) return;
    open.value = false;
    menuButton.value?.focus();
  });

  const route = useRoute();
  watch(() => route.path, () => (open.value = false));

  return { open, header, menu, menuButton };
}
