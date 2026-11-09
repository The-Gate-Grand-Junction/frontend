<script setup>
import { computed } from 'vue';
const props = defineProps({ section: { type: Object, default: null } });
const features = computed(() => props.section?.items || []);
</script>

<template>
  <section class="reveal py-16 px-6 bg-[var(--color-bg)]">
    <div v-if="section?.heading" class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-[var(--color-text)] text-center mb-12">{{ section.heading }}</h2>
    </div>
    <div v-if="features.length" class="reveal-stagger max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="(feature, i) in features" :key="i" class="text-center p-6">
        <div class="text-4xl mb-4 feature-icon" role="img" :aria-label="feature.title || 'Feature icon'" v-html="feature.icon?.svg || '✨'"></div>
        <h3 class="text-lg font-semibold text-[var(--color-text)] mb-2">{{ feature.title }}</h3>
        <p class="text-[var(--color-text-secondary)] text-sm">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-icon :deep(svg) { width: 2.5rem; height: 2.5rem; margin: 0 auto; color: var(--color-primary-ink); }
</style>
