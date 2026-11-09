<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
}>();

useHead({
  title: computed(() => props.title),
  meta: [
    { name: 'description', content: computed(() => props.description) },
  ],
  script: computed(() =>
    props.jsonLd
      ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(props.jsonLd) }]
      : []
  ),
});
</script>

<template>
  <!-- SeoHead is renderless — it injects into <head> via @unhead/vue -->
</template>
