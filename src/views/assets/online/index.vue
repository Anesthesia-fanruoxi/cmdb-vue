<template>
  <div class="online-container">
    <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="服务器管理" name="server">
        <router-view v-if="activeTab === 'server'" />
      </el-tab-pane>
      <el-tab-pane label="硬件监控" name="monitor">
        <router-view v-if="activeTab === 'monitor'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeTab = ref('server')

// 根据路由路径设置当前激活的标签
watch(
  () => route.path,
  (path) => {
    if (path.includes('/monitor')) {
      activeTab.value = 'monitor'
    } else if (path.includes('/server')) {
      activeTab.value = 'server'
    }
  },
  { immediate: true }
)

// 处理标签点击
const handleClick = () => {
  const path = `/asset/online/${activeTab.value}`
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<style scoped>
.online-container {
  padding: 20px;
  height: 100%;
}

:deep(.el-tabs__content) {
  padding: 20px 0;
  height: calc(100% - 55px);
}

:deep(.el-tab-pane) {
  height: 100%;
}
</style> 