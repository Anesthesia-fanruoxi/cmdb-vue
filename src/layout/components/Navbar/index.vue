<template>
  <div class="navbar">
    <div class="left-menu">
      <hamburger :is-active="!isCollapse" @toggle-click="toggleSideBar" />
      <breadcrumb />
    </div>
    
    <div class="right-menu">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="avatar-wrapper">
          <el-avatar :size="32" :src="userInfo.avatar || ''" />
          <span class="username">{{ userInfo.nickname || userInfo.username }}</span>
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><user /></el-icon>个人信息
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><switch-button /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import Hamburger from '../Hamburger.vue'

const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits(['toggle'])
const isCollapse = ref(false)
const userInfo = computed(() => userStore.userInfo)

const toggleSideBar = () => {
  isCollapse.value = !isCollapse.value
  emit('toggle', isCollapse.value)
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确认退出登录？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
}
</script>

<style scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
}

.left-menu {
  display: flex;
  align-items: center;
}

.right-menu {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #333;
}

.avatar-wrapper:hover {
  background: rgba(0,0,0,.025);
}
</style>
