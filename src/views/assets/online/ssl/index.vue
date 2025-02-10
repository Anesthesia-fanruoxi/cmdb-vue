<template>
  <div class="ssl-container">
    <div class="filter-stats">
      <div class="left-section">
        <el-radio-group
          v-model="filterProject"
          @change="handleFilter"
          class="filter-radio-group"
        >
          <el-radio-button label="">
            <!-- <el-icon><Grid /></el-icon> -->
            <span>全部</span>
          </el-radio-button>
          <el-radio-button
            v-for="project in sortedProjects"
            :key="project"
            :label="project"
          >
            <!-- <el-icon><Folder /></el-icon> -->
            {{ project }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="right-section">
        <div class="stat-card">
          <div class="stat-header">总数</div>
          <div class="stat-card-content">
            <div class="stat-value">{{ statistics.total }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-header">正常</div>
          <div class="stat-card-content">
            <div class="stat-value normal">{{ statistics.normal }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-header">即将到期</div>
          <div class="stat-card-content">
            <div class="stat-value warning">{{ statistics.warning }}</div>
          </div>
        </div>
      </div>
    </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>SSL证书管理</span>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </template>

      <el-table
        :data="filteredData"
        v-loading="loading"
        height="100%"
        style="width: 100%"
      >
        <el-table-column prop="project" label="项目名称" min-width="120" />
        <el-table-column prop="domain" label="域名" min-width="180" />
        <el-table-column prop="days_left" label="剩余天数" width="100">
          <template #default="{ row }">
            <span :class="getDaysLeftClass(row.days_left)">
              {{ row.days_left }} 天
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="instance" label="实例" min-width="150" />
        <el-table-column prop="comment" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="update_time" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.update_time) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Grid, Folder } from '@element-plus/icons-vue'
import { getSSLMonitorList, type SSLCertificate } from '@/api/asset'

interface Statistics {
  total: number
  normal: number
  warning: number
}

const loading = ref(false)
const tableData = ref<SSLCertificate[]>([])
const filteredData = ref<SSLCertificate[]>([])
const filterProject = ref('')

const statistics = ref<Statistics>({
  total: 0,
  normal: 0,
  warning: 0
})

// 获取排序后的项目列表
const sortedProjects = computed(() => {
  const projects = Array.from(new Set(tableData.value.map(item => item.project)))
  return projects.sort((a, b) => a.localeCompare(b))
})

// 获取剩余天数的样式类
const getDaysLeftClass = (days: number) => {
  if (days <= 30) return 'expire-warning'
  if (days <= 60) return 'warning'
  return 'normal'
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case '正常':
      return 'success'
    case '即将到期':
      return 'warning'
    default:
      return 'danger'
  }
}

// 格式化时间
const formatDateTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

// 更新统计数据
const updateStatistics = () => {
  const total = filteredData.value.length
  const normal = filteredData.value.filter(item => item.days_left > 60).length
  const warning = filteredData.value.filter(item => item.days_left <= 60).length

  statistics.value = {
    total,
    normal,
    warning
  }
}

// 处理筛选
const handleFilter = () => {
  if (filterProject.value) {
    filteredData.value = tableData.value.filter(
      item => item.project === filterProject.value
    )
  } else {
    filteredData.value = tableData.value
  }
  updateStatistics()
}

// 获取列表数据
const fetchList = async () => {
  try {
    loading.value = true
    const res = await getSSLMonitorList()
    if (res.code === 200) {
      tableData.value = res.data
      filteredData.value = res.data
      updateStatistics()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新
const handleRefresh = () => {
  fetchList()
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.ssl-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: var(--el-fill-color-blank);
}

.filter-stats {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-shrink: 0;
  background-color: var(--el-bg-color);
  padding: 16px;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.left-section {
  flex: 1;
  margin-bottom: 0;
  overflow-x: auto;
}

.right-section {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}

.filter-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

:deep(.el-radio-button__inner) {
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  height: 36px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
}

:deep(.el-radio-button__original) {
  opacity: 0;
}

:deep(.el-radio-button:not(:first-child) .el-radio-button__inner) {
  border-left: 1px solid var(--el-border-color-light);
}

:deep(.el-radio-button__inner:hover) {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-7);
  background: var(--el-color-primary-light-9);
}

:deep(.el-radio-button.is-active .el-radio-button__inner) {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
  box-shadow: none;
}

.stat-card {
  flex: 1;
  cursor: pointer;
  transition: all 0.3s;
  height: 64px;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow-light);
}

.stat-header {
  font-size: 13px;
  color: var(--el-text-color-regular);
  text-align: center;
  padding: 4px 0;
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
}

.stat-card-content {
  text-align: center;
  background-color: white;
  width: 100%;
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  line-height: 1;
  margin: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.expire-warning {
  color: var(--el-color-danger);
  font-weight: 500;
}

.warning {
  color: var(--el-color-warning);
  font-weight: 500;
}

.normal {
  color: var(--el-color-success);
  font-weight: 500;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

:deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
}

:deep(.el-table) {
  flex: 1;
  height: 100% !important;
  --el-table-border-color: var(--el-border-color-light);
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-row-hover-bg-color: var(--el-fill-color);
}

:deep(.el-table__header) {
  font-weight: 600;
}

:deep(.el-table .cell) {
  padding: 8px 12px;
}

:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
}

:deep(.el-button) {
  padding: 8px 16px;
  font-weight: 500;
}

:deep(.el-table__empty-block) {
  background-color: var(--el-bg-color);
}

:deep(.el-table__empty-text) {
  color: var(--el-text-color-secondary);
}

:deep(.el-table__inner-wrapper) {
  height: 100%;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}
</style> 