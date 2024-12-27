<template>
  <div class="sidebar-container">
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
        popper-effect="light"
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
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'

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
  background-color: v-bind('variables.menuBg');
  
  .el-scrollbar {
    height: calc(100% - 50px);
  }

  .el-menu {
    border: none;
    height: 100%;
    width: 100%;
  }

  &.is-collapse {
    .el-menu--collapse {
      width: 64px;
    }
  }
}
</style>
