<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ 'is-collapse': isCollapse }">
      <!-- Logo区域 -->
      <div class="logo-container">
        <el-icon class="logo-icon"><Monitor /></el-icon>
        <span v-show="!isCollapse" class="logo-text">CMDB</span>
      </div>
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        :collapse="isCollapse"
        :unique-opened="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>

        <el-sub-menu index="/assets">
          <template #title>
            <el-icon><Monitor /></el-icon>
            <span>资产管理</span>
          </template>
          <el-sub-menu index="/assets/online">
            <template #title>
              <el-icon><Cloudy /></el-icon>
              <span>线上资产</span>
            </template>
            <el-menu-item index="/assets/online/database">
              <el-icon><Grid /></el-icon>
              <template #title>数据库</template>
            </el-menu-item>
            <el-menu-item index="/assets/online/network">
              <el-icon><Share /></el-icon>
              <template #title>网络</template>
            </el-menu-item>
            <el-menu-item index="/assets/online/server">
              <el-icon><Platform /></el-icon>
              <template #title>服务器</template>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/assets/test">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>测试资产</span>
            </template>
            <el-menu-item index="/assets/test/overview">
              <el-icon><DataLine /></el-icon>
              <template #title>环境预览</template>
            </el-menu-item>
            <el-menu-item index="/assets/test/port-mapping">
              <el-icon><Connection /></el-icon>
              <template #title>端口映射</template>
            </el-menu-item>
          </el-sub-menu>
        </el-sub-menu>

        <el-sub-menu index="/monitor">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>监控中心</span>
          </template>
          <el-menu-item index="/monitor/overview">
            <el-icon><Histogram /></el-icon>
            <template #title>监控概览</template>
          </el-menu-item>
          <el-menu-item index="/monitor/alarm">
            <el-icon><Bell /></el-icon>
            <template #title>告警管理</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/knowledge">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>知识库</span>
          </template>
          <el-menu-item index="/knowledge/wiki">
            <el-icon><Reading /></el-icon>
            <template #title>Wiki</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/system/role">
            <el-icon><UserFilled /></el-icon>
            <template #title>角色管理</template>
          </el-menu-item>
          <el-menu-item index="/system/dept">
            <el-icon><OfficeBuilding /></el-icon>
            <template #title>部门管理</template>
          </el-menu-item>
          <el-menu-item index="/system/dict">
            <el-icon><List /></el-icon>
            <template #title>字典管理</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 主要内容区 -->
    <div class="main-container">
      <!-- 头部导航 -->
      <div class="navbar">
        <!-- 折叠按钮 -->
        <div class="hamburger-container" @click="toggleSideBar">
          <el-icon :class="{ 'is-active': !isCollapse }">
            <Fold class="fold-icon" />
          </el-icon>
        </div>
        
        <div class="right-menu">
          <el-dropdown trigger="click">
            <div class="avatar-wrapper">
              <el-avatar :size="30" icon="UserFilled" />
              <el-tooltip
                effect="dark"
                :content="userStore.userInfo.phone"
                placement="bottom-end"
                :show-after="0"
                :hide-after="0"
              >
                <span class="username text-ellipsis">{{ userStore.userInfo.nickname || '未知用户' }}</span>
              </el-tooltip>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">个人信息</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="app-main">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { 
  Monitor, 
  Setting, 
  Document, 
  DataBoard, 
  TrendCharts, 
  Fold, 
  Box, 
  DataLine, 
  Connection,
  Cloudy,
  Grid,
  Share,
  Platform,
  Histogram,
  Bell,
  Reading,
  User,
  UserFilled,
  OfficeBuilding,
  List
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 切换侧边栏
const toggleSideBar = () => {
  isCollapse.value = !isCollapse.value
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
}

.sidebar-container.is-collapse {
  width: 64px;
}

.el-menu-vertical {
  border-right: none;
  height: 100%;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: 50px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
}

.hamburger-container {
  padding: 0 15px;
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
}

.hamburger-container:hover {
  background: #f6f6f6;
}

.hamburger-container .el-icon {
  font-size: 20px;
  transition: all 0.3s;
  color: #606266;
}

.hamburger-container:hover .el-icon {
  color: #409EFF;
  transform: scale(1.1);
}

.hamburger-container .is-active {
  transform: rotate(180deg);
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
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-ellipsis {
  display: inline-block;
  vertical-align: middle;
}

.app-main {
  flex: 1;
  padding: 20px;
  position: relative;
  background-color: #f0f2f5;
  overflow: hidden;
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #263445;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  color: #409EFF;
  transition: all 0.3s;
  flex-shrink: 0;
}

.logo-text {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
  background: linear-gradient(45deg, #409EFF, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s;
}

.is-collapse .logo-container {
  padding: 0;
  justify-content: center;
}

.is-collapse .logo-icon {
  font-size: 32px;
}

.fold-icon {
  width: 20px;
  height: 20px;
}
</style> 