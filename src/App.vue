<script setup lang="ts">
import { RouterView } from 'vue-router';
import SiteLayout from '@/components/layout/SiteLayout.vue';
</script>

<template>
  <SiteLayout>
    <!-- Keyed by path: routes sharing a page component (e.g. /portfolio/a → /portfolio/b)
         would otherwise reuse the instance and keep showing the first page's content -->
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </RouterView>
  </SiteLayout>
</template>
