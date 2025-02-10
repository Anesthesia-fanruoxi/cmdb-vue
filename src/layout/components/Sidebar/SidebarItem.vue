<template>
  <div v-if="!item.hidden">
    <!-- 无子菜单的情况 -->
    <template v-if="!hasChildren(item)">
      <el-menu-item :index="resolvePath(item.path)">
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <template #title>{{ item.meta?.title }}</template>
      </el-menu-item>
    </template>

    <!-- 有子菜单的情况 -->
    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(item.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import path from 'path-browserify'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 使用图标组件
const {
  Box,
  CloudFilled, // 注意：是 CloudFilled 而不是 Cloud
  DataBase,
  Connection,
  Monitor,
  Experiment,
  View,
  Position,
  Setting,
  Document,
  Bell,
  UserFilled,
  User,
  OfficeBuilding,
  Menu,
  List
} = ElementPlusIconsVue

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  basePath: {
    type: String,
    default: ''
  },
  isCollapse: {
    type: Boolean,
    default: false
  }
})

// 判断是否有子菜单
const hasChildren = (item: any) => {
  const showingChildren = item.children?.filter((child: any) => {
    return !child.meta?.hidden
  })
  return showingChildren && showingChildren.length > 0
}

// 解析路由路径
const resolvePath = (routePath: string) => {
  if (routePath.startsWith('/')) {
    return routePath
  }
  return path.resolve(props.basePath, routePath)
}
</script>

<style lang="scss" scoped>
// 基础图标样式
.el-menu-item, :deep(.el-sub-menu__title) {
  .el-icon {
    margin-right: 16px;
    width: 1em;
    height: 1em;
  }
}

// 所有菜单的基础样式
:deep(.el-menu) {
  border: none;
}

// 一级菜单基础样式
:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  color: #bfcbd9;
  padding-left: 20px !important;
  height: 56px;
  line-height: 56px;
  font-size: 14px;
  
  &:hover {
    color: #fff;
    background-color: #263445;
  }
}

// 二级菜单
:deep(.el-sub-menu) {
  .el-menu {
    background-color: #1f2d3d;
    
    .el-menu-item, .el-sub-menu__title {
      padding-left: 48px !important;
      height: 50px;
      line-height: 50px;
      font-size: 13px;
    }
  }
}

// 三级菜单
:deep(.el-sub-menu .el-sub-menu) {
  .el-menu {
    background-color: #001528;
    
    .el-menu-item {
      padding-left: 68px !important;
      height: 45px;
      line-height: 45px;
      font-size: 13px;
    }
  }
}

// 激活状态
:deep(.el-menu-item.is-active) {
  background-color: #263445 !important;
  color: #409EFF !important;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: #409EFF;
  }
}

// 折叠状态下的弹出菜单
:deep(.el-menu--popup) {
  min-width: 200px;
  margin: 0;
  padding: 0;
  background-color: #1f2d3d !important;
  border: none;
  
  .el-menu-item {
    height: 45px;
    line-height: 45px;
    padding: 0 20px;
    color: #bfcbd9;
    
    &:hover {
      color: #fff;
      background-color: #263445;
    }
    
    &.is-active {
      background-color: #263445;
      color: #409EFF;
    }
  }
}

// 子菜单箭头
:deep(.el-sub-menu) {
  &.is-active {
    > .el-sub-menu__title {
      color: #bfcbd9 !important;
    }
  }
  
  .el-sub-menu__title {
    .el-sub-menu__icon-arrow {
      right: 20px;
      margin-top: -4px;
    }
  }
}

// 父菜单悬停效果
:deep(.el-sub-menu__title) {
  &:hover {
    color: #fff !important;
    background-color: #263445 !important;
  }
}
</style>
