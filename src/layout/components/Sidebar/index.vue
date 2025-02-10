<template>
  <div class="sidebar-container" :class="{ 'is-collapse': isCollapse }">
    <logo :is-collapse="isCollapse" />
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :active-text-color="variables.menuActiveText"
        :unique-opened="true"
        :collapse-transition="false"
        mode="vertical"
        router
      >
        <!-- 固定菜单 -->
        <sidebar-item
          v-for="route in constantRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
          :is-collapse="isCollapse"
        />
        <!-- 动态菜单 -->
        <sidebar-item
          v-for="route in permissionStore.menuRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
          :is-collapse="isCollapse"
        />
      </el-menu>
      <!-- 添加时钟组件 -->
      <div class="clock-wrapper">
        <analog-clock :is-collapse="isCollapse" />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import AnalogClock from '@/components/AnalogClock.vue'

const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const permissionStore = usePermissionStore()

const activeMenu = computed(() => {
  return route.path
})

// 菜单主题变量
const variables = {
  menuBg: '#304156',
  subMenuBg: '#1f2d3d',
  menuText: '#bfcbd9',
  menuActiveText: '#fff'
}

// 固定路由菜单配置
const constantRoutes = [
  {
    path: '/dashboard',
    meta: { title: '仪表盘', icon: 'Odometer' }
  }
]
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  width: 210px;
  background-color: v-bind('variables.menuBg');
  transition: width 0.3s;
  position: relative;
  
  // 收缩状态
  &.is-collapse {
    width: 64px;
    
    :deep(.el-menu) {
      width: 64px;
    }

    :deep(.el-menu-item), :deep(.el-sub-menu__title) {
      padding: 0 20px !important;
      
      .el-icon {
        margin: 0;
      }

      span {
        display: none;
      }
    }

    .clock-wrapper {
      padding: 8px 0;
    }
  }

  .el-scrollbar {
    height: calc(100% - 50px);
    width: 100%;
  }

  // 展开状态的菜单样式
  :deep(.el-menu) {
    height: 100%;
    width: 210px;
    border: none;
    
    // 一级菜单
    .el-menu-item, .el-sub-menu__title {
      height: 56px;
      line-height: 56px;
      padding-left: 20px !important;
      
      &:hover {
        background-color: #263445;
      }

      .el-icon {
        margin-right: 16px;
        width: 24px;
        vertical-align: middle;
      }
    }

    // 子菜单
    .el-sub-menu {
      .el-menu {
        background-color: v-bind('variables.subMenuBg');
        
        .el-menu-item {
          height: 50px;
          line-height: 50px;
          padding-left: 48px !important;

          &:hover {
            background-color: #263445;
          }
        }
      }
    }
  }

  // 收缩时的弹出菜单样式
  :deep(.el-menu--popup) {
    min-width: 200px;
    margin: 0;
    padding: 0;
    background-color: v-bind('variables.subMenuBg');

    .el-menu-item {
      height: 50px;
      line-height: 50px;
      padding: 0 20px;
      color: v-bind('variables.menuText');

      &:hover {
        background-color: #263445;
      }

      &.is-active {
        background-color: #263445;
        color: v-bind('variables.menuActiveText');
      }
    }
  }

  // 激活状态
  :deep(.el-menu-item.is-active) {
    background-color: #263445 !important;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: v-bind('variables.menuActiveText');
    }
  }

  // 修复滚动条
  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }

  .clock-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 0;
    background-color: v-bind('variables.menuBg');
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
