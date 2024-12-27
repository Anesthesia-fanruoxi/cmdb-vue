import { defineStore } from "pinia";
import { getUserMenus } from "@/api/menu";
import { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { useUserStore } from "@/store/modules/user";

interface MenuItem {
  id: number;
  name: string;
  path: string;
  component: string;
  permission: string;
  parent_id: number | null;
  sort: number;
  icon: string;
  is_visible: boolean;
  is_enabled: boolean;
  children?: MenuItem[];
  created_at?: string;
  updated_at?: string;
}

export const usePermissionStore = defineStore("permission", {
  state: () => ({
    routes: [...constantRoutes] as RouteRecordRaw[],
    dynamicRoutes: [] as RouteRecordRaw[],
  }),

  getters: {
    // 获取菜单数据，只返回动态路由部分
    menuRoutes(): RouteRecordRaw[] {
      return this.dynamicRoutes;
    },
  },

  actions: {
    // 过滤菜单
    filterMenus(menus: MenuItem[]): MenuItem[] {
      return menus
        .filter((menu) => {
          // 只过滤掉不可见或未启用的菜单
          if (!menu.is_visible || !menu.is_enabled) {
            return false;
          }
          // 删除监控配置的过滤
          // if (menu.path === "/monitor/config") {
          //   return false;
          // }
          return true;
        })
        .map((menu) => ({
          ...menu,
          children: menu.children ? this.filterMenus(menu.children) : undefined,
        }));
    },

    // 生成路由
    async generateRoutes() {
      try {
        const res = await getUserMenus();
        if (res.code === 200 && res.data) {
          // 添加 Wiki 菜单到知识库
          const menus = res.data.map((menu) => {
            if (menu.path === "/knowledge") {
              if (!menu.children) {
                menu.children = [];
              }
              // 检查是否已经存在 Wiki 菜单
              if (!menu.children.some((child) => child.path === "/knowledge/wiki")) {
                menu.children.push({
                  id: 999,
                  name: "Wiki",
                  path: "/knowledge/wiki",
                  component: "knowledge/wiki/index",
                  permission: "knowledge:wiki",
                  parent_id: menu.id,
                  sort: 1,
                  icon: "Reading",
                  is_visible: true,
                  is_enabled: true,
                });
              }
            }
            return menu;
          });

          const validMenus = this.filterMenus(menus);
          const accessedRoutes = this.formatRoutes(validMenus);
          this.dynamicRoutes = accessedRoutes;
          this.routes = [...constantRoutes, ...accessedRoutes];
          return accessedRoutes;
        }
        return [];
      } catch (error) {
        console.error("获取菜单失败:", error);
        return [];
      }
    },

    // 格式化路由
    formatRoutes(menus: MenuItem[]): RouteRecordRaw[] {
      return menus.map((menu) => {
        const route: RouteRecordRaw = {
          path: menu.path,
          name: menu.permission,
          meta: {
            title: menu.name,
            icon: menu.icon || 'Document',
            permission: menu.permission,
          },
          component:
            menu.parent_id === null
              ? this.loadComponent("Layout")
              : this.loadViewComponent(menu.component),
        };

        if (menu.children && menu.children.length > 0) {
          route.children = this.formatRoutes(menu.children);
        }

        return route;
      });
    },

    // 动态加载布局组件
    loadComponent(component: string) {
      return () => import("@/layout/index.vue");
    },

    // 动态加载视图组件
    loadViewComponent(component: string) {
      // 如果组件路径是 Layout，说明是菜单分组，使用 RouterView 组件
      if (component === "Layout") {
        return () => import("@/components/RouterView/index.vue");
      }

      // Vite 要求使用这种格式的动态导入
      const modules = import.meta.glob("@/views/**/*.vue");
      const path = `/src/views/${component}.vue`;

      if (!modules[path]) {
        console.error(`找不到组件: ${path}`);
        // 返回一个空的组件作为降级处理
        return () => ({
          template: `<div class="error-component">组件 ${component} 不存在</div>`,
        });
      }

      return modules[path];
    },
  },
});
