<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '@/stores/useSiteStore';
import { useTheme } from '@/composables/useTheme';
import { sizedImageUrl } from '@/composables/useSanityImage';

/**
 * The site logo linking home: the dark logo in dark mode (or on a dark
 * background: `onDark`) when there is one, else the name.
 */
const props = withDefaults(defineProps<{ height?: number; onDark?: boolean }>(), { height: 32, onDark: false });

const site = useSiteStore();
const { theme } = useTheme();
const logo = computed(() => ((theme.value === 'dark' || props.onDark) && site.darkLogo ? site.darkLogo : site.logo));
</script>

<template>
  <RouterLink to="/" class="header-logo">
    <img
      v-if="logo"
      :src="sizedImageUrl(logo, props.height * 5)"
      :alt="site.name"
      class="header-logo__img"
      :style="{ height: `${props.height}px` }"
    />
    <span v-else>{{ site.name }}</span>
  </RouterLink>
</template>

<style scoped>
.header-logo {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary-ink);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.header-logo:hover {
  color: var(--color-primary-ink);
}

.header-logo:focus-visible {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
  border-radius: 4px;
}

.header-logo__img {
  width: auto;
  object-fit: contain;
}
</style>
