<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId } from 'vue';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-vue-next';

// Donations through Stripe Checkout on the organization's own account,
// one-time or monthly. Stripe takes the card; donation-webhook.ts sends the
// receipt and files the gift once it's paid.
const props = defineProps<{
  section: {
    heading?: string;
    intro?: string;
    amounts?: number[];
    defaultAmount?: number;
    allowMonthly?: boolean;
    buttonLabel?: string;
    note?: string;
    thankYouMessage?: string;
  } | null;
}>();

const ENDPOINT = '/api/donate';
const uid = `dn${useId()}`;

const amounts = computed(() => {
  const list = (props.section?.amounts ?? []).filter((n) => Number.isInteger(n) && n > 0);
  return list.length ? list : [25, 50, 100, 250];
});
const allowMonthly = computed(() => props.section?.allowMonthly !== false);

// The editor's pick when it's one of the buttons, else the second (a middling gift)
const startAt = amounts.value.find((n) => n === props.section?.defaultAmount) ?? amounts.value[1] ?? amounts.value[0] ?? 'other';
const choice = ref<number | 'other'>(startAt);
const other = ref('');
const monthly = ref(false);
const honeypot = ref('');
const token = ref('');
const limits = ref({ min: 5, max: 10_000 });
const status = ref<'idle' | 'submitting' | 'thanks' | 'error'>('idle');
const error = ref('');
const errorEl = ref<HTMLElement | null>(null);
const otherEl = ref<HTMLInputElement | null>(null);

const dollars = computed(() => (choice.value === 'other' ? Number(other.value.replace(/[$,\s]/g, '')) : choice.value));
const money = (n: number) => `$${n.toLocaleString('en-US')}`;
const buttonText = computed(() => {
  if (status.value === 'submitting') return 'Opening secure checkout…';
  if (props.section?.buttonLabel) return props.section.buttonLabel;
  const amount = Number.isInteger(dollars.value) && dollars.value > 0 ? ` ${money(dollars.value)}` : '';
  return monthly.value ? `Give${amount} monthly` : `Give${amount}`;
});

async function fetchToken() {
  try {
    const res = await fetch(ENDPOINT, { cache: 'no-store' });
    const data = res.ok ? await res.json() : {};
    token.value = data.token ?? '';
    if (data.min && data.max) limits.value = { min: data.min, max: data.max };
  } catch {
    token.value = '';
  }
}

onMounted(() => {
  // Back from Stripe after giving
  const url = new URL(window.location.href);
  if (url.searchParams.get('donation') === 'thanks') {
    status.value = 'thanks';
    url.searchParams.delete('donation');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    return;
  }
  fetchToken();
});

async function pickOther() {
  choice.value = 'other';
  await nextTick();
  otherEl.value?.focus();
}

async function onSubmit() {
  if (status.value === 'submitting') return;
  error.value = '';
  const n = dollars.value;
  if (!Number.isInteger(n) || n < limits.value.min || n > limits.value.max) {
    error.value = `Please enter a whole-dollar amount from ${money(limits.value.min)} to ${money(limits.value.max)}.`;
  } else {
    status.value = 'submitting';
    try {
      if (!token.value) await fetchToken();
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: n, monthly: monthly.value, pagePath: window.location.pathname, token: token.value, website: honeypot.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Something went wrong. Please try again.');
      window.location.assign(data.url);
      return;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      void fetchToken();
    }
  }
  status.value = 'error';
  await nextTick();
  errorEl.value?.focus();
}

const pill =
  'focus-ring cursor-pointer rounded-lg border px-4 py-2.5 text-center font-semibold transition-colors border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)] has-[:checked]:text-[var(--color-on-primary)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-dashed has-[:focus-visible]:outline-[var(--color-primary-ink)] has-[:focus-visible]:outline-offset-2';
</script>

