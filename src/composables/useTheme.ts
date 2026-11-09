import { onMounted, ref } from 'vue';

type Theme = 'light' | 'dark';

// One shared value. It starts 'light' so the prerendered HTML and the first
// client render agree (no hydration mismatch); the real theme, already applied
// by the inline script in index.html, is read once mounted.
const theme = ref<Theme>('light');

/** Two-state toggle: the system preference sets the start, a click is remembered. */
export function useTheme() {
  onMounted(() => {
    theme.value = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  });

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme.value);
    try {
      localStorage.setItem('theme', theme.value);
    } catch {
      /* storage blocked: the choice lasts for this page only */
    }
  }

  return { theme, toggle };
}
