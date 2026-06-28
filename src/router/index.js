import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import ForgotPassword from '../components/ForgotPassword.vue';
import ResetPassword from '../components/ResetPassword.vue';
import DashBoardPage from '../components/DashboardPage.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', name: 'login', component: LoginForm },
        { path: '/register', name: 'register', component: RegisterForm },
        { path: '/forgot-password', name: 'forgot-password', component: ForgotPassword },
        { path: '/reset-password', name: 'reset-password', component: ResetPassword },
        { path: '/dashboard', name: 'dashboard', component: DashBoardPage },
    ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.path === '/dashboard' && !authStore.isAuthenticated) {
    return '/login';
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    return '/dashboard';
  }

  return true;
});

export default router;
