import { createImageUrlBuilder } from '@sanity/image-url'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'

const builder = createImageUrlBuilder({ projectId, dataset })

/**
 * Returns a Sanity image URL builder for the given source.
 * Respects crop and hotspot metadata set in the Studio.
 *
 * Usage: sanityImage(source).width(80).height(80).url()
 */
export function sanityImage(source: unknown) {
  return builder.image(source as any)
}

/**
 * A plain Sanity asset URL (e.g. the logo from siteSettings) requested at the
 * size it's drawn, instead of the original upload. Pass about twice the CSS
 * height for sharp high-density screens. Non-Sanity URLs pass through.
 */
export function sizedImageUrl(url: string, height: number): string {
  if (!url || !url.startsWith('https://cdn.sanity.io/images/')) return url
  const sized = new URL(url)
  sized.searchParams.set('h', String(height))
  sized.searchParams.set('fit', 'max')
  sized.searchParams.set('auto', 'format')
  return sized.toString()
}

/**
 * Alt text for an image whose description is stored on the image itself
 * (Studio: "Description" + "Decorative only"). Decorative images get an empty
 * alt so screen readers skip them; otherwise the description, or a fallback
 * such as the person or company name shown with it.
 */
export function imageAlt(image: { alt?: string; decorative?: boolean } | null | undefined, fallback = ''): string {
  if (!image || image.decorative) return ''
  return image.alt?.trim() || fallback
}
