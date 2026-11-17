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
    {
      path: '/quiz3',
      name: 'quiz3',
      component: () => import('@/views/Quiz3View.vue'),
    },
    {
      path: '/quiz4',
      name: 'quiz4',
      component: () => import('@/views/Quiz4View.vue'),
    },
    {
      path: '/quiz5',
      name: 'quiz5',
      component: () => import('@/views/Quiz5View.vue'),
    },
    {
      path: '/lentes',
      redirect: '/quiz4',
    },
    {
      path: '/promo',
      redirect: '/quiz5',
    },
    {
      path: '/oferta',
      redirect: '/quiz5',
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
      path: '/opticajohanna/quiz3',
      name: 'opticajohanna-quiz3',
      component: () => import('@/views/Quiz3View.vue'),
    },
    {
      path: '/opticajohanna/quiz4',
      name: 'opticajohanna-quiz4',
      component: () => import('@/views/Quiz4View.vue'),
    },
    {
      path: '/opticajohanna/quiz5',
      name: 'opticajohanna-quiz5',
      component: () => import('@/views/Quiz5View.vue'),
    },
    {
      path: '/visioncheck1',
      redirect: '/opticajohanna/quiz2',
    },
    {
      path: '/:clientSlug/quiz1',
      name: 'client-quiz1',
      component: QuizView,
    },
    {
      path: '/:clientSlug/quiz2',
      name: 'client-quiz2',
      component: () => import('@/views/Quiz2View.vue'),
    },
    {
      path: '/:clientSlug/quiz3',
      name: 'client-quiz3',
      component: () => import('@/views/Quiz3View.vue'),
    },
    {
      path: '/:clientSlug/quiz4',
      name: 'client-quiz4',
      component: () => import('@/views/Quiz4View.vue'),
    },
    {
      path: '/:clientSlug/quiz5',
      name: 'client-quiz5',
      component: () => import('@/views/Quiz5View.vue'),
    },
    {
      path: '/:clientSlug/visioncheck1',
      redirect: to => `/${to.params.clientSlug}/quiz2`,
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
    // 📡 PULSO TELEMETRÍA & MULTI-TENANT ENGINE
    {
      path: '/pulso',
      name: 'pulso-portal',
      component: () => import('@/pulso/views/SiteSelectorView.vue'),
    },
    {
      path: '/pulso/:clientSlug/todo',
      name: 'pulso-client-todo',
      component: () => import('@/pulso/views/TodoView.vue'),
    },
    {
      path: '/pulso/:clientSlug/:quizSlug',
      name: 'pulso-client-dashboard',
      component: () => import('@/pulso/views/DashboardView.vue'),
    },
    {
      path: '/pulso/:clientSlug/:quizSlug/live',
      name: 'pulso-client-live',
      component: () => import('@/pulso/views/LiveView.vue'),
    },
    {
      path: '/pulso/:clientSlug/:quizSlug/leads',
      name: 'pulso-client-leads',
      component: () => import('@/pulso/views/LeadsView.vue'),
    },
    {
      path: '/pulso/:clientSlug',
      redirect: to => `/pulso/${to.params.clientSlug}/todo`,
    },
  ],
})

export default router
