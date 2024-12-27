<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>监控项总数</span>
            </div>
          </template>
          <div class="card-value">{{ stats.monitorCount }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>告警规则数</span>
            </div>
          </template>
          <div class="card-value">{{ stats.ruleCount }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日告警数</span>
            </div>
          </template>
          <div class="card-value">{{ stats.todayAlarmCount }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>未处理告警</span>
            </div>
          </template>
          <div class="card-value">{{ stats.pendingAlarmCount }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 统计数据
const stats = ref({
  monitorCount: 0,
  ruleCount: 0,
  todayAlarmCount: 0,
  pendingAlarmCount: 0
})

// TODO: 获取统计数据
const fetchStats = async () => {
  // const res = await api.getStats()
  // stats.value = res.data
}

fetchStats()
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  text-align: center;
  padding: 10px 0;
}

.el-card {
  margin-bottom: 20px;
}
</style>
