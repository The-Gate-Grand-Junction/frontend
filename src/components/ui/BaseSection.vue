<script setup lang="ts">
defineProps<{
  narrow?: boolean;
}>();
</script>

<template>
  <section class="base-section" :class="{ 'base-section--narrow': narrow }">
    <slot />
  </section>
</template>

<style scoped>
.base-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.base-section--narrow {
  max-width: 800px;
}
</style>
