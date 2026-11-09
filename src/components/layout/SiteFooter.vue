<script setup lang="ts">
import SmartLink from '@/components/ui/SmartLink.vue';
import { useFooter } from '@/composables/useFooter';
import FooterContact from '@/components/layout/footer-parts/FooterContact.vue';
import FooterCredit from '@/components/layout/footer-parts/FooterCredit.vue';

// Columns (dark): link columns from the Studio menus and a Contact column
const { columns, copyright, hasContact } = useFooter();
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__columns">
        <div v-for="col in columns" :key="col.title">
          <h2 class="site-footer__heading site-footer__heading--col">{{ col.title }}</h2>
          <ul class="site-footer__list">
            <li v-for="item in col.links" :key="item.to"><SmartLink :to="item.to" class="site-footer__link">{{ item.label }}</SmartLink></li>
          </ul>
        </div>
        <div v-if="hasContact">
          <h2 class="site-footer__heading site-footer__heading--col">Contact</h2>
          <FooterContact />
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
/* A dark band in both themes, like the default footer's call to action */
.site-footer {
  margin-top: auto;
  background-color: #111827;
  color: #d1d5db;
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
  color: #ffffff;
  text-decoration: underline;
}

.site-footer__link:focus-visible {
  outline: 2px dashed #ffffff;
  outline-offset: 2px;
  border-radius: 2px;
}

.site-footer {
  --footer-rule: #374151;
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
