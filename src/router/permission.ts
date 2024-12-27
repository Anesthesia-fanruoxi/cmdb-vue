import router from '@/router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/404']

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      try {
        // 确保用户信息已加载
        if (!userStore.userInfo.id) {
          await userStore.getInfo()
        }

        // 确保路由已生成
        if (!userStore.isRoutesLoaded) {
          const accessRoutes = await permissionStore.generateRoutes()
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })
          userStore.setRoutesLoaded(true)
          
          // 添加 404 路由
          router.addRoute({
            path: '/:pathMatch(.*)*',
            redirect: '/dashboard'
          })
          
          // 重要：这里需要重新触发路由导航
          next({ ...to, replace: true })
        } else {
          // 检查路由是否存在
          if (to.matched.length === 0) {
            next({ path: '/dashboard', replace: true })
            ElMessage.error('页面不存在')
            return
          }

          // 检查用户是否有权限访问该页面
          const hasPermission = permissionStore.dynamicRoutes.some(route => {
            if (route.path === to.path) return true
            if (route.children) {
              return route.children.some(child => child.path === to.path)
            }
            return false
          })

          if (hasPermission) {
            next()
          } else {
            next({ path: '/dashboard', replace: true })
            ElMessage.error('您没有权限访问该页面')
          }
        }
      } catch (error) {
        userStore.clearToken()
        next(`/login?redirect=${to.path}`)
        NProgress.done()
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
