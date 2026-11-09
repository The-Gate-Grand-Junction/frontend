<template>
  <!-- Hero ambience layer — sits behind hero content -->
  <div
    v-if="variant === 'hero'"
    class="ambience-hero"
    aria-hidden="true"
  >
    <svg class="ambience-shape" width="100%" height="100%" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true">
      <g transform="rotate(-45.2 720 300)">
        <line x1="1100" y1="-20" x2="800" y2="620" stroke="white" stroke-width="1" opacity="0.078" />
        <line x1="1128" y1="-20" x2="828" y2="620" stroke="white" stroke-width="1" opacity="0.078" />
        <line x1="1156" y1="-20" x2="856" y2="620" stroke="white" stroke-width="1" opacity="0.078" />
        <line x1="1184" y1="-20" x2="884" y2="620" stroke="white" stroke-width="1" opacity="0.078" />
        <line x1="1212" y1="-20" x2="912" y2="620" stroke="white" stroke-width="1" opacity="0.078" />
        <line x1="208" y1="-20" x2="8" y2="620" stroke="white" stroke-width="0.75" opacity="0.055" />
        <line x1="236" y1="-20" x2="36" y2="620" stroke="white" stroke-width="0.75" opacity="0.055" />
        <line x1="264" y1="-20" x2="64" y2="620" stroke="white" stroke-width="0.75" opacity="0.055" />
      </g>
    </svg>
  </div>

  <!-- CTA ambience layer — corner accents on CTA blocks -->
  <div
    v-else-if="variant === 'cta'"
    class="ambience-cta"
    aria-hidden="true"
  >
    <svg class="ambience-shape" width="100%" height="100%" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true">
      <g transform="rotate(-45.2 1240 100)">
        <line x1="1200" y1="-10" x2="1100" y2="210" stroke="white" stroke-width="1" opacity="0.062" />
        <line x1="1228" y1="-10" x2="1128" y2="210" stroke="white" stroke-width="1" opacity="0.062" />
        <line x1="1256" y1="-10" x2="1156" y2="210" stroke="white" stroke-width="1" opacity="0.062" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{ variant: 'hero' | 'cta' }>()
</script>

<style scoped>
@keyframes ambienceFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
.ambience-shape {
  animation: ambienceFloat 16s ease-in-out infinite;
  will-change: transform;
}
.ambience-shape:nth-child(2) {
  animation-delay: -6s;
}

.ambience-hero {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.ambience-cta {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
</style>
