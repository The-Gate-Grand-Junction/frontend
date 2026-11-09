<script setup>
import { ref, onMounted } from 'vue';
import { PortableText } from '@portabletext/vue';
import { richTextComponents, withHeadingOrder } from '@/lib/richText';

const props = defineProps({
  slug: { type: String, required: true },
  fallbackTitle: { type: String, default: '' },
});

const page = ref(null);
const loading = ref(true);

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

onMounted(async () => {
  if (!projectId) { loading.value = false; return; }
  try {
    const query = encodeURIComponent(`*[_type == "legalPage" && slug.current == "${props.slug}"][0]{ title, lastUpdated, body }`);
    const res = await fetch(`https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`);
    const json = await res.json();
    page.value = json.result || null;
  } catch (e) {
    console.error('Failed to fetch legal page:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="page px-6 py-16">
    <div v-if="loading" class="text-center py-24">
      <p class="text-[var(--color-text-secondary)] text-sm">Loading...</p>
    </div>

    <template v-else-if="page">
      <h1>{{ page.title }}</h1>
      <div class="legal-content">
        <p v-if="page.lastUpdated" class="mb-6"><strong>Last updated:</strong> {{ new Date(page.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        <PortableText v-if="page.body" :value="withHeadingOrder(page.body)" :components="richTextComponents" />
      </div>
    </template>

    <template v-else>
      <h1>{{ fallbackTitle }}</h1>
      <div class="legal-content">
        <p class="text-[var(--color-text-secondary)]">This page has not been set up yet. Please add content in the CMS.</p>
      </div>
    </template>
  </main>
</template>
