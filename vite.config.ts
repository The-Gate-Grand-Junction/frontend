/// <reference types="vite-ssg" />
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  // The prerender hooks below run in plain Node, where import.meta.env doesn't
  // exist: copy the VITE_ values into process.env so they can reach Sanity.
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'VITE_'));

  // Source maps go to Sentry only when SENTRY_AUTH_TOKEN is set on the build:
  // 'hidden' maps leave no sourceMappingURL in the JS, and the plugin deletes
  // them from dist after upload, so they are never served publicly.
  const sentryUpload = !!process.env.SENTRY_AUTH_TOKEN;

  return {
    plugins: [
      vue(),
      tailwindcss(),
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        disable: !sentryUpload,
        telemetry: false,
        sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.js.map'] },
      }),
    ],
    build: { sourcemap: sentryUpload ? 'hidden' : false },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Used only by `vite-ssg build` (Growth sites); a plain `vite build` ignores it
    ssgOptions: {
      script: 'async',
      formatting: 'minify',
      includedRoutes: async (paths: string[]) => {
        const { getPrerenderRoutes } = await import('./scripts/prerender-routes.mjs');
        return getPrerenderRoutes(paths);
      },
    },
  };
});
