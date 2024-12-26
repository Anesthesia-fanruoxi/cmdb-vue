<template>
  <div v-if="!item.meta?.hidden">
    <template v-if="hasOneShowingChild(item.children, item)">
      <el-menu-item
        v-if="onlyOneChild.meta"
        :index="resolvePath(onlyOneChild.path)"
      >
        <el-icon>
          <component :is="onlyOneChild.meta.icon" />
        </el-icon>
        <template #title>{{ onlyOneChild.meta.title }}</template>
      </el-menu-item>
    </template>

    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon>
          <component :is="item.meta?.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { RouteRecordRaw } from "vue-router";
import path from "path-browserify";

const props = defineProps<{
  item: RouteRecordRaw;
  basePath: string;
}>();

const onlyOneChild = ref<RouteRecordRaw | null>(null);

// 判断是否只有一个可显示的子菜单
const hasOneShowingChild = (
  children: RouteRecordRaw[] = [],
  parent: RouteRecordRaw
) => {
  const showingChildren = children.filter((item) => {
    if (item.meta?.hidden) {
      return false;
    }
    // 设置唯一子菜单
    onlyOneChild.value = item;
    return true;
  });

  // 如果只有一个子菜单
  if (showingChildren.length === 1) {
    return true;
  }

  // 如果没有子菜单，则使用父菜单
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "" };
    return true;
  }

  return false;
};

// 解析路由路径
const resolvePath = (routePath: string) => {
  if (routePath.startsWith("/")) {
    return routePath;
  }
  return path.resolve(props.basePath, routePath);
};
</script>
