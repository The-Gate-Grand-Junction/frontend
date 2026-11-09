import { defineStore } from 'pinia'

/**
 * Sanity query results, keyed by query + params.
 *
 * On a prerendered (Growth) site, vite-ssg serialises this store into each
 * page's HTML and Pinia restores it in the browser, so content fetched at build
 * time is reused instead of refetched. On a client-rendered site it is just a
 * per-visit cache.
 */
export const useContentStore = defineStore('content', {
  state: () => ({
    cache: {} as Record<string, unknown>,
  }),
  actions: {
    has(key: string) {
      return Object.prototype.hasOwnProperty.call(this.cache, key)
    },
    put(key: string, value: unknown) {
      this.cache[key] = value
    },
  },
})
