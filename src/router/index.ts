import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { skipAuth } from '@/lib/config'
import { ROUTES } from '@/lib/routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: ROUTES.login,
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: ROUTES.root,
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: ROUTES.clients,
      name: 'clients',
      component: () => import('@/views/ClientsListView.vue'),
    },
    {
      path: ROUTES.earnings,
      name: 'earnings',
      component: () => import('@/views/EarningsView.vue'),
    },
    {
      path: ROUTES.clientNew,
      name: 'client-new',
      component: () => import('@/views/ClientFormView.vue'),
    },
    {
      path: '/klienci/:id',
      name: 'client-detail',
      component: () => import('@/views/ClientDetailView.vue'),
    },
    {
      path: '/klienci/:id/edycja',
      name: 'client-edit',
      component: () => import('@/views/ClientFormView.vue'),
    },
    {
      path: ROUTES.users,
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: { adminOnly: true },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.public) {
    if (to.name === 'login') {
      if (skipAuth) return ROUTES.root
      const auth = useAuthStore()
      if (auth.isAuthenticated) return ROUTES.root
    }
    return true
  }

  if (skipAuth) return true

  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.adminOnly && !auth.isAdmin) {
    return ROUTES.root
  }

  return true
})

export default router
