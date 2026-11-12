<script setup>
import { computed } from 'vue';
import { PortableText } from '@portabletext/vue';
import { Calendar, Clock, Users, Heart, Info } from 'lucide-vue-next';
import { richTextComponents, withHeadingOrder } from '@/lib/richText';

const props = defineProps({ section: { type: Object, default: null } });

// Studio → Text Content → Style: plain, intro (larger first paragraph) or
// highlight (a boxed panel for key details such as meeting times)
const ICONS = { calendar: Calendar, clock: Clock, users: Users, heart: Heart, info: Info };
const style = computed(() => props.section?.style || 'plain');
const icon = computed(() => (style.value === 'highlight' ? ICONS[props.section?.icon] : null));
</script>

<template>
  <section
    v-if="section?.heading || section?.body"
    class="px-6 bg-[var(--color-bg)]"
    :class="style === 'highlight' ? 'py-6 last:pb-16' : 'py-14'"
  >
    <div class="max-w-3xl mx-auto" :class="{ 'info-panel': style === 'highlight' }">
      <template v-if="section?.heading">
        <div v-if="style === 'highlight'" class="info-panel__heading">
          <component :is="icon" v-if="icon" class="info-panel__icon" :size="28" aria-hidden="true" />
          <h2 class="section-heading section-heading--panel">{{ section.heading }}</h2>
        </div>
        <template v-else>
          <span class="section-rule" aria-hidden="true"></span>
          <h2 class="section-heading">{{ section.heading }}</h2>
        </template>
      </template>
      <div
        v-if="section?.body"
        class="legal-content text-[var(--color-text-secondary)]"
        :class="{ 'text-lead': style === 'intro' }"
      >
        <PortableText :value="withHeadingOrder(section.body, section.heading ? 3 : 2)" :components="richTextComponents" />
      </div>
    </div>
  </section>
</template>
