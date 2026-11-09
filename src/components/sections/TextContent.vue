<script setup>
import { PortableText } from '@portabletext/vue';
import { richTextComponents, withHeadingOrder } from '@/lib/richText';
defineProps({ section: { type: Object, default: null } });
</script>

<template>
  <section v-if="section?.heading || section?.body" class="py-16 px-6 bg-[var(--color-bg)]">
    <div class="max-w-3xl mx-auto">
      <h2 v-if="section?.heading" class="text-3xl font-bold text-[var(--color-text)] mb-6">{{ section.heading }}</h2>
      <div v-if="section?.body" class="legal-content text-[var(--color-text-secondary)]">
        <PortableText :value="withHeadingOrder(section.body, section.heading ? 3 : 2)" :components="richTextComponents" />
      </div>
    </div>
  </section>
</template>
