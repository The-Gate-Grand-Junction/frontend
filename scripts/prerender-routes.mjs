// Which routes exist, for the prerender (Growth) and the sitemap (every tier).
// Runs in Node: reads process.env, which vite.config and build-seo fill from .env.
import fs from 'node:fs'

const routeFile = new URL('../seo-routes.json', import.meta.url)

/** Public static routes, from seo-routes.json (scaffolded; extend mode adds to it). */
export function staticRoutes() {
  return JSON.parse(fs.readFileSync(routeFile, 'utf-8')).routes ?? []
}

// Detail pages that only exist because a document does, e.g.
// { "type": "caseStudy", "prefix": "/portfolio/" } (seo-routes.json, from the sections the site uses)
const detailPages = () => JSON.parse(fs.readFileSync(routeFile, 'utf-8')).detailPages ?? []

/** Detail routes from Sanity, with lastmod dates. Empty when Sanity isn't configured. */
export async function dynamicRoutes(env = process.env) {
  const DYNAMIC = detailPages()
  const projectId = env.VITE_SANITY_PROJECT_ID
  if (!projectId || !DYNAMIC.length) return []
  const dataset = env.VITE_SANITY_DATASET || 'production'
  const query = `*[_type in [${DYNAMIC.map((d) => `"${d.type}"`).join(', ')}] && defined(slug.current)]{ _type, "slug": slug.current, _updatedAt }`
  const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sanity query for detail pages failed: HTTP ${res.status}`)
  const { result = [] } = await res.json()
  return result.map((doc) => ({
    route: `${DYNAMIC.find((d) => d.type === doc._type).prefix}${doc.slug}`,
    lastmod: doc._updatedAt.slice(0, 10),
  }))
}

/** vite-ssg includedRoutes: the public pages, their detail pages, and /404 (written as 404.html). */
export async function getPrerenderRoutes() {
  const detail = await dynamicRoutes()
  return [...new Set([...staticRoutes(), ...detail.map((d) => d.route), '/404'])]
}