<template>
  <section class="reveal py-16 px-6 bg-[var(--color-surface)]">
    <div class="mx-auto max-w-xl">
      <h2 class="text-center text-3xl font-bold text-[var(--color-text)]">{{ section?.heading || 'Support our work' }}</h2>
      <p v-if="section?.intro" class="mt-3 text-center text-[var(--color-text-secondary)] whitespace-pre-line">{{ section.intro }}</p>

      <p v-if="status === 'thanks'" role="status" class="mt-8 flex items-start justify-center gap-2 text-center font-medium text-[var(--color-text)]">
        <CheckCircle2 :size="20" class="form-ok mt-0.5 shrink-0" aria-hidden="true" />
        {{ section?.thankYouMessage || 'Thank you for your gift! A receipt is on its way to your email.' }}
      </p>

      <form v-else class="mt-8" novalidate @submit.prevent="onSubmit">
        <div class="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
          <label :for="`${uid}-website`">Do not fill this out</label>
          <input :id="`${uid}-website`" v-model="honeypot" type="text" name="website" tabindex="-1" autocomplete="off" />
        </div>

        <fieldset v-if="allowMonthly" class="mb-5">
          <legend class="sr-only">How often</legend>
          <div class="grid grid-cols-2 gap-2">
            <label :class="pill"><input v-model="monthly" type="radio" name="frequency" :value="false" class="sr-only" />One-time</label>
            <label :class="pill"><input v-model="monthly" type="radio" name="frequency" :value="true" class="sr-only" />Monthly</label>
          </div>
        </fieldset>

        <fieldset>
          <legend class="mb-2 text-sm font-semibold text-[var(--color-text)]">Amount</legend>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label v-for="n in amounts" :key="n" :class="pill">
              <input v-model="choice" type="radio" name="amount" :value="n" class="sr-only" />{{ money(n) }}
            </label>
            <label :class="pill" class="col-span-2 sm:col-span-4" @click="pickOther">
              <input v-model="choice" type="radio" name="amount" value="other" class="sr-only" />Other amount
            </label>
          </div>
        </fieldset>

        <div v-if="choice === 'other'" class="mt-3">
          <label :for="`${uid}-other`" class="mb-1.5 block text-sm font-semibold text-[var(--color-text)]">Your amount (USD)</label>
          <div class="relative">
            <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" aria-hidden="true">$</span>
            <input
              :id="`${uid}-other`"
              ref="otherEl"
              v-model="other"
              inputmode="numeric"
              autocomplete="off"
              :aria-invalid="Boolean(error)"
              :aria-describedby="error ? `${uid}-error` : undefined"
              class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-7 pr-3.5 text-[var(--color-text)] focus:outline-none focus-visible:outline-3 focus-visible:outline-dashed focus-visible:outline-[var(--color-primary-ink)] focus-visible:outline-offset-2"
            />
          </div>
        </div>

        <p v-if="error" :id="`${uid}-error`" ref="errorEl" tabindex="-1" role="alert" class="mt-3 flex items-start gap-1.5 text-sm font-medium form-error focus:outline-none">
          <AlertCircle :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />{{ error }}
        </p>

        <button
          type="submit"
          :disabled="status === 'submitting'"
          class="focus-ring mt-6 w-full rounded-lg px-6 py-3 font-semibold bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ buttonText }}
        </button>
        <p class="mt-3 flex items-center justify-center gap-1.5 text-center text-sm text-[var(--color-text-secondary)]">
          <Lock :size="14" aria-hidden="true" /> Secure payment by Stripe. You'll get a receipt by email.
        </p>
        <p v-if="section?.note" class="mt-2 text-center text-sm text-[var(--color-text-secondary)]">{{ section.note }}</p>
      </form>
    </div>
  </section>
</template>

<style scoped>
/* Status colors that hold 4.5:1 on the light and dark surfaces */
.form-error { color: #b91c1c; }
.form-ok { color: #15803d; }
:root[data-theme='dark'] .form-error { color: #fca5a5; }
:root[data-theme='dark'] .form-ok { color: #86efac; }
</style>
