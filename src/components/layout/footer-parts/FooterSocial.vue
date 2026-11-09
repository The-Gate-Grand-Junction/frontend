<script setup lang="ts">
import { computed } from 'vue';
import { useSiteStore } from '@/stores/useSiteStore';
import { getSocialIcon, socialLabel } from '@/composables/useSocialIcons';

/** Social links from Site Settings as icons; `circle` puts each in a round button. */
withDefaults(defineProps<{ circle?: boolean; align?: 'start' | 'center' }>(), { circle: false, align: 'start' });

const site = useSiteStore();
const links = computed(() => site.socialLinks.map((l) => ({ ...l, platform: l.platform.toLowerCase() })));
</script>

<template>
  <ul v-if="links.length" class="footer-social" :class="{ 'footer-social--circle': circle, 'footer-social--center': align === 'center' }">
    <li v-for="link in links" :key="link.url">
      <a :href="link.url" target="_blank" rel="noopener noreferrer" class="footer-social__link" :aria-label="`${socialLabel(link.platform)} (opens in a new tab)`">
        <svg v-if="getSocialIcon(link.platform)" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path :d="getSocialIcon(link.platform)!" />
        </svg>
        <span v-else aria-hidden="true">{{ socialLabel(link.platform).charAt(0) }}</span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.footer-social {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-social--center {
  justify-content: center;
}

.footer-social__link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  color: inherit;
  font-weight: 700;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.footer-social--circle .footer-social__link {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}

.footer-social__link:hover {
  color: inherit;
  background-color: color-mix(in srgb, currentColor 20%, transparent);
}

.footer-social__link:focus-visible {
  outline: 2px dashed currentColor;
  outline-offset: 2px;
}
</style>
