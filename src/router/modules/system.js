export default {
  path: '/system',
  component: 'Layout',
  meta: {
    title: '系统管理',
    icon: 'setting'
  },
  children: [
    {
      path: 'loginlog',
      name: 'LoginLog',
      component: () => import('@/views/system/loginlog/index.vue'),
      meta: {
        title: '登录日志'
      }
    }
  ]
} 