export default {
  path: '/knowledge',
  component: 'Layout',
  meta: {
    title: '知识库',
    icon: 'knowledge'
  },
  children: [
    {
      path: 'personal',
      name: 'PersonalSpace',
      component: () => import('@/views/knowledge/personal/index.vue'),
      meta: {
        title: '个人空间'
      }
    }
    // ... 其他子路由
  ]
} 