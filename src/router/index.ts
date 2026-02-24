import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/pages/HomePage.vue'),
        },
        {
          path: '/job-descriptions',
          children: [
            {
              path: '/add',
              name: 'Add',
              component: () => import('@/views/JobDescriptions/AddJob.vue'),
            },
            {
              path: '/upload',
              name: 'Upload',
              component: () => import('@/views/JobDescriptions/UploadDescription.vue'),
            },
            {
              path: '/edit',
              name: 'Edit',
              component: () => import('@/views/JobDescriptions/EditDescription.vue'),
            },
          ],
        },
      ],
    },
  ],
})

export default router
