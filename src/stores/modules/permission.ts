import { defineStore } from 'pinia'
import { getUserMenus } from '@/api/menu'
import { RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    menuList: [] as any[],
    loading: false
  }),

  actions: {
    // 生成路由
    async generateRoutes() {
      if (this.loading) return this.routes

      this.loading = true
      try {
        const { data } = await getUserMenus()
        if (!data) {
          throw new Error('获取菜单数据失败')
        }

        const accessRoutes = this.filterAsyncRoutes(data)
        this.routes = accessRoutes
        this.menuList = data
        return accessRoutes
      } catch (error) {
        console.error('获取菜单失败:', error)
        ElMessage.error('获取菜单失败')
        return []
      } finally {
        this.loading = false
      }
    },

    // 其他代码保持不变...
  }
})
