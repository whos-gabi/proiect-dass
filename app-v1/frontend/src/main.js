import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Dashboard from './views/Dashboard.vue'
import ForgotPassword from './views/ForgotPassword.vue'
import ResetPassword from './views/ResetPassword.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Login },
    { path: '/register', component: Register },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/forgot-password', component: ForgotPassword },
    { path: '/reset-password', component: ResetPassword }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? next() : next('/'))
      .catch(() => next('/'))
  } else {
    next()
  }
})

createApp(App).use(router).mount('#app')
