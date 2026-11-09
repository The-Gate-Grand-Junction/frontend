import type { RouteRecordRaw, Router, RouterScrollBehavior } from 'vue-router';

// Route table only: main.ts (or ViteSSG on Growth) creates the router, so this
// module is safe to load in Node during a prerender.
const Home = () => import('@/pages/Home.vue');
const About = () => import('@/pages/About.vue');
const Contact = () => import('@/pages/Contact.vue');
const PrivacyPolicy = () => import('@/components/layout/LegalPage.vue');
const TermsAndConditions = () => import('@/components/layout/LegalPage.vue');
const Accessibility = () => import('@/components/layout/LegalPage.vue');
const Donate = () => import('@/pages/Donate.vue');
const NotFound = () => import('@/pages/NotFound.vue');

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
  },
  {
    path: '/privacy-policy',
    name: 'Privacy Policy',
    component: PrivacyPolicy,
  },
  {
    path: '/terms-and-conditions',
    name: 'Terms & Conditions',
    component: TermsAndConditions,
  },
  {
    path: '/accessibility',
    name: 'Accessibility Statement',
    component: Accessibility,
  },
  {
    path: '/donate',
    name: 'Donate',
    component: Donate,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
];

export const scrollBehavior: RouterScrollBehavior = (_to, _from, savedPosition) => savedPosition || { top: 0 };

/** Navigation guards. Browser only. */
export function installGuards(_router: Router) {}
