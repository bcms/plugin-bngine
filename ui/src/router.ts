import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './views/home';
import Todo from './views/todo';
import TodoFromEntry from './views/todo-from-entry';

const router = createRouter({
  history: createWebHashHistory('/dashboard/plugin/bcms-plugin---name'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/todo',
      name: 'Todo',
      component: Todo,
    },
    {
      path: '/todo-from-entries',
      name: 'Todo from entries',
      component: TodoFromEntry,
    },
  ],
});

export default router;
