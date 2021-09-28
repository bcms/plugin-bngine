import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/home.vue';

const baseUri = '/dashboard/plugin/bcms-plugin---name';
const routes: Array<RouteRecordRaw> = [
  {
    path: `${baseUri}`,
    name: 'Home',
    component: Home,
  },
  {
    path: `${baseUri}#page-2`,
    name: 'Page 2',
    component: () =>
      import(
        /* webpackChunkName: "bcms-plugin---name-home" */ '../views/page-2.vue'
      ),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
