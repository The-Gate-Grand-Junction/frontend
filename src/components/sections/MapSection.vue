<script setup>
import { computed } from 'vue';
import { MapPin } from 'lucide-vue-next';
const props = defineProps({ section: { type: Object, default: null } });

// Keyless Google Maps embed (Share → Embed a map → the iframe's src). Any
// other host is ignored: the Studio checks it too, and the site's CSP only
// allows www.google.com frames.
const EMBED = /^https:\/\/www\.google\.com\/maps\/embed\?/;
const embedUrl = computed(() => (EMBED.test(props.section?.mapEmbedUrl || '') ? props.section.mapEmbedUrl : null));
const directionsUrl = computed(() =>
  props.section?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.section.address.replace(/\s*\n\s*/g, ', '))}`
    : null,
);
</script>

<template>
  <section v-if="embedUrl || section?.address" class="reveal px-6 bg-[var(--color-bg)]" :class="embedUrl ? 'py-14' : 'py-6 last:pb-16'">
    <!-- With a map: text beside it. Without: a highlighted box in the text column, like Meeting Times -->
    <div :class="embedUrl ? 'max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start' : 'max-w-3xl mx-auto info-panel'">
      <div class="space-y-4">
        <template v-if="section?.heading">
          <div v-if="!embedUrl" class="info-panel__heading">
            <MapPin class="info-panel__icon" :size="28" aria-hidden="true" />
            <h2 class="section-heading section-heading--panel">{{ section.heading }}</h2>
          </div>
          <template v-else>
            <span class="section-rule" aria-hidden="true"></span>
            <h2 class="section-heading">{{ section.heading }}</h2>
          </template>
        </template>
        <p v-if="section?.intro" class="text-[var(--color-text-secondary)] leading-relaxed">{{ section.intro }}</p>
        <address v-if="section?.address" class="not-italic text-lg text-[var(--color-text)] whitespace-pre-line">{{ section.address }}</address>
        <a
          v-if="directionsUrl"
          :href="directionsUrl"
          class="info-panel__action"
        >Open in Google Maps<span class="sr-only"> for directions</span></a>
      </div>
      <div v-if="embedUrl" class="md:col-span-2 overflow-hidden border border-[var(--color-border)]">
        <iframe
          :src="embedUrl"
          :title="section?.mapTitle || `Map of ${section?.address || 'our location'}`"
          class="w-full aspect-[4/3] md:aspect-[16/10] border-0"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </section>
</template>
