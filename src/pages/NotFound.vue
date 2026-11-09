<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <main class="page px-6 py-24">
    <div class="max-w-xl mx-auto text-center">
      <p class="text-6xl font-extrabold text-[var(--color-primary-ink)] mb-4">404</p>
      <h1 class="text-3xl font-bold text-[var(--color-text)] mb-4" style="font-family: var(--font-heading)">Page not found</h1>
      <p class="text-[var(--color-text-secondary)] text-base mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <RouterLink to="/" class="focus-ring inline-block text-[var(--color-on-primary)] font-semibold px-8 py-3 rounded-lg transition-colors hover:opacity-90" style="background-color: var(--color-primary)">Back to Home</RouterLink>
    </div>
  </main>
</template>
