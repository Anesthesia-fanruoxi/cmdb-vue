<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="10" class="dashboard-section">
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="card-content">
            <div class="card-left">
              <div class="card-title">服务器总数</div>
              <div class="card-number">{{ serverStats.total }}</div>
            </div>
            <div class="card-icon" style="background-color: #409EFF">
              <el-icon><Monitor /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="card-content">
            <div class="card-left">
              <div class="card-title">即将过期</div>
              <div class="card-number">{{ serverStats.expiringCount }}</div>
            </div>
            <div class="card-icon" style="background-color: #E6A23C">
              <el-icon><Timer /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="card-content">
            <div class="card-left">
              <div class="card-title">SSL证书总数</div>
              <div class="card-number">{{ sslStats.total }}</div>
            </div>
            <div class="card-icon" style="background-color: #67C23A">
              <el-icon><Lock /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="card-content">
            <div class="card-left">
              <div class="card-title">证书即将过期</div>
              <div class="card-number">{{ sslStats.expiringCerts.length }}</div>
            </div>
            <div class="card-icon" style="background-color: #F56C6C">
              <el-icon><Warning /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 服务器分布统计 -->
    <el-row :gutter="10" class="dashboard-section">
      <el-col :span="8" v-for="(chart, index) in [
        { title: '项目分布', data: projectChartData },
        { title: '区域分布', data: regionChartData },
        { title: '系统分布', data: osChartData }
      ]" :key="index">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ chart.title }}</span>
            </div>
          </template>
          <PieChart :data="chart.data" height="220px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 监控数据 -->
    <el-row :gutter="10" class="dashboard-section dashboard-bottom">
      <el-col :span="12">
        <el-card class="monitor-card">
          <template #header>
            <div class="card-header">
              <span>{{ MONITOR_LABELS[monitorType] }}TOP10</span>
              <el-radio-group v-model="monitorType" size="small">
                <el-radio-button label="cpu">CPU</el-radio-button>
                <el-radio-button label="memory">内存</el-radio-button>
                <el-radio-button label="disk">磁盘</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="monitor-list">
            <div v-for="(item, index) in displayMonitorData" :key="index" class="monitor-item">
              <span class="monitor-name">
                {{ item.project === '-' ? '-' : `${item.project} / ${item.instance}` }}
              </span>
              <el-progress
                :percentage="Number(item[monitorType].toFixed(2))"
                :color="getProgressColor(item[monitorType])"
                :status="item.project === '-' ? 'exception' : ''"
              />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="monitor-card">
          <template #header>
            <div class="card-header">
              <span>即将过期</span>
              <el-radio-group v-model="expiringType" size="small">
                <el-radio-button label="server">服务器</el-radio-button>
                <el-radio-button label="ssl">SSL证书</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="expiring-list">
            <template v-if="expiringType === 'server'">
              <div v-for="item in serverStats.expiringServers" :key="item.instance" class="expiring-item">
                <div class="expiring-info">
                  <div>{{ item.instance }}</div>
                  <div class="expiring-comment">
                    <el-tag size="small" type="info" effect="plain">{{ item.project }}</el-tag>
                  </div>
                </div>
                <el-tag size="small" :type="getExpiringTagType(item.daysLeft)">
                  剩余 {{ item.daysLeft }} 天
                </el-tag>
              </div>
            </template>
            <template v-else>
              <div v-for="item in sslStats.expiringCerts" :key="item.domain" class="expiring-item">
                <div class="expiring-info">
                  <div>{{ item.domain }}</div>
                  <div class="expiring-comment">
                    <el-tag size="small" type="info" effect="plain">{{ item.project }}</el-tag>
                    <span v-if="item.comment" class="comment-text">{{ item.comment }}</span>
                  </div>
                </div>
                <el-tag size="small" :type="getExpiringTagType(item.daysLeft)">
                  剩余 {{ item.daysLeft }} 天
                </el-tag>
              </div>
            </template>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Monitor, Lock, Warning, Timer } from '@element-plus/icons-vue'
import { getServerStats, getHardwareStats, getSSLStats } from '@/api/dashboard'
import PieChart from './components/PieChart.vue'

// 监控类型定义
type MonitorType = 'cpu' | 'memory' | 'disk'
const MONITOR_TYPES: MonitorType[] = ['cpu', 'memory', 'disk']
const MONITOR_LABELS = {
  cpu: 'CPU使用率',
  memory: '内存使用率',
  disk: '磁盘使用率'
}

// 数据状态
const serverStats = ref({
  total: 0,
  projectStats: [],
  regionStats: [],
  osStats: [],
  expiringCount: 0,
  expiringServers: []
})

const hardwareStats = ref({
  cpuTop10: [],
  memoryTop10: [],
  diskTop10: []
})

const sslStats = ref({
  total: 0,
  statusStats: [],
  expiringCerts: []
})

// 监控类型切换
const monitorType = ref<MonitorType>('cpu')
const expiringType = ref('server')

