<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import SmartLink from '@/components/ui/SmartLink.vue';
import type { NavItem } from '@/types/site';

// The phone menu's links for headers with submenus: a parent keeps its link,
// and its arrow button shows the submenu beneath it
defineProps<{ items: NavItem[] }>();

const expanded = ref<string | null>(null);
const toggle = (key: string) => (expanded.value = expanded.value === key ? null : key);
const subId = (to: string) => `mobile-sub${to.replace(/[^a-z0-9]+/gi, '-')}`;
</script>

<template>
  <ul class="mobile-nav">
    <li v-for="item in items" :key="item.to">
      <div class="mobile-nav__row">
        <SmartLink :to="item.to" class="mobile-nav__link">{{ item.label }}</SmartLink>
        <button
          v-if="item.children?.length"
          type="button"
          class="mobile-nav__toggle"
          :aria-expanded="expanded === item.to"
          :aria-controls="subId(item.to)"
          :aria-label="`${item.label}: more pages`"
          @click="toggle(item.to)"
        >
          <ChevronDown :size="18" :class="{ 'mobile-nav__chevron--open': expanded === item.to }" />
        </button>
      </div>
      <ul v-if="item.children?.length" v-show="expanded === item.to" :id="subId(item.to)" class="mobile-nav__sub">
        <li v-for="child in item.children" :key="child.to">
          <SmartLink :to="child.to" class="mobile-nav__link mobile-nav__link--sub">{{ child.label }}</SmartLink>
        </li>
      </ul>
    </li>
  </ul>
</template>

<style scoped>
.mobile-nav,
.mobile-nav__sub {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-nav__link {
  display: block;
  padding: 0.625rem 0;
  color: var(--color-text);
  font-weight: 500;
}

.mobile-nav__link:hover,
.mobile-nav__link.router-link-exact-active {
  color: var(--color-primary-ink);
}

.mobile-nav__sub {
  padding-left: 1rem;
  border-left: 2px solid var(--color-border);
  margin-bottom: 0.25rem;
}

.mobile-nav__link--sub {
  font-weight: 400;
  padding: 0.5rem 0;
}

.mobile-nav__toggle {
  display: flex;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  padding: 0.5rem;
  border-radius: var(--border-radius);
}

.mobile-nav__chevron--open {
  transform: rotate(180deg);
}

.mobile-nav__link:focus-visible,
.mobile-nav__toggle:focus-visible {
  outline: 3px dashed var(--color-primary-ink);
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
