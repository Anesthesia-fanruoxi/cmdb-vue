<template>
  <div class="navbar">
    <div class="right-menu">
      <el-dropdown trigger="click">
        <div class="avatar-wrapper">
          <span class="username">{{ userStore.name }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store/modules/user";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

const handleLogout = async () => {
  await userStore.logout();
  router.push("/login");
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.right-menu {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  cursor: pointer;
  padding: 0 8px;

  .username {
    font-size: 14px;
    color: #606266;
  }
}
</style>
