<template>
  <el-menu
    :default-active="route.path"
    :collapse="isCollapse"
    :unique-opened="true"
    :collapse-transition="false"
    mode="vertical"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
  >
    <sidebar-item
      v-for="route in permissionStore.menuRoutes"
      :key="route.path"
      :item="route"
      :base-path="route.path"
    />
  </el-menu>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { usePermissionStore } from "@/store/modules/permission";
import SidebarItem from "./SidebarItem.vue";

const route = useRoute();
const permissionStore = usePermissionStore();
const isCollapse = ref(false);
</script>
