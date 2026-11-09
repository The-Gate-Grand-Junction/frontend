<template>
  <div class="section-divider" aria-hidden="true">
    <svg viewBox="0 0 1440 48" preserveAspectRatio="none"
         xmlns="http://www.w3.org/2000/svg">
      <path
        :d="flip
          ? 'M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z'
          : 'M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z'"
        :fill="fill"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  fill: string
  flip?: boolean
}>()
</script>

<style scoped>
.section-divider {
  display: block;
  height: 48px;
  overflow: hidden;
  margin: -1px 0;
}
svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
