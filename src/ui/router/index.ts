import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/home.vue';
import Projects from '../views/projects.vue';

const router = createRouter({
  history: createWebHashHistory('/dashboard/plugin/bcms-plugin---name'),
  routes: [
    {
      path: '/',
      name: 'PluginHome',
      component: Home,
    },
    {
      path: '/projects',
      name: 'PluginProjects',
      component: Projects,
    },
  ],
});

export default router;