// 自动切换监控类型
let switchTimer: number
const autoSwitchMonitorType = () => {
  const currentIndex = MONITOR_TYPES.indexOf(monitorType.value)
  const nextIndex = (currentIndex + 1) % MONITOR_TYPES.length
  monitorType.value = MONITOR_TYPES[nextIndex]
}

// 计算图表数据
const projectChartData = computed(() => 
  serverStats.value.projectStats.map(item => ({
    name: item.name,
    value: item.count
  }))
)

const regionChartData = computed(() => 
  serverStats.value.regionStats.map(item => ({
    name: item.name,
    value: item.count
  }))
)

const osChartData = computed(() => 
  serverStats.value.osStats.map(item => ({
    name: item.name,
    value: item.count
  }))
)

// 当前监控数据
const currentMonitorData = computed(() => {
  switch (monitorType.value) {
    case 'cpu':
      return hardwareStats.value.cpuTop10
    case 'memory':
      return hardwareStats.value.memoryTop10
    case 'disk':
      return hardwareStats.value.diskTop10
    default:
      return []
  }
})

// 确保始终显示10条数据
const displayMonitorData = computed(() => {
  const data = currentMonitorData.value
  if (data.length < 10) {
    return [
      ...data,
      ...Array(10 - data.length).fill({
        project: '-',
        instance: '-',
        [monitorType.value]: 0
      })
    ]
  }
  return data
})

// 获取进度条颜色
const getProgressColor = (value: number) => {
  if (value < 70) return '#67C23A'
  if (value < 85) return '#E6A23C'
  return '#F56C6C'
}

// 获取过期标签类型
const getExpiringTagType = (days: number) => {
  if (days > 15) return 'warning'
  if (days > 7) return 'danger'
  return 'error'
}

// 获取数据
const fetchData = async () => {
  try {
    const [serverRes, hardwareRes, sslRes] = await Promise.all([
      getServerStats(),
      getHardwareStats(),
      getSSLStats()
    ])
    
    serverStats.value = serverRes
    hardwareStats.value = hardwareRes
    sslStats.value = sslRes
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

// 定时刷新
let refreshTimer: number
onMounted(() => {
  fetchData()
  // 每5分钟刷新一次数据
  refreshTimer = window.setInterval(fetchData, 5 * 60 * 1000)
  // 每10秒切换一次监控类型
  switchTimer = window.setInterval(autoSwitchMonitorType, 10 * 1000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  if (switchTimer) {
    clearInterval(switchTimer)
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 6px;
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 6px;
  right: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dashboard-section {
  margin-bottom: 6px;
}

.dashboard-bottom {
  flex: 1;
  margin-bottom: 0;
  min-height: 0;
}

.dashboard-bottom .monitor-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.stats-card {
  height: 80px;
  transition: all 0.3s;
  border: 1px solid var(--el-border-color-lighter);
  
  &:hover {
    transform: translateY(2px);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.chart-card {
  height: 220px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  border: 1px solid var(--el-border-color-lighter);
  
  &:hover {
    z-index: 2;
    transform: translateY(2px);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.monitor-card {
  transition: all 0.3s;
  border: 1px solid var(--el-border-color-lighter);
  
  &:hover {
    transform: translateY(2px);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 16px;
}

.card-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.card-number {
  font-size: 22px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.card-icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.monitor-list,
.expiring-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
  padding: 6px;
  min-height: 0;
}

.monitor-item,
.expiring-item {
  padding: 4px 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  min-height: 32px;
}

.expiring-item {
  background: var(--el-bg-color-page);
  border-radius: 4px;
  margin-bottom: 2px;
  transition: all 0.3s;
  height: 40px;
  min-height: 32px;
  
  &:hover {
    background: var(--el-fill-color-light);
  }
}

.monitor-item {
  background: var(--el-bg-color-page);
  border-radius: 4px;
  margin-bottom: 2px;
  transition: all 0.3s;
  
  &:hover {
    background: var(--el-fill-color-light);
  }
  
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.monitor-name {
  width: 180px;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.expiring-info {
  flex: 1;
  min-width: 0;
}

.expiring-info > div:first-child {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expiring-comment {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

:deep(.el-tag) {
  min-width: 80px;
  text-align: center;
}

:deep(.el-tag--plain) {
  min-width: unset;
  border: none;
  background: var(--el-fill-color-light);
}

:deep(.el-progress) {
  flex: 1;
  margin-right: 0;
  margin: 0 4px;
  .el-progress-bar__outer {
    background-color: var(--el-fill-color-light);
    height: 12px !important;
  }
  .el-progress-bar__inner {
    height: 12px !important;
  }
}

:deep(.el-card) {
  --el-card-padding: 10px;
  overflow: visible;
}

:deep(.el-card__header) {
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-card__body) {
  padding: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

:deep(.el-radio-group) {
  margin-left: 8px;
}

:deep(.el-radio-button--small .el-radio-button__inner) {
  padding: 5px 12px;
}
</style>