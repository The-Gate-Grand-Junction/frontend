<script setup lang="ts">
defineProps<{
  padded?: boolean;
}>();
</script>

<template>
  <div class="card" :class="{ 'card--padded': padded !== false }">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.card--padded {
  padding: 1.5rem;
}
</style>
