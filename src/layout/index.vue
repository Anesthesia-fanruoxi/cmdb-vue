<template>
  <div class="app-wrapper">
    <div class="sidebar-container" :class="{ 'is-collapse': isCollapse }">
      <Sidebar :is-collapse="isCollapse" />
    </div>
    <div class="main-container">
      <Navbar @toggle="handleToggleSidebar" />
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Navbar, Sidebar, AppMain } from "./components";

const isCollapse = ref(false);

const handleToggleSidebar = (collapse: boolean) => {
  isCollapse.value = collapse;
};
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  background-color: #304156;
  transition: width 0.3s ease;
  overflow: hidden;

  &.is-collapse {
    width: 64px;
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  position: relative;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

/* 深色主题 */
.dark {
  .sidebar-container {
    background-color: #1f2d3d;
  }

  .main-container {
    background-color: #f0f2f5;
  }
}
</style>
