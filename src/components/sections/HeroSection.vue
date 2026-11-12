<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSiteStore } from '@/stores/useSiteStore';
import SmartLink from '@/components/ui/SmartLink.vue';
import SiteAmbience from '@/components/layout/SiteAmbience.vue';
import { sanityImage } from '@/composables/useSanityImage';

// h1 when the hero opens the page (PageSections decides), h2 further down
const props = defineProps({ section: { type: Object, default: null }, headingLevel: { type: Number, default: 1 } });
const site = useSiteStore();
const heroRef = ref(null);

function onHeroMouseMove(e) {
  const rect = heroRef.value.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  heroRef.value.style.setProperty('--cursor-x', `${x}%`);
  heroRef.value.style.setProperty('--cursor-y', `${y}%`);
}

// A real <img> (not a CSS background) so the browser finds it in the HTML,
// fetches it first, and picks the size the screen needs
const HERO_WIDTHS = [640, 960, 1280, 1920, 2560];

// The URL applies the Studio crop; CSS object-fit: cover then trims the rest to
// fit the screen. Aim that trim at the hotspot, measured inside the crop.
function hotspotPosition(img) {
  const h = img?.hotspot;
  if (!h) return undefined;
  const c = { top: 0, bottom: 0, left: 0, right: 0, ...img.crop };
  const pct = (v, start, end) => Math.min(100, Math.max(0, ((v - start) / (1 - start - end)) * 100)).toFixed(1);
  return `${pct(h.x, c.left, c.right)}% ${pct(h.y, c.top, c.bottom)}%`;
}
const heroImage = computed(() => {
  const img = props.section?.image;
  if (!img) return null;
  const at = (w) => sanityImage(img).width(w).auto('format').quality(75).url();
  return {
    src: at(1280),
    srcset: HERO_WIDTHS.map((w) => `${at(w)} ${w}w`).join(', '),
    position: hotspotPosition(img),
  };
});

onMounted(() => { heroRef.value?.addEventListener('mousemove', onHeroMouseMove); });
onUnmounted(() => { heroRef.value?.removeEventListener('mousemove', onHeroMouseMove); });
</script>

<template>
  <section ref="heroRef" class="hero relative flex items-center justify-center min-h-[480px] px-6 py-24 overflow-hidden" :class="{ 'hero--image': heroImage, 'hero--opening': headingLevel === 1 }">
    <template v-if="heroImage">
      <img
        :src="heroImage.src"
        :srcset="heroImage.srcset"
        sizes="100vw"
        :alt="section?.imageAlt || ''"
        fetchpriority="high"
        decoding="async"
        class="hero__image"
        :style="heroImage.position ? { objectPosition: heroImage.position } : undefined"
      />
      <div class="hero__tint" aria-hidden="true"></div>
    </template>
    <SiteAmbience variant="hero" />
    <div class="relative z-10 text-center text-white max-w-3xl mx-auto">
      <component :is="`h${headingLevel}`" v-if="section?.title || site.name" class="text-5xl font-extrabold leading-tight mb-4">{{ section?.title || site.name }}</component>
      <p v-if="section?.subtitle || site.tagline" class="text-xl opacity-80 mb-8">{{ section?.subtitle || site.tagline }}</p>
      <SmartLink v-if="section?.cta?.label && section?.cta?.url" :to="section.cta.url" class="focus-ring-light inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-[#000000] transition-colors">{{ section.cta.label }}</SmartLink>
    </div>
  </section>
</template>

<style scoped>
.hero {
  --cursor-x: 50%;
  --cursor-y: 40%;
  /* Brand: black-to-charcoal with a soft gold glow that follows the cursor */
  background: radial-gradient(600px circle at var(--cursor-x) var(--cursor-y), color-mix(in srgb, var(--color-primary) 18%, transparent), transparent 60%), linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%);
  background-size: cover; background-position: center; will-change: background; transition: background 0.1s ease;
}
.hero__image {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
/* A neutral scrim under the brand tint keeps white titles readable over any
   photo; darker on phones, where the title covers more of the image. */
.hero__tint {
  --scrim: rgba(0, 0, 0, 0.25);
  position: absolute; inset: 0;
  background: linear-gradient(var(--scrim), var(--scrim)), radial-gradient(600px circle at var(--cursor-x) var(--cursor-y), color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 60%), linear-gradient(135deg, color-mix(in srgb, var(--color-bg) 70%, transparent) 0%, color-mix(in srgb, var(--color-surface) 55%, transparent) 100%);
}
@media (max-width: 640px) {
  .hero__tint { --scrim: rgba(0, 0, 0, 0.45); }
}
</style>
