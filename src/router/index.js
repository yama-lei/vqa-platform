import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页'
        }
      },
      {
        path: '/resources',
        name: 'Resources',
        component: () => import('@/views/resources/index.vue'),
        meta: {
          title: '资源中心'
        }
      },
      {
        path: '/model',
        name: 'Model',
        component: () => import('@/views/model/index.vue'),
        meta: {
          title: '模型对话'
        }
      },
      {
        path: '/upload',
        name: 'Upload',
        component: () => import('@/views/upload/index.vue'),
        meta: {
          title: '文件上传'
        }
      },
      {
        path: '/learning',
        name: 'Learning',
        component: () => import('@/views/learning/index.vue'),
        meta: {
          title: '学习空间'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
