import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { usePermissionStore } from "@/store/modules/permission";

// 公共路由（不需要权限）
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "仪表盘", icon: "Odometer" },
      },
    ],
  },
  {
    path: "/profile",
    component: () => import("@/layout/index.vue"),
    meta: { hidden: true },
    children: [
      {
        path: "",
        name: "Profile",
        component: () => import("@/views/profile/index.vue"),
        meta: { title: "个人信息" },
      },
    ],
  },
  {
    path: "/system",
    component: () => import("@/layout/index.vue"),
    redirect: "/system/role",
    meta: { title: "系统管理", icon: "Setting" },
    children: [
      {
        path: "role",
        name: "Role",
        component: () => import("@/views/system/role/index.vue"),
        meta: { title: "角色管理", icon: "UserFilled" },
      },
    ],
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
});

// 路由白名单
const whiteList = ["/login"];

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");

  if (token) {
    if (to.path === "/login") {
      next("/");
    } else {
      try {
        const userStore = useUserStore();
        const permissionStore = usePermissionStore();

        // 如果没有用户信息，说明是刷新页面，需要重新获取
        if (!userStore.userInfo.id) {
          // 重新获取用户信息
          await userStore.getInfo();
          // 重新获取动态路由
          const accessRoutes = await permissionStore.generateRoutes();
          // 添加动态路由
          accessRoutes.forEach((route) => {
            router.addRoute(route);
          });
          // 重新进入当前路由
          next({ ...to, replace: true });
        } else {
          next();
        }
      } catch (error) {
        console.error("路由守卫错误:", error);
        // 出错时清除token并跳转到登录页
        localStorage.removeItem("token");
        next("/login");
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next("/login");
    }
  }
});

export default router;
