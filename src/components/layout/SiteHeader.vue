<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Menu, X } from 'lucide-vue-next';
import { useSiteStore } from '@/stores/useSiteStore';
import { useHeaderMenu } from '@/composables/useHeaderMenu';
import HeaderLogo from '@/components/layout/HeaderLogo.vue';
import ThemeToggle from '@/components/layout/ThemeToggle.vue';
import SmartLink from '@/components/ui/SmartLink.vue';


// Minimal: logo and a menu button at every screen size; the menu (and the
// header button, when set) open in a panel below
const site = useSiteStore();
const { open, header, menu, menuButton } = useHeaderMenu();
// A menu holding only Home has nothing to offer (one-page launch): hide it and
// show the header button inline. It returns once Studio's Main menu has more pages.
const hasMenu = computed(() => site.primaryNav.some((item) => item.to !== '/'));
</script>

<template>
  <header ref="header" class="site-header">
    <div class="site-header__inner">
      <HeaderLogo :height="28" />

      <div class="site-header__actions">
        
        <ThemeToggle />
        <SmartLink v-if="!hasMenu && site.ctaLabel" :to="site.ctaUrl" class="site-header__cta site-header__cta--inline">
          {{ site.ctaLabel }}
        </SmartLink>
        <button
          v-if="hasMenu"
          ref="menuButton"
          type="button"
          class="site-header__menu-button"
          :aria-label="open ? 'Close menu' : 'Open menu'"
          :aria-expanded="open"
          aria-controls="site-menu"
          @click="open = !open"
        >
          <X v-if="open" :size="22" />
          <Menu v-else :size="22" />
        </button>
      </div>
    </div>

    <nav
      v-if="hasMenu"
      id="site-menu"
      ref="menu"
      class="site-header__panel"
      :class="{ 'site-header__panel--open': open }"
      aria-label="Main"
    >
      <div class="site-header__panel-inner">
        <RouterLink v-for="item in site.primaryNav" :key="item.to" :to="item.to" class="site-header__link">
          {{ item.label }}
        </RouterLink>
        <SmartLink v-if="site.ctaLabel" :to="site.ctaUrl" class="site-header__cta">
          {{ site.ctaLabel }}
        </SmartLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.site-header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.site-header__menu-button {
  display: flex;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  padding: 0.5rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
}

.site-header__menu-button:hover {
  background-color: var(--color-border);
}

.site-header__panel {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 12px 24px -12px rgb(0 0 0 / 0.25);
}

.site-header__panel--open {
  display: block;
}

.site-header__panel-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.site-header__link {
  color: var(--color-text);
  font-size: 1.0625rem;
  font-weight: 500;
  padding: 0.625rem 0;
  transition: color 0.2s ease;
}

.site-header__link:hover,
.site-header__link.router-link-exact-active {
  color: var(--color-primary-ink);
}

.site-header__cta {
  align-self: flex-start;
  margin-top: 0.75rem;
  padding: 0.625rem 1.25rem;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  border-radius: var(--border-radius);
}

.site-header__cta:hover {
  color: var(--color-on-primary);
  filter: brightness(1.08);
}

.site-header__link:focus-visible,
.site-header__menu-button:focus-visible,
.site-header__cta:focus-visible {
  outline: 3px dashed var(--color-primary-ink);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .site-header__cta {
    align-self: stretch;
    text-align: center;
  }
}

/* In the header bar itself (no menu): compact, vertically centred */
.site-header__cta--inline {
  align-self: center;
  margin-top: 0;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  white-space: nowrap;
}
</style>
