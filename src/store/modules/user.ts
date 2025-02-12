import { defineStore } from "pinia";
import { login, getUserInfo, logout } from "@/api/user";
import type { LoginParams } from "@/api/user";
import { setToken, getToken, clearAuth } from "@/utils/auth";
import { usePermissionStore } from "./permission";
import router from "@/router";

export interface UserInfo {
  userId: number
  deptId: number
  username: string
  nickname: string
  email: string
  phone: string
  avatar: string
  roles: string[]
  perms: string[]
}

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

          // 2. 获取用户信息
          await this.getInfo();

          // 3. 生成动态路由
          const permissionStore = usePermissionStore();
          await permissionStore.generateRoutes();

          return true;
        }
        return Promise.reject(new Error(res.message));
      } catch (error) {
        // 向上抛出错误，让组件处理具体的错误提示
        return Promise.reject(error);
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
