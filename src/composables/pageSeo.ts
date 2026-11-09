import { onServerPrefetch, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'

interface PageSeoFields {
  seoTitle?: string
  seoDescription?: string
  shareImage?: string
}

/**
 * The current page's own search copy from Studio (Search & Social); useSeo
 * prefers it. A Pinia store rather than module state, so prerendering several
 * routes never mixes one page's tags into another.
 */
export const usePageSeoStore = defineStore('pageSeo', {
  state: () => ({
    path: '',
    title: undefined as string | undefined,
    description: undefined as string | undefined,
    image: undefined as string | undefined,
  }),
})

/** Call in a page with its fetched Sanity document (and the query's `ready` when prerendering). */
export function usePageSeo(page: Ref<PageSeoFields | null>, ready?: Promise<void>) {
  const route = useRoute()
  const store = usePageSeoStore()
  const apply = (doc: PageSeoFields | null) => {
    store.$patch({
      path: route.path,
      title: doc?.seoTitle || undefined,
      description: doc?.seoDescription || undefined,
      // Share previews are 1200×630; crop around the hotspot
      image: doc?.shareImage ? `${doc.shareImage}?w=1200&h=630&fit=crop&auto=format` : undefined,
    })
  }
  watch(page, apply, { immediate: true })
  // Watchers don't run during the prerender: wait for the data, then set the tags
  if (ready) onServerPrefetch(async () => { await ready; apply(page.value) })
}
