<template>
  <div class="monitor-overview">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statsData" :key="item.title">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-header">
            <span class="title">{{ item.title }}</span>
            <el-icon :class="['icon', item.type]">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="stats-content">
            <div class="number">{{ item.value }}</div>
            <div class="desc">{{ item.desc }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 资源使用趋势图 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>CPU使用率趋势</span>
              <el-select v-model="cpuTimeRange" size="small">
                <el-option label="最近6小时" value="6h" />
                <el-option label="最近24小时" value="24h" />
                <el-option label="最近7天" value="7d" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <el-empty v-if="!cpuData.length" description="暂无数据" />
            <div v-else ref="cpuChartRef" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>内存使用率趋势</span>
              <el-select v-model="memoryTimeRange" size="small">
                <el-option label="最近6小时" value="6h" />
                <el-option label="最近24小时" value="24h" />
                <el-option label="最近7天" value="7d" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <el-empty v-if="!memoryData.length" description="暂无数据" />
            <div v-else ref="memoryChartRef" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警列表 -->
    <el-card shadow="hover" class="alarm-card">
      <template #header>
        <div class="card-header">
          <span>最近告警</span>
          <el-button type="primary" link @click="handleMoreAlarms">
            查看更多
          </el-button>
        </div>
      </template>
      <el-table :data="alarmList" style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlarmLevelType(row.level)">
              {{ getAlarmLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="监控对象" width="180" />
        <el-table-column prop="metric" label="指标" width="120" />
        <el-table-column prop="value" label="当前值" width="100" />
        <el-table-column prop="threshold" label="阈值" width="100" />
        <el-table-column prop="content" label="告警内容" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleAlarmDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 告警详情弹窗 -->
    <el-dialog
      v-model="alarmDetailVisible"
      title="告警详情"
      width="600px"
    >
      <template v-if="currentAlarm">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="告警时间">
            {{ currentAlarm.time }}
          </el-descriptions-item>
          <el-descriptions-item label="告警级别">
            <el-tag :type="getAlarmLevelType(currentAlarm.level)">
              {{ getAlarmLevelText(currentAlarm.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="监控对象">
            {{ currentAlarm.target }}
          </el-descriptions-item>
          <el-descriptions-item label="监控指标">
            {{ currentAlarm.metric }}
          </el-descriptions-item>
          <el-descriptions-item label="当前值">
            {{ currentAlarm.value }}
          </el-descriptions-item>
          <el-descriptions-item label="阈值">
            {{ currentAlarm.threshold }}
          </el-descriptions-item>
          <el-descriptions-item label="告警内容" :span="2">
            {{ currentAlarm.content }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Monitor, Warning, Loading, Connection } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const router = useRouter()

// 统计数据
const statsData = [
  {
    title: '监控主机',
    value: 128,
    desc: '在线: 125 | 离线: 3',
    icon: Monitor,
    type: 'success'
  },
  {
    title: '告警总数',
    value: 15,
    desc: '严重: 2 | 警告: 8 | 普通: 5',
    icon: Warning,
    type: 'danger'
  },
  {
    title: '平均负载',
    value: '65%',
    desc: 'CPU: 65% | 内存: 70% | 磁盘: 55%',
    icon: Loading,
    type: 'warning'
  },
  {
    title: '网络流量',
    value: '2.5GB/s',
    desc: '入站: 1.2GB/s | 出站: 1.3GB/s',
    icon: Connection,
    type: 'info'
  }
]

// 图表相关
const cpuChartRef = ref<HTMLElement>()
const memoryChartRef = ref<HTMLElement>()
const cpuChart = ref<echarts.ECharts>()
const memoryChart = ref<echarts.ECharts>()
const cpuTimeRange = ref('6h')
const memoryTimeRange = ref('6h')
const cpuData = ref<any[]>([])
const memoryData = ref<any[]>([])

// 告警相关
const alarmList = ref([
  {
    time: '2024-01-10 12:00:00',
    level: 'high',
    target: 'web-server-01',
    metric: 'CPU使用率',
    value: '95%',
    threshold: '90%',
    content: 'CPU使用率超过阈值'
  },
  {
    time: '2024-01-10 11:30:00',
    level: 'medium',
    target: 'db-server-01',
    metric: '内存使用率',
    value: '85%',
    threshold: '80%',
    content: '内存使用率超过阈值'
  }
])
const alarmDetailVisible = ref(false)
const currentAlarm = ref<any>(null)

// 获取告警级别标签类型
const getAlarmLevelType = (level: string) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[level] || 'info'
}

// 获取告警级别显示文本
const getAlarmLevelText = (level: string) => {
  const texts: Record<string, string> = {
    high: '严重',
    medium: '警告',
    low: '普通'
  }
  return texts[level] || level
}

// 初始化图表
const initCharts = () => {
  if (cpuChartRef.value && memoryChartRef.value) {
    cpuChart.value = echarts.init(cpuChartRef.value)
    memoryChart.value = echarts.init(memoryChartRef.value)
    
    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '使用率',
          type: 'line',
          smooth: true,
          data: [30, 40, 35, 50, 45, 65],
          areaStyle: {
            opacity: 0.3
          }
        }
      ]
    }

    cpuChart.value.setOption(option)
    memoryChart.value.setOption(option)
  }
}

// 处理窗口大小变化
const handleResize = () => {
  cpuChart.value?.resize()
  memoryChart.value?.resize()
}

// 查看更多告警
const handleMoreAlarms = () => {
  router.push('/monitor/alarm')
}

// 查看告警详情
const handleAlarmDetail = (row: any) => {
  currentAlarm.value = row
  alarmDetailVisible.value = true
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.monitor-overview .stats-card {
  margin-bottom: 20px;
}

.monitor-overview .stats-card .stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.monitor-overview .stats-card .stats-header .title {
  font-size: 16px;
  color: #606266;
}

.monitor-overview .stats-card .stats-header .icon {
  font-size: 24px;
}

.monitor-overview .stats-card .stats-header .icon.success {
  color: #67C23A;
}

.monitor-overview .stats-card .stats-header .icon.warning {
  color: #E6A23C;
}

.monitor-overview .stats-card .stats-header .icon.danger {
  color: #F56C6C;
}

.monitor-overview .stats-card .stats-header .icon.info {
  color: #909399;
}

.monitor-overview .stats-card .stats-content .number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.monitor-overview .stats-card .stats-content .desc {
  font-size: 12px;
  color: #909399;
}

.monitor-overview .charts-row {
  margin: 20px 0;
}

.monitor-overview .chart-container {
  height: 300px;
}

.monitor-overview .chart-container .chart {
  height: 100%;
}

.monitor-overview .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-overview .alarm-card {
  margin-bottom: 20px;
}
</style> 