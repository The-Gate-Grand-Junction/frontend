<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { useSiteStore } from '@/stores/useSiteStore';
defineProps({ section: { type: Object, default: null } });
const site = useSiteStore();
const contactForm = ref({ name: '', email: '', message: '', website: '' });
const contactSent = ref(false);
const contactError = ref('');
const submitting = ref(false);
const errorEl = ref(null);
// Signed when the form appears and checked on submit (netlify/lib/formGuard.ts)
let token = null;

const ENDPOINT = '/api/send-message';

async function fetchToken() {
  try {
    const res = await fetch(ENDPOINT, { cache: 'no-store' });
    token = res.ok ? (await res.json()).token : null;
  } catch {
    token = null;
  }
}

onMounted(fetchToken);

async function showError(message) {
  contactError.value = message;
  await nextTick();
  errorEl.value?.focus();
}

async function sendContact() {
  const { name, email, message, website } = contactForm.value;
  if (!name || !email || !message) {
    await showError('Please fill out all fields.');
    return;
  }
  contactError.value = '';
  submitting.value = true;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, website, token }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) throw new Error('Too many attempts. Please wait a minute and try again.');
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    contactSent.value = true;
  } catch (err) {
    // A fresh token, so the next attempt isn't refused as expired
    void fetchToken();
    await showError(err instanceof Error ? err.message : 'Failed to send. Please try again.');
  } finally {
    submitting.value = false;
  }
}

function formatPhone(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 11 && digits[0] === '1') return formatPhone(digits.slice(1));
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw;
}
</script>

<template>
  <section class="py-16 px-6 bg-[var(--color-bg)]">
    <div class="max-w-5xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="space-y-6">
          <div>
            <h2 v-if="section?.heading" class="text-3xl font-bold text-[var(--color-text)] mb-4 leading-tight">{{ section.heading }}</h2>
            <p v-if="section?.preferenceNotes" class="text-[var(--color-text-secondary)] text-base leading-relaxed">{{ section.preferenceNotes }}</p>
          </div>
          <div v-if="section?.email || site.contactEmail">
            <p class="text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">Email</p>
            <a :href="'mailto:' + (section?.email || site.contactEmail)" class="text-sm font-medium text-[var(--color-primary-ink)] hover:underline transition-colors rounded focus-ring">{{ section?.email || site.contactEmail }}</a>
          </div>
          <div v-if="section?.showPhone !== false && (section?.phone || site.contactPhone)">
            <p class="text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">Phone</p>
            <a :href="'tel:' + (section?.phone || site.contactPhone)" class="text-sm font-medium text-[var(--color-primary-ink)] hover:underline rounded focus-ring">{{ formatPhone(section?.phone || site.contactPhone) }}</a>
          </div>
          <div v-if="section?.address">
            <p class="text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">Address</p>
            <address class="not-italic text-sm text-[var(--color-text)] whitespace-pre-line">{{ section.address }}</address>
          </div>
          <div v-if="section?.hours">
            <p class="text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">Hours</p>
            <p class="text-sm text-[var(--color-text)] whitespace-pre-line">{{ section.hours }}</p>
          </div>
          <div v-if="section?.responseTime" class="flex items-start gap-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
            <span class="text-lg leading-none mt-0.5">⏱</span>
            <p class="text-sm text-[var(--color-text-secondary)]">{{ section.responseTime }}</p>
          </div>
        </div>
        <div v-if="!contactSent" class="bg-[var(--color-bg)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm space-y-4">
          <h3 class="text-lg font-semibold text-[var(--color-text)]">Send a Message</h3>
          <div>
            <label for="contact-name" class="block text-[0.8125rem] font-medium text-[var(--color-text-secondary)] mb-1">Full Name <span class="text-red-400" aria-hidden="true">*</span></label>
            <input id="contact-name" v-model="contactForm.name" type="text" autocomplete="name" placeholder="Your name" aria-required="true" :aria-describedby="contactError ? 'contact-error' : undefined" class="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text)] bg-[var(--color-bg)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] hover:border-[var(--color-primary)]" />
          </div>
          <div>
            <label for="contact-email" class="block text-[0.8125rem] font-medium text-[var(--color-text-secondary)] mb-1">Email <span class="text-red-400" aria-hidden="true">*</span></label>
            <input id="contact-email" v-model="contactForm.email" type="email" autocomplete="email" placeholder="your@email.com" aria-required="true" :aria-describedby="contactError ? 'contact-error' : undefined" class="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text)] bg-[var(--color-bg)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] hover:border-[var(--color-primary)]" />
          </div>
          <div>
            <label for="contact-message" class="block text-[0.8125rem] font-medium text-[var(--color-text-secondary)] mb-1">Message <span class="text-red-400" aria-hidden="true">*</span></label>
            <textarea id="contact-message" v-model="contactForm.message" rows="4" placeholder="How can we help?" aria-required="true" :aria-describedby="contactError ? 'contact-error' : undefined" class="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text)] bg-[var(--color-bg)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] hover:border-[var(--color-primary)] resize-none"></textarea>
          </div>
          <!-- Honeypot: hidden from people and screen readers; bots that fill it are dropped -->
          <div class="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
            <label for="contact-website">Website</label>
            <input id="contact-website" v-model="contactForm.website" type="text" name="website" tabindex="-1" autocomplete="off" />
          </div>
          <p v-if="contactError" id="contact-error" ref="errorEl" role="alert" tabindex="-1" class="text-red-500 text-sm focus:outline-none">{{ contactError }}</p>
          <button @click="sendContact" :disabled="submitting" class="w-full py-3 text-[var(--color-on-primary)] font-semibold rounded-xl text-sm transition-colors cursor-pointer hover:opacity-90 focus-ring disabled:opacity-50 disabled:cursor-not-allowed" style="background-color: var(--color-primary)">{{ submitting ? 'Sending...' : 'Start the Conversation →' }}</button>
        </div>
        <div v-else class="bg-[var(--color-bg)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm flex items-center justify-center min-h-70">
          <div class="text-center">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style="background-color: color-mix(in srgb, var(--color-primary) 10%, transparent)"><span class="text-xl">✓</span></div>
            <p class="font-semibold text-[var(--color-text)] mb-1">Message sent!</p>
            <p class="text-[var(--color-text-secondary)] text-sm">We'll be in touch shortly.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
