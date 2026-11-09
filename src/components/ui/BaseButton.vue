<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}>(), {
  variant: 'primary',
  size: 'md',
});
</script>

<template>
  <button class="btn" :class="[`btn--${variant}`, `btn--${size}`]">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn--sm { padding: 0.375rem 0.875rem; font-size: 0.8125rem; }
.btn--md { padding: 0.625rem 1.25rem; font-size: 0.9375rem; }
.btn--lg { padding: 0.75rem 1.75rem; font-size: 1.0625rem; }

.btn--primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}
.btn--primary:hover {
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
}

.btn--secondary {
  background-color: var(--color-secondary);
  color: var(--color-text-inverse);
  border-color: var(--color-secondary);
}
.btn--secondary:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn--outline {
  background-color: transparent;
  color: var(--color-primary-ink);
  border-color: var(--color-primary);
}
.btn--outline:hover {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}
</style>
