import { defineStore } from "pinia";
import { login, getUserInfo, logout } from "@/api/user";
import type { LoginParams } from "@/api/user";
import { setToken, getToken, clearAuth } from "@/utils/auth";
import { usePermissionStore } from "./permission";
import router from "@/router";

interface UserState {
  token: string | null;
  userInfo: {
    id?: number;
    username?: string;
    nickname?: string;
    email?: string;
    phone?: string;
    is_enabled?: boolean;
    role?: {
      id: number;
      name: string;
      code: string;
      permissions?: any[];
    };
    department?: {
      id: number;
      name: string;
      code: string;
    };
  };
  isRoutesLoaded: boolean;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: getToken(),
    userInfo: {},
    isRoutesLoaded: false,
  }),

  actions: {
    // 登录
    async login(params: LoginParams) {
      try {
        const res = await login(params);
        if (res.code === 200) {
          // 1. 保存 token
          const token = res.data.token;
          this.token = token;
          setToken(token);

          // 2. 获取用户信息（包含角色和权限）
          await this.getInfo();

          // 3. 生成动态路由
          const permissionStore = usePermissionStore();
          await permissionStore.generateRoutes();

          // 设置路由已加载标志
          this.isRoutesLoaded = true;

          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },

    // 获取用户信息
    async getInfo() {
      try {
        const res = await getUserInfo();
        if (res.code === 200 && res.data) {
          this.userInfo = res.data;
          return res.data;
        }
        throw new Error("获取用户信息失败");
      } catch (error) {
        this.token = null;
        this.userInfo = {};
        clearAuth();
        return Promise.reject(error);
      }
    },

    // 退出登录
    async logout() {
      try {
        await logout();
        this.token = null;
        this.userInfo = {};
        this.isRoutesLoaded = false;
        clearAuth();
        // 重置路由
        router.getRoutes().forEach(route => {
          if (route.name && route.name !== 'Login') {
            router.removeRoute(route.name)
          }
        });
        return true;
      } catch (error) {
        this.token = null;
        this.userInfo = {};
        this.isRoutesLoaded = false;
        clearAuth();
        return true;
      }
    },

    // 清除 token
    clearToken() {
      this.token = null;
      this.userInfo = {};
      clearAuth();
    },

    setRoutesLoaded(status: boolean) {
      this.isRoutesLoaded = status;
    },

    // 重置路由
    async resetRoutes() {
      // 清除所有动态添加的路由
      router.getRoutes().forEach(route => {
        if (route.name && route.name !== 'Login') {
          router.removeRoute(route.name)
        }
      })
      
      // 重置路由加载状态
      this.isRoutesLoaded = false
      
      // 重新生成路由
      const permissionStore = usePermissionStore()
      const accessRoutes = await permissionStore.generateRoutes()
      accessRoutes.forEach(route => {
        router.addRoute(route)
      })
      
      // 添加 404 路由
      router.addRoute({
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard'
      })
      
      this.isRoutesLoaded = true
    },
  },
});
