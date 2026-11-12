<script setup>
import { computed } from 'vue';
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
  <section v-if="embedUrl || section?.address" class="reveal py-16 px-6 bg-[var(--color-bg)]">
    <!-- Without a map, match the text sections' column so the page lines up -->
    <div :class="embedUrl ? 'max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start' : 'max-w-3xl mx-auto'">
      <div class="space-y-4">
        <h2 v-if="section?.heading" class="text-3xl font-bold text-[var(--color-text)]">{{ section.heading }}</h2>
        <p v-if="section?.intro" class="text-[var(--color-text-secondary)] leading-relaxed">{{ section.intro }}</p>
        <address v-if="section?.address" class="not-italic text-[var(--color-text)] whitespace-pre-line">{{ section.address }}</address>
        <a
          v-if="directionsUrl"
          :href="directionsUrl"
          class="focus-ring inline-block font-semibold text-[var(--color-primary-ink)] underline rounded"
        >Open in Google Maps<span class="sr-only"> for directions</span></a>
      </div>
      <div v-if="embedUrl" class="md:col-span-2 rounded-2xl overflow-hidden border border-[var(--color-border)]">
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
