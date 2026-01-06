import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home.vue'),
    },
    {
      path: '/promotion-hierarchy',
      name: 'promotion-hierarchy',
      component: () => import('../views/promotion-hierarchy.vue'),
    },
    {
      path: '/skill-network',
      name: 'skill-network',
      component: () => import('../views/skill-network.vue'),
    },
  ],
})

export default router
