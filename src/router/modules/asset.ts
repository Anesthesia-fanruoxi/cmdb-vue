export default {
  path: '/asset',
  component: Layout,
  redirect: '/asset/online/overview',
  name: 'Asset',
  meta: {
    title: '资产管理',
    icon: 'asset'
  },
  children: [
    {
      path: 'online',
      name: 'AssetOnline',
      component: () => import('@/views/assets/online/index.vue'),
      redirect: '/asset/online/overview',
      meta: { title: '线上资产' },
      children: [
        {
          path: 'overview',
          name: 'AssetOverview',
          component: () => import('@/views/assets/online/overview/index.vue'),
          meta: { title: '资产总览' }
        },
        {
          path: 'server',
          name: 'OnlineServer',
          component: () => import('@/views/assets/online/server/index.vue'),
          meta: { title: '服务器管理' }
        },
        {
          path: 'monitor',
          name: 'HardwareMonitor',
          component: () => import('@/views/assets/online/monitor/index.vue'),
          meta: { title: '硬件监控' }
        },
        {
          path: 'ssl',
          name: 'SSLAssets',
          component: () => import('@/views/assets/online/ssl/index.vue'),
          meta: {
            title: 'SSL证书管理'
          }
        }
      ]
    },
    // ... other routes ...
  ]
} 