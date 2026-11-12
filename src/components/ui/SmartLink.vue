<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{
  to: string;
}>();

const isExternal = computed(() =>
  props.to.startsWith('http') || props.to.startsWith('//')
);
// Studio's link rule allows these; the router would treat them as page paths
const isProtocol = computed(() => /^(mailto|tel):/.test(props.to));
</script>

<template>
  <a v-if="isProtocol" :href="to">
    <slot />
  </a>
  <a
    v-else-if="isExternal"
    :href="to"
    target="_blank"
    rel="noopener noreferrer"
  >
    <slot />
  </a>
  <RouterLink v-else :to="to">
    <slot />
  </RouterLink>
</template>
