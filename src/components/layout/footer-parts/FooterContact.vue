<script setup lang="ts">
import { computed } from 'vue';
import { useSiteStore } from '@/stores/useSiteStore';

/** Address, phone and email from Site Settings; `inline` runs them on one line. */
const props = defineProps<{ inline?: boolean }>();

const site = useSiteStore();
const telHref = computed(() => `tel:${site.contactPhone.replace(/[^\d+]/g, '')}`);
// On one line, the address's lines are joined with commas
const addressLine = computed(() => site.address.split(/\n+/).map((l) => l.trim().replace(/,$/, '')).filter(Boolean).join(', '));
</script>

<template>
  <address v-if="site.address || site.contactPhone || site.contactEmail" class="footer-contact" :class="{ 'footer-contact--inline': inline }">
    <span v-if="site.address" class="footer-contact__address">{{ props.inline ? addressLine : site.address }}</span>
    <a v-if="site.contactPhone" :href="telHref" class="footer-contact__link">{{ site.contactPhone }}</a>
    <a v-if="site.contactEmail" :href="`mailto:${site.contactEmail}`" class="footer-contact__link">{{ site.contactEmail }}</a>
  </address>
</template>

<style scoped>
.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-style: normal;
  font-size: 0.875rem;
  line-height: 1.6;
}

.footer-contact__address {
  white-space: pre-line;
}

.footer-contact--inline {
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 1.25rem;
}

.footer-contact--inline .footer-contact__address {
  white-space: normal;
}

.footer-contact__link {
  color: inherit;
}

.footer-contact__link:hover {
  color: inherit;
  text-decoration: underline;
}

.footer-contact__link:focus-visible {
  outline: 2px dashed currentColor;
  outline-offset: 2px;
}
</style>
