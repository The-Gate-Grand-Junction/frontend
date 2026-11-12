<script setup lang="ts">
import { computed } from 'vue';
import SmartLink from '@/components/ui/SmartLink.vue';
import { useFooter } from '@/composables/useFooter';
import FooterContact from '@/components/layout/footer-parts/FooterContact.vue';
import FooterCredit from '@/components/layout/footer-parts/FooterCredit.vue';
import FooterSocial from '@/components/layout/footer-parts/FooterSocial.vue';

// Columns (dark): call-to-action band, link columns from the Studio menus,
// and a Contact column with the social icons
const { site, columns, copyright, hasContact } = useFooter();
// Band: Site Settings → Header & footer → "Footer call to action". The button
// falls back to the header button when its own fields are blank.
const bandLabel = computed(() => site.ctaFooterLabel || site.ctaLabel);
const bandUrl = computed(() => site.ctaFooterUrl || site.ctaUrl);
const hasSocial = computed(() => site.socialLinks.length > 0);
</script>

<template>
  <footer class="site-footer">
    <section v-if="site.ctaHeadline" class="site-footer__band" aria-labelledby="footer-cta-heading">
      <h2 id="footer-cta-heading" class="site-footer__band-heading">{{ site.ctaHeadline }}</h2>
      <p v-if="site.ctaSubtext" class="site-footer__band-text">{{ site.ctaSubtext }}</p>
      <SmartLink v-if="bandLabel && bandUrl" :to="bandUrl" class="site-footer__band-button">{{ bandLabel }}</SmartLink>
    </section>
    <div class="site-footer__inner">
      <div class="site-footer__columns">
        <div v-for="col in columns" :key="col.title">
          <h2 class="site-footer__heading site-footer__heading--col">{{ col.title }}</h2>
          <ul class="site-footer__list">
            <li v-for="item in col.links" :key="item.to"><SmartLink :to="item.to" class="site-footer__link">{{ item.label }}</SmartLink></li>
          </ul>
        </div>
        <div v-if="hasContact || hasSocial">
          <h2 class="site-footer__heading site-footer__heading--col">Contact</h2>
          <FooterContact v-if="hasContact" />
          <FooterSocial v-if="hasSocial" circle class="site-footer__social" />
        </div>
      </div>
      <div class="site-footer__bottom">
        <p>{{ copyright }}</p>
        <FooterCredit />
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Charcoal band with a gold rule, set apart from the black page */
.site-footer {
  margin-top: auto;
  background-color: #1F1F1F;
  border-top: 1px solid #D3B063;
  color: #E5E5E5;
}

.site-footer__heading {
  font-family: var(--font-heading);
  color: #ffffff;
}

.site-footer__link {
  color: inherit;
  transition: color 0.2s ease;
}

.site-footer__link:hover {
  color: #D3B063;
  text-decoration: underline;
}

.site-footer__link:focus-visible {
  outline: 2px dashed #ffffff;
  outline-offset: 2px;
  border-radius: 2px;
}

.site-footer {
  --footer-rule: #333333;
}

/* Call-to-action band: the top of the footer, centred, with the gold button */
.site-footer__band {
  /* Same edges as the columns below (1200px less their 1.5rem gutters), so the rules line up */
  width: calc(100% - 3rem);
  max-width: calc(1200px - 3rem);
  margin: 0 auto;
  padding: 3rem 0;
  text-align: center;
  border-bottom: 1px solid var(--footer-rule);
}

.site-footer__band-heading {
  font-family: var(--font-heading);
  color: #ffffff;
  font-size: 2.25rem;
  line-height: 1.1;
  margin: 0 0 0.5rem;
}

.site-footer__band-text {
  margin: 0 auto 1.5rem;
  max-width: 36rem;
}

.site-footer__band-button {
  display: inline-block;
  padding: 0.75rem 1.75rem;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  border-radius: var(--border-radius);
  transition: filter 0.2s ease;
}

.site-footer__band-button:hover {
  color: var(--color-on-primary);
  text-decoration: none;
  filter: brightness(1.08);
}

.site-footer__band-button:focus-visible {
  outline: 3px dashed #ffffff;
  outline-offset: 3px;
}

.site-footer__social {
  margin-top: 1rem;
}

.site-footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem 2rem;
}

.site-footer__columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  gap: 2rem;
}

.site-footer__heading--col {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.875rem;
}

.site-footer__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.site-footer__bottom {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--footer-rule);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.site-footer__bottom p {
  margin: 0;
}
</style>
