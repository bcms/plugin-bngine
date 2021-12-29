import { createRouter, createWebHistory } from 'vue-router';
// import Home from '../views/home.vue';

// const baseUri = '/dashboard/plugin/bcms-plugin---name';
// const routes: Array<RouteRecordRaw> = [
//   {
//     path: `${baseUri}`,
//     name: 'Home',
//     component: Home,
//   },
//   {
//     path: `${baseUri}#projects`,
//     name: 'Products',
//     component: () =>
//       import(
//         /* webpackChunkName: "bcms-plugin---name-projects" */ '../views/projects.vue'
//       ),
//   },
// ];

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

export default router;
