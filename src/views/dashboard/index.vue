<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>服务器状态</span>
            </div>
          </template>
          <div class="status-count">
            <div class="total">{{ data.serverCount.total }}</div>
            <div class="detail">
              <el-tag type="success">运行: {{ data.serverCount.running }}</el-tag>
              <el-tag type="warning">停止: {{ data.serverCount.stopped }}</el-tag>
              <el-tag type="danger">异常: {{ data.serverCount.error }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>网络设备状态</span>
            </div>
          </template>
          <div class="status-count">
            <div class="total">{{ data.networkCount.total }}</div>
            <div class="detail">
              <el-tag type="success">运行: {{ data.networkCount.running }}</el-tag>
              <el-tag type="danger">异常: {{ data.networkCount.error }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>告警统计</span>
            </div>
          </template>
          <div class="status-count">
            <div class="total">{{ data.alarmCount.total }}</div>
            <div class="detail">
              <el-tag type="danger">高: {{ data.alarmCount.high }}</el-tag>
              <el-tag type="warning">中: {{ data.alarmCount.medium }}</el-tag>
              <el-tag type="info">低: {{ data.alarmCount.low }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>资源使用</span>
            </div>
          </template>
          <div class="resource-usage">
            <el-progress 
              type="dashboard" 
              :percentage="data.resourceUsage.cpu"
              :color="getProgressColor"
            >
              <template #default="{ percentage }">
                <span class="progress-label">CPU</span>
                <span class="percentage">{{ percentage }}%</span>
              </template>
            </el-progress>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警列表 -->
    <el-card class="alarm-list" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>最近告警</span>
        </div>
      </template>
      <el-table :data="data.recentAlarms" style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlarmLevelType(row.level)">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="target" label="目标" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

interface DashboardData {
  serverCount: {
    total: number
    running: number
    stopped: number
    error: number
  }
  networkCount: {
    total: number
    running: number
    error: number
  }
  alarmCount: {
    total: number
    high: number
    medium: number
    low: number
  }
  resourceUsage: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  recentAlarms: Array<{
    id: number
    level: string
    title: string
    target: string
    time: string
  }>
}

const data = ref<DashboardData>({
  serverCount: {
    total: 0,
    running: 0,
    stopped: 0,
    error: 0
  },
  networkCount: {
    total: 0,
    running: 0,
    error: 0
  },
  alarmCount: {
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  },
  resourceUsage: {
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  },
  recentAlarms: []
})

// 获取仪表盘数据
const getDashboardData = async () => {
  try {
    const res = await request.get('/dashboard/overview')
    data.value = res.data
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  }
}

onMounted(() => {
  getDashboardData()
})

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 70) return '#67C23A'
  if (percentage < 90) return '#E6A23C'
  return '#F56C6C'
}

// 获取告警级别对应的标签类型
const getAlarmLevelType = (level: string) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[level] || 'info'
}
</script>

<style scoped>
.dashboard {
  .el-row {
    margin-bottom: 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-count {
  text-align: center;
  
  .total {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .detail {
    display: flex;
    justify-content: space-around;
    
    .el-tag {
      margin: 0 5px;
    }
  }
}

.resource-usage {
  display: flex;
  justify-content: center;
  
  .progress-label {
    display: block;
    margin-bottom: 5px;
  }
  
  .percentage {
    display: block;
    font-size: 18px;
    font-weight: bold;
  }
}

.alarm-list {
  margin-top: 20px;
}
</style>
