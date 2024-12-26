import router from './index'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/404']

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      // 检查是否已加载权限路由
      if (permissionStore.routes.length === 0) {
        try {
          // 获取权限路由
          const accessRoutes = await permissionStore.generateRoutes()
          // 动态添加路由
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })
          // 重新导航到目标路由
          next({ ...to, replace: true })
        } catch (error) {
          ElMessage.error('获取权限失败，请重新��录')
          await userStore.logout()
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
