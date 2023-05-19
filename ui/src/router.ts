import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './views/home';
import Projects from './views/projects';

const router = createRouter({
  history: createWebHashHistory('/dashboard/plugin/bcms-plugin---name'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/projects',
      name: 'Projects',
      component: Projects,
    },
  ],
});

export default router;
