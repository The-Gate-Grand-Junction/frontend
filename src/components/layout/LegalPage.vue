<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { PortableText } from '@portabletext/vue';
import { richTextComponents, withHeadingOrder } from '@/lib/richText';

const props = defineProps({
  // Optional: the routes don't pass one, so the page address is used. Studio
  // stores legal slugs with the leading slash ("/privacy-policy"), like the path.
  slug: { type: String, default: '' },
  fallbackTitle: { type: String, default: '' },
});
const route = useRoute();
const slug = computed(() => props.slug || route.path);

const page = ref(null);
const loading = ref(true);

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

// Re-runs on navigation: the three legal routes share this component, so Vue
// reuses it when moving between them instead of mounting it again
async function load(current) {
  loading.value = true;
  page.value = null;
  if (!projectId) { loading.value = false; return; }
  try {
    const query = encodeURIComponent(`*[_type == "legalPage" && slug.current == "${current}"][0]{ title, lastUpdated, body }`);
    const res = await fetch(`https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`);
    const json = await res.json();
    page.value = json.result || null;
  } catch (e) {
    console.error('Failed to fetch legal page:', e);
  } finally {
    loading.value = false;
  }
}
watch(slug, load, { immediate: true });
</script>

<template>
  <main class="page px-6 py-16">
    <div v-if="loading" class="text-center py-24">
      <p class="text-[var(--color-text-secondary)] text-sm">Loading...</p>
    </div>

    <template v-else-if="page">
      <h1>{{ page.title }}</h1>
      <div class="legal-content">
        <p v-if="page.lastUpdated" class="mb-6"><strong>Last updated:</strong> {{ new Date(page.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) }}</p>
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
