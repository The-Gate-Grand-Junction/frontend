import type { Component } from 'vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import FeatureGrid from '@/components/sections/FeatureGrid.vue'
import TestimonialsSection from '@/components/sections/TestimonialsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import TextContent from '@/components/sections/TextContent.vue'
import TeamSection from '@/components/sections/TeamSection.vue'
import MapSection from '@/components/sections/MapSection.vue'
import DonationSection from '@/components/sections/DonationSection.vue'

/** Maps section _type (from Sanity) to Vue components: the sections this site uses */
export const sectionMap: Record<string, Component> = {
  heroSection: HeroSection,
  featureGrid: FeatureGrid,
  testimonialsSection: TestimonialsSection,
  contactSection: ContactSection,
  textContent: TextContent,
  teamSection: TeamSection,
  mapSection: MapSection,
  donationSection: DonationSection,
}

/** GROQ query: the page and its sections, with each Form section's form and Event Registration section's event expanded */
export const pageQuery = (slug: string) =>
  `*[_type == "page" && slug.current == "${slug}"][0]{ title, "slug": slug.current, seoTitle, seoDescription, "shareImage": shareImage{ asset, crop, hotspot }, sections[]{ ..., _type == "formSection" => { "form": form->{ _id, title, "slug": slug.current, active, description, fields, successMessage, spamProtection } }, _type == "eventRegistrationSection" => { "event": event->{ _id, title, startDate, endDate, location, "registration": registration{ enabled, capacity, maxPartySize, closingDate } } } } }`
