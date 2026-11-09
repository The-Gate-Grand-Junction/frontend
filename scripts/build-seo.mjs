// Runs after `vite build`: writes dist/sitemap.xml and dist/robots.txt.
// - routes come from seo-routes.json (written by the scaffolder, extended by
//   extend mode) plus Sanity detail pages; lastmod is each document's _updatedAt
// - on deploy previews and branch deploys robots.txt disallows everything
//   (useSeo also adds noindex on *.netlify.app hosts)
import fs from 'node:fs'
import { loadEnv } from 'vite'
import { staticRoutes, dynamicRoutes } from './prerender-routes.mjs'

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env }
const siteUrl = (env.VITE_SITE_URL || env.URL || '').replace(/\/$/, '')
const isProduction = !env.CONTEXT || env.CONTEXT === 'production'

async function lastModified() {
  const projectId = env.VITE_SANITY_PROJECT_ID
  if (!projectId) return {}
  const dataset = env.VITE_SANITY_DATASET || 'production'
  const query = '*[_type in ["page", "legalPage"] && defined(slug.current)]{ "slug": slug.current, _updatedAt }'
  const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { result = [] } = await res.json()
    return Object.fromEntries(result.map((d) => [d.slug.startsWith('/') ? d.slug : `/${d.slug}`, d._updatedAt.slice(0, 10)]))
  } catch (err) {
    console.warn(`build-seo: no lastmod dates (${err.message})`)
    return {}
  }
}

const robots = isProduction
  ? `User-agent: *\nAllow: /\nDisallow: /.netlify/\n${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ''}`
  : 'User-agent: *\nDisallow: /\n'
fs.writeFileSync('dist/robots.txt', robots)

if (!siteUrl) {
  console.warn('build-seo: VITE_SITE_URL is not set, so no sitemap.xml was written')
} else {
  const dates = await lastModified()
  let detail = []
  try {
    detail = await dynamicRoutes(env)
  } catch (err) {
    console.warn(`build-seo: no detail pages in the sitemap (${err.message})`)
  }
  for (const d of detail) dates[d.route] = d.lastmod
  const routes = [...new Set([...staticRoutes(), ...detail.map((d) => d.route)])]
  const urls = routes.map((route) => {
    const lastmod = dates[route] ? `\n    <lastmod>${dates[route]}</lastmod>` : ''
    return `  <url>\n    <loc>${siteUrl}${route === '/' ? '/' : route}</loc>${lastmod}\n  </url>`
  })
  fs.writeFileSync(
    'dist/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
  )
  console.log(`build-seo: sitemap.xml with ${routes.length} URL(s); robots.txt ${isProduction ? 'allows' : 'blocks'} crawling`)
}
