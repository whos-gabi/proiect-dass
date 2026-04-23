import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import ForgotPassword from './views/ForgotPassword.vue'
import ResetPassword from './views/ResetPassword.vue'
import Tickets from './views/Tickets.vue'
import TicketDetail from './views/TicketDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',                component: Login },
    { path: '/register',        component: Register },
    { path: '/forgot-password', component: ForgotPassword },
    { path: '/reset-password',  component: ResetPassword },
    { path: '/tickets',         component: Tickets,      meta: { requiresAuth: true } },
    { path: '/tickets/:id',     component: TicketDetail, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
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
