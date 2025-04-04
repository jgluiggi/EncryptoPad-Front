import { createRouter, createWebHistory } from 'vue-router';
import Login from './Login.vue';
import Register from './Register.vue';
import Dashboard from './Dashboard.vue';
import App from './App.vue';

const routes = [
  { path: '/', component: App },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(() => {
  document.title = "EncryptoPad";
});
export default router;
