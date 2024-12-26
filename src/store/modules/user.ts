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
          const token = res.data.token;
          this.token = token;
          setToken(token);

          // 先获取用户信息
          await this.getInfo();

          // 获取并生成动态路由
          const permissionStore = usePermissionStore();
          await permissionStore.generateRoutes();

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
  },
});
