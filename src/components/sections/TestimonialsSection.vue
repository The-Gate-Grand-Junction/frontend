<script setup>
import { computed } from 'vue';
import { sanityImage } from '@/composables/useSanityImage';
const props = defineProps({ section: { type: Object, default: null } });
const testimonials = computed(() => props.section?.items || []);
</script>

<template>
  <section v-if="testimonials.length" class="reveal py-16 px-6 bg-[var(--color-bg)]">
    <div class="max-w-5xl mx-auto">
      <div v-if="section?.heading" class="text-center mb-12">
        <h2 class="text-3xl font-bold text-[var(--color-text)]">{{ section.heading }}</h2>
      </div>
      <div class="reveal-stagger grid grid-cols-1 gap-6 justify-center" :style="{ '--testimonial-cols': Math.min(testimonials.length, 3) }">
        <div v-for="(t, i) in testimonials" :key="i" class="flex flex-col bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
          <div class="flex gap-0.5 mb-4">
            <span v-for="n in (t.rating ?? 5)" :key="n" class="text-amber-400 text-sm">★</span>
          </div>
          <p class="text-[var(--color-text-secondary)] text-sm leading-relaxed flex-1 mb-6">"{{ t.quote }}"</p>
          <div class="flex items-center gap-3">
            <img v-if="t.photo" :src="sanityImage(t.photo).width(80).height(80).fit('crop').url()" :alt="t.author || t.name" loading="lazy" class="w-10 h-10 rounded-full object-cover shrink-0" />
            <div v-else class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style="background-color: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary-ink)" role="img" :aria-label="`${t.author || t.name} avatar`">{{ (t.author || t.name).charAt(0) }}</div>
            <div>
              <p class="font-semibold text-[var(--color-text)] text-sm">{{ t.author || t.name }}</p>
              <p v-if="t.role || t.title" class="text-[var(--color-text-secondary)] text-[0.8125rem]">{{ t.role || t.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (min-width: 768px) {
  .reveal-stagger[style*="--testimonial-cols"] {
    grid-template-columns: repeat(var(--testimonial-cols, 3), minmax(0, 1fr));
    max-width: calc(var(--testimonial-cols) * 22rem);
    margin-left: auto; margin-right: auto;
  }
}
</style>
