import { defineStore } from "pinia";
import { getUserMenus } from "@/api/menu";
import { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";

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

// 添加图标映射
const iconMap: Record<string, string> = {
  // 资产管理相关
  Asset: "Folder", // 资产管理
  Cloud: "Cloud", // 线上资产
  Database: "Grid", // 数据库
  Network: "Connection", // 网络
  Server: "Monitor", // 服务器
  Test: "Box", // 测试资产
  Preview: "View", // 环境预览
  Port: "Position", // 端口映射

  // 监控中心相关
  Monitor: "Odometer", // 监控管理
  Dashboard: "DataBoard", // 监控总览
  Alarm: "Bell", // 告警管理

  // 知识库相关
  Document: "Document", // 知识库
  Wiki: "Reading", // Wiki

  // 系统管理相关
  Setting: "Setting", // 系统管理
  User: "User", // 用户管理
  Role: "Avatar", // 角色管理
  Dept: "OfficeBuilding", // 部门管理
  Menu: "Menu", // 菜单管理
  Dict: "List", // 字典管理
};

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
              if (
                !menu.children.some((child) => child.path === "/knowledge/wiki")
              ) {
                menu.children.push({
                  id: 999, // 临时 ID
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

    // 过滤菜单
    filterMenus(menus: MenuItem[]): MenuItem[] {
      return menus
        .filter((menu) => {
          // 过滤掉不可见或未启用的菜单
          if (!menu.is_visible || !menu.is_enabled) {
            return false;
          }
          // 过滤掉监控配置
          if (menu.path === "/monitor/config") {
            return false;
          }
          return true;
        })
        .map((menu) => ({
          ...menu,
          children: menu.children ? this.filterMenus(menu.children) : undefined,
        }));
    },

    // 格式化路由
    formatRoutes(menus: MenuItem[]): RouteRecordRaw[] {
      return menus.map((menu) => {
        const route: RouteRecordRaw = {
          path: menu.path,
          name: menu.permission,
          meta: {
            title: menu.name,
            // 使用映射转换图标名称
            icon: iconMap[menu.icon] || menu.icon || "Document",
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
