import { defineStore } from 'pinia'
import { login } from '@/api/user'
import { usePermissionStore } from './permission'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null
  }),

  actions: {
    // 登录
    async login(loginData: any) {
      try {
        const { data } = await login(loginData)
        this.token = data.token
        localStorage.setItem('token', data.token)

        // 登录成功后立即获取权限
        const permissionStore = usePermissionStore()
        await permissionStore.generateRoutes()

        return data
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    // 登出
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      // 清除权限相关数据
      const permissionStore = usePermissionStore()
      permissionStore.routes = []
      permissionStore.menuList = []
    }
  }
})
