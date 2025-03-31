import { createRouter, createWebHistory } from 'vue-router';
import Login from './Login.vue';
import Register from './Register.vue';
import Dashboard from './Dashboard.vue';

const routes = [
  { path: '/', component: Login, alias: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
