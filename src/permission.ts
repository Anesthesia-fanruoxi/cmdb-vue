import router from './router'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'

const whiteList = ['/login'] // 白名单

router.beforeEach(async (to, from, next) => {
  const token = getToken()
  const userStore = useUserStore()

  if (token) {
    if (to.path === '/login') {
      next('/')
    } else {
      // 判断是否已有用户信息
      if (!userStore.userInfo.id) {
        try {
          // 获取用户信息
          await userStore.getInfo()
          next()
        } catch (error) {
          // 获取用户信息失败，可能是 token 过期
          userStore.clearToken()
          next(`/login?redirect=${to.path}`)
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
    }
  }
}) 