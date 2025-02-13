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

        // 过滤掉 wiki 菜单
        const filteredData = this.filterWikiMenu(data)
        
        const accessRoutes = this.filterAsyncRoutes(filteredData)
        this.routes = accessRoutes
        this.menuList = filteredData
        return accessRoutes
      } catch (error) {
        console.error('获取菜单失败:', error)
        ElMessage.error('获取菜单失败')
        return []
      } finally {
        this.loading = false
      }
    },

    // 添加过滤 wiki 菜单的方法
    filterWikiMenu(menus: any[]) {
      return menus.map(menu => {
        if (menu.children) {
          // 过滤掉 path 包含 'wiki' 的子菜单
          menu.children = menu.children.filter(child => !child.path.includes('wiki'))
          // 如果还有子菜单，继续递归过滤
          if (menu.children.length > 0) {
            menu.children = this.filterWikiMenu(menu.children)
          }
        }
        return menu
      })
    },

    // 其他代码保持不变...
  }
})
