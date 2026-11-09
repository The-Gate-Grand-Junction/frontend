/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_SANITY_PROJECT_ID: string;
  readonly VITE_SANITY_DATASET: string;
  readonly VITE_SANITY_API_VERSION: string;
  readonly VITE_GA_MEASUREMENT_ID: string;
  readonly VITE_FORMSPREE_ENDPOINT: string;
  readonly VITE_SITE_TIMEZONE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
