<script setup>
import { computed } from 'vue';
import { sectionMap } from '@/composables/useSections';

const props = defineProps({ page: { type: Object, default: null } });

// Exactly one h1 per page, ahead of every section's h2: the opening hero's
// title when the page starts with one, otherwise the page title. A hero
// further down the page uses h2.
const sections = computed(() => (props.page?.sections || []).filter((s) => sectionMap[s._type]));
const opensWithHero = computed(() => sections.value[0]?._type === 'heroSection');
</script>

<template>
  <header v-if="page?.title && !opensWithHero" class="page-title pt-16 pb-2 px-6 bg-[var(--color-bg)]">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-extrabold leading-tight text-[var(--color-text)]">{{ page.title }}</h1>
    </div>
  </header>
  <component
    :is="sectionMap[section._type]"
    v-for="(section, i) in sections"
    :key="section._key"
    :section="section"
    v-bind="section._type === 'heroSection' ? { headingLevel: i === 0 ? 1 : 2 } : {}"
  />
</template>
