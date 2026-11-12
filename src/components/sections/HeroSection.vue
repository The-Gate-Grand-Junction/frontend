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
  <section ref="heroRef" class="hero relative flex items-center justify-center px-6 py-24 overflow-hidden" :class="{ 'hero--image': heroImage, 'hero--opening': headingLevel === 1 }">
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
    <SiteAmbience v-if="!heroImage" variant="hero" />
    <div class="hero__content relative z-10 text-center text-white max-w-3xl mx-auto">
      <p v-if="section?.eyebrow" class="hero__eyebrow">{{ section.eyebrow }}</p>
      <component :is="`h${headingLevel}`" v-if="section?.title || site.name" class="hero__title">{{ section?.title || site.name }}</component>
      <span class="hero__rule" aria-hidden="true"></span>
      <p v-if="section?.subtitle || site.tagline" class="hero__subtitle">{{ section?.subtitle || site.tagline }}</p>
      <SmartLink v-if="section?.cta?.label && section?.cta?.url" :to="section.cta.url" class="hero__cta">{{ section.cta.label }}</SmartLink>
    </div>
  </section>
</template>

<style scoped>
.hero {
  /* Most of the first screen, so the photo has room; never cramped on short screens */
  min-height: max(520px, min(80vh, 780px));
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
  --scrim: rgba(0, 0, 0, 0.35);
  position: absolute; inset: 0;
  background:
    /* fade into the black page below */
    linear-gradient(to bottom, transparent 55%, var(--color-bg) 100%),
    /* darker edges, open centre */
    radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.45) 100%),
    linear-gradient(var(--scrim), var(--scrim)),
    radial-gradient(600px circle at var(--cursor-x) var(--cursor-y), color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 60%);
}
@media (max-width: 640px) {
  .hero__tint { --scrim: rgba(0, 0, 0, 0.5); }
}

.hero__content { isolation: isolate; }
/* A soft shadow just behind the words, so they stay readable over the bright
   sun without dimming the whole photo */
.hero--image .hero__content::before {
  content: '';
  position: absolute; inset: -4rem -6rem;
  z-index: -1;
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.35) 60%, transparent);
  pointer-events: none;
}
.hero__eyebrow {
  margin: 0 0 0.75rem;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
/* Bebas is narrow, so it needs real size to carry the screen */
.hero__title {
  margin: 0;
  font-size: clamp(4rem, 12vw, 9.5rem);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.45);
}
.hero__rule {
  display: block;
  width: 4.5rem;
  height: 3px;
  margin: 1.5rem auto;
  background-color: var(--color-primary);
}
.hero__subtitle {
  margin: 0 auto 2.25rem;
  max-width: 36rem;
  font-size: clamp(1.125rem, 2vw, 1.3125rem);
  line-height: 1.5;
  text-wrap: balance;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.6);
}
/* Same square gold button as the header */
.hero__cta {
  display: inline-block;
  padding: 0.95rem 2.25rem;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  letter-spacing: 0.04em;
  border-radius: var(--border-radius);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
  transition: filter 0.2s ease, transform 0.2s ease;
}
.hero__cta:hover {
  color: var(--color-on-primary);
  text-decoration: none;
  filter: brightness(1.08);
  transform: translateY(-1px);
}
.hero__cta:focus-visible {
  outline: 3px dashed #ffffff;
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .hero__cta { transition: none; }
  .hero__cta:hover { transform: none; }
}
</style>
