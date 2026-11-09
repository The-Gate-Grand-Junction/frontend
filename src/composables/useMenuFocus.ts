import { nextTick, watch, type Ref } from 'vue';
import { useEventListener } from '@vueuse/core';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

const focusables = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);

/**
 * Keyboard behaviour for the mobile menus.
 *
 * Opening moves focus to the menu's first link. In the headers the menu comes
 * before its button in the page, so without this Tab from the button skipped
 * the menu and went on into the page.
 *
 * `disclosure` (a menu dropped below the header): focus leaving the header
 * closes it, so tabbing on simply carries on down the page.
 *
 * `dialog` (a full-screen menu): Tab and Shift+Tab stay inside it until it
 * closes, cycling through `alsoFocusable` too (the menu button, when it
 * sits over the menu as its close control); mark the closed menu `inert` so
 * its off-screen links can't be reached at all.
 *
 * Escape and focus going back to the button are each header's own.
 */
export function useMenuFocus(opts: {
  open: Ref<boolean>;
  menu: Ref<HTMLElement | null>;
  mode: 'disclosure' | 'dialog';
  /** For disclosure: the header holding the menu and its button */
  container?: Ref<HTMLElement | null>;
  /** For dialog: controls outside the menu that stay in the Tab cycle */
  alsoFocusable?: Ref<HTMLElement | null>[];
}) {
  watch(opts.open, async (isOpen) => {
    if (!isOpen) return;
    await nextTick();
    if (opts.menu.value) focusables(opts.menu.value)[0]?.focus();
  });

  if (opts.mode === 'disclosure') {
    useEventListener(opts.container ?? opts.menu, 'focusout', (e: FocusEvent) => {
      const root = (opts.container ?? opts.menu).value;
      const next = e.relatedTarget as Node | null;
      if (opts.open.value && root && next && !root.contains(next)) opts.open.value = false;
    });
    return;
  }

  useEventListener('keydown', (e: KeyboardEvent) => {
    const root = opts.menu.value;
    if (e.key !== 'Tab' || !opts.open.value || !root) return;
    const extra = (opts.alsoFocusable ?? []).map((r) => r.value).filter((el): el is HTMLElement => !!el);
    const items = [...focusables(root), ...extra];
    if (!items.length) return;
    // Moved by hand every time: the extras aren't next to the menu in the
    // page, so the browser's own order would leave the cycle
    e.preventDefault();
    const at = items.indexOf(document.activeElement as HTMLElement);
    const step = e.shiftKey ? -1 : 1;
    const next = at === -1 ? (e.shiftKey ? items.length - 1 : 0) : (at + step + items.length) % items.length;
    items[next]!.focus();
  });
}
