<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{
  to: string;
}>();

const isExternal = computed(() =>
  props.to.startsWith('http') || props.to.startsWith('//')
);
</script>

<template>
  <a
    v-if="isExternal"
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
