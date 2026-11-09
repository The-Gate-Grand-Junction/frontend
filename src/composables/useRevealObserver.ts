import { onMounted, onUnmounted } from 'vue'

const SELECTOR = '.reveal, .reveal-stagger, .reveal-left, .reveal-right, .reveal-scale'

/**
 * Scroll reveal as progressive enhancement. Elements with a reveal class stay
 * visible unless they start below the fold: those get `.reveal-pending`
 * (hidden) and lose it as they enter the viewport. Above-the-fold content is
 * never hidden, so first paint and prerendered HTML show everything.
 *
 * Watches the DOM for sections that render later (CMS data, route changes).
 * Call once, in SiteLayout.
 */
export function useRevealObserver() {
  let observer: IntersectionObserver | null = null
  let mutations: MutationObserver | null = null
  let frame = 0
  const seen = new WeakSet<Element>()

  function scan() {
    frame = 0
    if (!observer) return
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (seen.has(el)) return
      seen.add(el)
      if (el.getBoundingClientRect().top < window.innerHeight) return
      el.classList.add('reveal-pending')
      observer!.observe(el)
    })
  }

  onMounted(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target
            el.classList.add('reveal-in')
            el.classList.remove('reveal-pending')
            observer!.unobserve(el)
            setTimeout(() => el.classList.remove('reveal-in'), 1200)
          }
        })
      },
      { threshold: 0.15 }
    )
    scan()
    mutations = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(scan)
    })
    mutations.observe(document.body, { childList: true, subtree: true })
  })

  onUnmounted(() => {
    observer?.disconnect()
    mutations?.disconnect()
    cancelAnimationFrame(frame)
  })
}
