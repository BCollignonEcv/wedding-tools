import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/table-plan',
      name: 'table-plan',
      component: () => import('@/views/TablePlanView.vue'),
    },
  ],
})

export default router
