import { createRouter, createWebHistory } from 'vue-router';
import WorldView from './views/WorldView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/act/1' },
    { path: '/act/:n([1-9]|10)', name: 'act', component: WorldView },
    { path: '/:rest(.*)*', redirect: '/act/1' },
  ],
});
