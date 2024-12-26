import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'dept',
        name: 'Department',
        component: () => import('@/views/system/dept/index.vue'),
        meta: { title: '部门管理' }
      },
      {
        path: 'dict',
        name: 'Dict',
        component: () => import('@/views/system/dict/index.vue'),
        meta: { title: '字典管理' }
      }
    ]
  },
  {
    path: '/assets',
    component: Layout,
    meta: { title: '资产管理', icon: 'Monitor' },
    children: [
      {
        path: 'online',
        name: 'Online',
        meta: { title: '线上资产' },
        children: [
          {
            path: 'database',
            name: 'OnlineDatabase',
            component: () => import('@/views/assets/online/database/index.vue'),
            meta: { title: '数据库' }
          },
          {
            path: 'network',
            name: 'OnlineNetwork',
            component: () => import('@/views/assets/online/network/index.vue'),
            meta: { title: '网络设备' }
          },
          {
            path: 'server',
            name: 'OnlineServer',
            component: () => import('@/views/assets/online/server/index.vue'),
            meta: { title: '服务器' }
          }
        ]
      },
      {
        path: 'test',
        name: 'Test',
        component: () => import('@/views/assets/test/index.vue'),
        meta: { title: '测试资产', icon: 'Box' },
        children: [
          {
            path: 'overview',
            name: 'TestOverview',
            component: () => import('@/views/assets/test/overview/index.vue'),
            meta: { title: '环境预览', icon: 'DataLine' }
          },
          {
            path: 'port-mapping',
            name: 'TestPortMapping',
            component: () => import('@/views/assets/test/port-mapping/index.vue'),
            meta: { title: '端口映射', icon: 'Connection' }
          }
        ]
      }
    ]
  },
  {
    path: '/monitor',
    component: Layout,
    meta: { title: '监控中心', icon: 'DataLine' },
    children: [
      {
        path: 'overview',
        name: 'MonitorOverview',
        component: () => import('@/views/monitor/overview/index.vue'),
        meta: { title: '监控概览' }
      },
      {
        path: 'alarm',
        name: 'MonitorAlarm',
        component: () => import('@/views/monitor/alarm/index.vue'),
        meta: { title: '告警管理' }
      }
    ]
  },
  {
    path: '/knowledge',
    component: Layout,
    meta: { title: '知识库', icon: 'Document' },
    children: [
      {
        path: 'wiki',
        name: 'Wiki',
        component: () => import('@/views/knowledge/wiki/index.vue'),
        meta: { title: '知识文档' }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: '',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人信��' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由白名单
const whiteList = ['/login']

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (token) {
    if (to.path === '/login') {
      next('/')
    } else {
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router