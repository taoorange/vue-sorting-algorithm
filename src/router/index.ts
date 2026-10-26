import { createRouter, createWebHistory } from 'vue-router'

/**
 * 应用路由表。
 * `/` 重定向到排序页；后续功能在此追加 path + views。
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/sort',
    },
    {
      path: '/sort',
      name: 'sort',
      component: () => import('../views/sort/index.vue'),
      meta: { title: '排序算法可视化' },
    },
  ],
})

/** 按路由 meta.title 同步浏览器标签标题 */
router.afterEach((to) => {
  const title = to.meta.title
  document.title = typeof title === 'string' ? title : '算法可视化'
})

export default router
