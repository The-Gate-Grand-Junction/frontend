<script setup>
import { computed } from 'vue';
import { sanityImage, imageAlt } from '@/composables/useSanityImage';
const props = defineProps({ section: { type: Object, default: null } });
const members = computed(() => (props.section?.members || []).filter((m) => m?.name));

const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const firstName = (name) => name.split(/\s+/)[0];
</script>

<template>
  <section v-if="members.length" class="reveal py-16 px-6 bg-[var(--color-bg)]">
    <div class="max-w-6xl mx-auto">
      <div v-if="section?.heading || section?.intro" class="text-center max-w-2xl mx-auto mb-12">
        <h2 v-if="section?.heading" class="text-3xl font-bold text-[var(--color-text)] mb-3">{{ section.heading }}</h2>
        <p v-if="section?.intro" class="text-[var(--color-text-secondary)] leading-relaxed">{{ section.intro }}</p>
      </div>
      <ul class="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10" role="list">
        <li v-for="(m, i) in members" :key="m._key || i" class="text-center">
          <!-- The name is printed below, so a photo without its own description is decorative -->
          <img
            v-if="m.photo?.asset"
            :src="sanityImage(m.photo).width(320).height(320).fit('crop').auto('format').url()"
            :alt="imageAlt(m.photo)"
            width="160"
            height="160"
            loading="lazy"
            decoding="async"
            class="w-40 h-40 mx-auto rounded-full object-cover mb-4"
          />
          <div
            v-else
            aria-hidden="true"
            class="w-40 h-40 mx-auto rounded-full mb-4 flex items-center justify-center text-4xl font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]"
          >{{ initials(m.name) }}</div>
          <h3 class="text-lg font-semibold text-[var(--color-text)]">{{ m.name }}</h3>
          <p v-if="m.role" class="text-sm font-medium text-[var(--color-primary-ink)] mb-2">{{ m.role }}</p>
          <p v-if="m.bio" class="text-sm text-[var(--color-text-secondary)] leading-relaxed">{{ m.bio }}</p>
          <a v-if="m.email" :href="`mailto:${m.email}`" class="focus-ring inline-block mt-3 text-sm font-medium text-[var(--color-primary-ink)] underline rounded">Email {{ firstName(m.name) }}</a>
        </li>
      </ul>
    </div>
  </section>
</template>
