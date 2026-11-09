import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { createHead } from '@unhead/vue/client';
import App from './App.vue';
import { routes, scrollBehavior, installGuards } from './router';
import { startMonitoring } from './monitoring';
import './assets/styles/main.css';

// Client-rendered entry. Growth sites are prerendered instead: the scaffolder
// replaces this file with a ViteSSG entry that shares the same routes.
const app = createApp(App);
const router = createRouter({ history: createWebHistory(), routes, scrollBehavior });
installGuards(router);

app.use(createPinia());
app.use(router);
app.use(createHead());

app.mount('#app');
startMonitoring(app, router);

// Allow Space key to activate links (a tags) for keyboard accessibility.
// Native <a> elements only respond to Enter; this adds Space parity with <button>.
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && e.target instanceof HTMLAnchorElement) {
    e.preventDefault();
    e.target.click();
  }
});
