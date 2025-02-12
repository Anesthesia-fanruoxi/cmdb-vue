import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

// 定义菜单项的类型
export interface MenuItem {
  path: string
  name: string
  component?: any
  redirect?: string
  meta: {
    title: string
    icon?: string
    roles?: string[]
    hidden?: boolean
  }
  children?: MenuItem[]
}

// 菜单配置
export const menus: MenuItem[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Layout,
    redirect: '/dashboard/index',
    meta: { title: '仪表盘', icon: 'Odometer' },
    children: [
      {
        path: 'index',
        name: 'DashboardIndex',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘' }
      }
    ]
  },
  {
    path: '/assets',
    name: 'Assets',
    component: Layout,
    redirect: '/assets/online/server',
    meta: { title: '资产管理', icon: 'Monitor' },
    children: [
      {
        path: 'online',
        name: 'OnlineAssets',
        component: () => import('@/views/assets/online/index.vue'),
        meta: { title: '线上资产' },
        children: [
          {
            path: 'server',
            name: 'OnlineServer',
            component: () => import('@/views/assets/online/server/index.vue'),
            meta: { title: '服务器管理' }
          },
          {
            path: 'network',
            name: 'OnlineNetwork',
            component: () => import('@/views/assets/online/network/index.vue'),
            meta: { title: '网络设备' }
          },
          {
            path: 'database',
            name: 'OnlineDatabase',
            component: () => import('@/views/assets/online/database/index.vue'),
            meta: { title: '数据库管理' }
          }
        ]
      },
      {
        path: 'test',
        name: 'TestAssets',
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
    path: '/knowledge',
    name: 'Knowledge',
    component: Layout,
    meta: { title: '知识库', icon: 'Notebook' },
    children: [
      {
        path: 'document',
        name: 'Document',
        component: () => import('@/views/knowledge/document/index.vue'),
        meta: { title: '文档管理' }
      },
      {
        path: 'wiki',
        name: 'Wiki',
        component: () => import('@/views/knowledge/wiki/index.vue'),
        meta: { title: 'Wiki 管理' }
      }
    ]
  },
  {
    path: '/system',
    name: 'System',
    component: Layout,
    meta: { title: '系统管理', icon: 'Tools' },
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'dept',
        name: 'SystemDept',
        component: () => import('@/views/system/dept/index.vue'),
        meta: { title: '部门管理' }
      }
    ]
  }
]

// 删除监控相关的菜单配置
export const asyncMenus: MenuItem[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Layout,
    redirect: '/dashboard/index',
    meta: { title: '仪表盘', icon: 'Odometer' },
    children: [
      {
        path: 'index',
        name: 'DashboardIndex',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘' }
      }
    ]
  },
  // ... 其他异步菜单
] 