import { createRouter, createWebHistory } from 'vue-router'
import QuizView from '@/views/QuizView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AnalyticsDashboardView from '@/views/AnalyticsDashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'quiz',
      component: QuizView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsDashboardView,
    },
  ],
})

export default router
