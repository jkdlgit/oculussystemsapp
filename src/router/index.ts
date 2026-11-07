import { createRouter, createWebHistory } from 'vue-router'
import QuizView from '@/views/QuizView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AnalyticsDashboardView from '@/views/AnalyticsDashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/quiz1',
    },
    {
      path: '/quiz1',
      name: 'quiz',
      component: QuizView,
    },
    {
      path: '/quiz2',
      name: 'quiz2',
      component: () => import('@/views/Quiz2View.vue'),
    },
    // Rutas Multi-Tenant por Cliente: /:clientSlug/:quizSlug
    {
      path: '/opticajohanna/quiz1',
      name: 'opticajohanna-quiz1',
      component: QuizView,
    },
    {
      path: '/opticajohanna/quiz2',
      name: 'opticajohanna-quiz2',
      component: () => import('@/views/Quiz2View.vue'),
    },
    {
      path: '/visioncheck1',
      name: 'visioncheck',
      component: () => import('@/views/VisionCheckView.vue'),
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
