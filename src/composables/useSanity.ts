import { computed, onMounted, onServerPrefetch, ref, type Ref } from 'vue'
import { useContentStore } from '@/stores/useContentStore'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01'

function buildUrl(query: string, params?: Record<string, unknown>): string {
  const base = `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`
  const url = new URL(base)
  url.searchParams.set('query', query)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(`$${key}`, JSON.stringify(value))
    }
  }
  return url.toString()
}

export async function sanityFetch<T>(query: string, params?: Record<string, unknown>): Promise<T | null> {
  const res = await fetch(buildUrl(query, params))
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`)
  const json = await res.json()
  return (json.result ?? null) as T | null
}

/** Queries already brought up to date in this browser visit (each is refetched at most once). */
const revalidated = new Set<string>()

/** After the page settles, so a refetch never competes with the hero image. */
const whenIdle = (task: () => void) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(task, { timeout: 3000 }) : setTimeout(task, 1500)

/**
 * Reactive Sanity query over the CDN API.
 *
 * - Prerendered (Growth) sites: fetched during the build in onServerPrefetch
 *   and baked into the HTML through the content store. In the browser the baked
 *   copy shows at once, then is refetched when idle and swapped in if a publish
 *   changed it, so visitors see the latest content between builds.
 * - Client-rendered sites: fetched on mount.
 *
 * `ready` resolves once the data is in, for code that must wait for it during
 * the prerender (watchers don't run there). Without VITE_SANITY_PROJECT_ID
 * nothing is fetched and the static defaults show.
 */
export function useSanity<T = unknown>(
  query: string,
  params?: Record<string, unknown>,
): { data: Ref<T | null>; loading: Ref<boolean>; error: Ref<string | null>; ready: Promise<void> } {
  const store = useContentStore()
  const key = `${query}::${JSON.stringify(params ?? {})}`
  const loading = ref(!store.has(key))
  const error = ref<string | null>(null)

  let markReady: () => void = () => {}
  const ready = new Promise<void>((resolve) => { markReady = resolve })

  async function load() {
    if (store.has(key)) {
      loading.value = false
      markReady()
      return
    }
    try {
      store.put(key, await sanityFetch<T>(query, params))
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
      markReady()
    }
  }

  async function revalidate() {
    try {
      const fresh = await sanityFetch<T>(query, params)
      // Keep the baked content on an empty answer; only a real change re-renders
      if (fresh !== null && JSON.stringify(fresh) !== JSON.stringify(store.cache[key])) store.put(key, fresh)
    } catch {
      // Offline or Sanity unreachable: the baked content stays
    }
  }

  if (!projectId) {
    loading.value = false
    markReady()
  } else {
    if (store.has(key)) markReady()
    onServerPrefetch(load)
    onMounted(() => {
      if (!store.has(key)) {
        void load()
        revalidated.add(key)
      } else if (!revalidated.has(key)) {
        revalidated.add(key)
        whenIdle(() => void revalidate())
      }
    })
  }

  const data = computed(() => (store.cache[key] ?? null) as T | null)
  return { data, loading, error, ready }
}
