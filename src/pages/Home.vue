<script setup>
import { useSanity } from '@/composables/useSanity';
import { pageQuery } from '@/composables/useSections';
import { usePageSeo } from '@/composables/pageSeo';
import PageSections from '@/components/layout/PageSections.vue';
const { data: page, ready } = useSanity(pageQuery('/'));
usePageSeo(page, ready);
</script>

<template>
  <main class="page page--home">
    <PageSections :page="page" />
  </main>
</template>
