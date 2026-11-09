<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next';
import { useSiteStore } from '@/stores/useSiteStore';
import { useTheme } from '@/composables/useTheme';

/** Light/dark switch; renders nothing unless Build Tools' "Dark mode" is on. */
const site = useSiteStore();
const { theme, toggle } = useTheme();
</script>

<template>
  <button
    v-if="site.darkMode"
    type="button"
    class="theme-toggle"
    :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`"
    @click="toggle"
  >
    <Sun v-if="theme === 'dark'" :size="20" />
    <Moon v-else :size="20" />
  </button>
</template>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 0.375rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
}

.theme-toggle:hover {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}

.theme-toggle:focus-visible {
  outline: 3px dashed currentColor;
  outline-offset: 2px;
}
</style>
