<template>
    <div class="monitor-container">
      <!-- 状态统计卡片 -->
      <div class="status-cards">
        <el-card class="status-card">
          <template #header>
            <div class="card-header">
              <div class="header-with-icon">
                <el-icon><Monitor /></el-icon>
                <span>总主机数</span>
              </div>
            </div>
          </template>
          <div class="card-content total">
            <span class="number">{{ statistics.total }}</span>
            <span class="unit">台</span>
          </div>
        </el-card>

        <el-card class="status-card">
          <template #header>
            <div class="card-header">
              <div class="header-with-tooltip">
                <div class="header-with-icon">
                  <el-icon><CircleCheckFilled /></el-icon>
                  <span>正常运行</span>
                </div>
                <el-tooltip
                  content="判断标准：内存使用率 < 80% 且 磁盘使用率 < 80%"
                  placement="top"
                >
                  <el-icon class="info-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </div>
          </template>
          <div 
            class="card-content clickable" 
            @click="handleStatusFilter('normal')"
            :class="{ active: filterStatus === 'normal' }"
          >
            <span class="number success">{{ statistics.normal }}</span>
            <span class="unit">台</span>
          </div>
        </el-card>

        <el-card class="status-card">
          <template #header>
            <div class="card-header">
              <div class="header-with-tooltip">
                <div class="header-with-icon">
                  <el-icon><WarningFilled /></el-icon>
                  <span>异常主机</span>
                </div>
                <el-tooltip
                  content="判断标准：内存使用率 ≥ 80% 或 磁盘使用率 ≥ 80%"
                  placement="top"
                >
                  <el-icon class="info-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </div>
          </template>
          <div 
            class="card-content clickable" 
            @click="handleStatusFilter('abnormal')"
            :class="{ active: filterStatus === 'abnormal' }"
          >
            <span class="number warning">{{ statistics.abnormal }}</span>
            <span class="unit">台</span>
          </div>
        </el-card>
      </div>

      <el-card v-loading="loading" class="server-list">
        <template #header>
          <div class="card-header">
            <span>线上资产服务器</span>
            <el-button type="primary" @click="handleRefresh">刷新</el-button>
          </div>
        </template>
  
        <!-- 搜索过滤区域 -->
        <div class="filter-section">
          <el-form :inline="true" :model="filterForm" class="filter-form">
            <el-form-item label="项目">
              <el-select 
                v-model="filterForm.project" 
                placeholder="请选择项目"
                clearable
                filterable
                @change="handleSearch"
                class="filter-select"
              >
                <el-option label="全部" value="all" />
                <el-option
                  v-for="project in projectList"
                  :key="project"
                  :label="project"
                  :value="project"
                />
              </el-select>
            </el-form-item>
  
            <el-form-item label="主机名">
              <el-input 
                v-model="filterForm.hostName" 
                placeholder="输入主机名" 
                clearable 
                @input="handleSearch"
                class="filter-input"
              />
            </el-form-item>
  
            <el-form-item>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
  
        <!-- 服务器列表表格 -->
        <el-table 
          :data="tableData" 
          style="width: 100%"
          height="500"
          :row-style="{ height: '40px' }"
          :cell-style="{ padding: '4px 0' }"
          @sort-change="handleSort"
        >
          <!-- 固定列 -->
          <el-table-column prop="project" label="项目" min-width="100" fixed="left" />
          <el-table-column prop="hostName" label="主机名" min-width="120" fixed="left" />
          
          <!-- CPU信息 -->
          <el-table-column label="CPU信息" align="center">
            <el-table-column prop="cpuModel" label="型号" min-width="120" show-overflow-tooltip />
            <el-table-column prop="cpuTotal" label="核心数" min-width="80" sortable />
            <el-table-column label="负载" align="center">
              <el-table-column prop="cpuLoad1" label="1分钟" min-width="80" />
              <el-table-column prop="cpuLoad5" label="5分钟" min-width="80" />
              <el-table-column prop="cpuLoad15" label="15分钟" min-width="80" />
            </el-table-column>
          </el-table-column>
  
          <!-- 内存信息 -->
          <el-table-column label="内存信息" align="center">
            <el-table-column prop="memoryTotal" label="总量" min-width="100">
              <template #default="{ row }">
                {{ formatSize(row.memoryTotal) }}
              </template>
            </el-table-column>
            <el-table-column prop="memoryUsed" label="已用" min-width="100">
              <template #default="{ row }">
                {{ formatSize(row.memoryUsed) }}
              </template>
            </el-table-column>
            <el-table-column prop="memoryFree" label="空闲" min-width="100">
              <template #default="{ row }">
                {{ formatSize(row.memoryFree) }}
              </template>
            </el-table-column>
            <el-table-column prop="memoryPercent" label="使用率" min-width="180" sortable>
              <template #default="{ row }">
                <el-progress 
                  :percentage="Number(Number(row.memoryPercent).toFixed(2))"
                  :color="getMemoryColor"
                  :format="(val) => val + '%'"
                  :stroke-width="15"
                />
              </template>
            </el-table-column>
          </el-table-column>
  
          <!-- 磁盘信息 -->
          <el-table-column label="磁盘信息" align="center">
            <el-table-column prop="diskTotal" label="总量" min-width="100">
              <template #default="{ row }">
                {{ formatSize(row.diskTotal) }}
              </template>
            </el-table-column>
            <el-table-column prop="diskUsed" label="已用" min-width="100">
              <template #default="{ row }">
                {{ formatSize(row.diskUsed) }}
              </template>
            </el-table-column>
            <el-table-column prop="diskFree" label="空闲" min-width="100">
              <template #default="{ row }">
                {{ formatSize(row.diskFree) }}
              </template>
            </el-table-column>
            <el-table-column prop="diskPercent" label="使用率" min-width="180" sortable>
              <template #default="{ row }">
                <el-progress 
                  :percentage="Number(Number(row.diskPercent).toFixed(2))"
                  :color="getDiskColor"
                  :format="(val) => val + '%'"
                  :stroke-width="15"
                />
              </template>
            </el-table-column>
          </el-table-column>
  
          <!-- 系统信息 -->
          <el-table-column label="系统信息" align="center">
            <el-table-column prop="osVersion" label="系统版本" min-width="120" show-overflow-tooltip />
            <el-table-column prop="kernelVersion" label="内核版本" min-width="120" show-overflow-tooltip />
          </el-table-column>
  
          <el-table-column label="更新时间" min-width="180" fixed="right">
            <template #default="{ row }">
              {{ formatDateTime(row.updateTime) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { getServerList, type ServerInfo } from '@/api/asset'
  import type { TableColumnCtx } from 'element-plus'
  import { 
    QuestionFilled, 
    Monitor, 
    CircleCheckFilled, 
    WarningFilled 
  } from '@element-plus/icons-vue'
  
  const loading = ref(false)
  const tableData = ref<ServerInfo[]>([])
  const allData = ref<ServerInfo[]>([])
  const projectList = ref<string[]>([])
  
  const filterForm = reactive({
    project: 'all',
    hostName: ''
  })
  
  // 定义排序参数接口
  interface SortParams {
    prop: keyof ServerInfo | ''
    order: 'ascending' | 'descending' | ''
  }
  
  // 排序状态
  const sortState = reactive<SortParams>({
    prop: '',
    order: ''
  })
  
  // 添加统计数据
  const statistics = reactive({
    total: 0,
    normal: 0,
    abnormal: 0
  })
  
  // 添加状态过滤
  const filterStatus = ref<'all' | 'normal' | 'abnormal'>('all')
  
  // 获取服务器列表数据
  const fetchServerList = async () => {
    try {
      loading.value = true
      const res = await getServerList()
      
      // 验证响应数据
      if (!res?.data) {
        throw new Error('返回数据为空')
      }

      // 验证数据格式
      const isValidData = (data: any): data is ServerInfo[] => {
        return Array.isArray(data) && data.every(item => 
          typeof item === 'object' && 
          item !== null &&
          typeof item.project === 'string' &&
          typeof item.hostName === 'string'
        )
      }

      if (!isValidData(res.data)) {
        throw new Error('返回数据格式不正确')
      }

      allData.value = res.data
      // 提取项目列表
      const projects = new Set(res.data.map((item: ServerInfo) => item.project))
      projectList.value = Array.from(projects)
      handleSearch()
    } catch (error) {
      console.error('获取服务器列表失败:', error)
      if (error instanceof Error) {
        ElMessage.error(`获取数据失败: ${error.message}`)
      } else {
        ElMessage.error('获取数据失败')
      }
      // 清空数据
      allData.value = []
      projectList.value = []
      tableData.value = []
    } finally {
      loading.value = false
    }
  }
  
  // 更新统计信息
  const updateStatistics = () => {
    if (!allData.value.length) {
      statistics.total = 0
      statistics.normal = 0
      statistics.abnormal = 0
      return
    }

    statistics.total = allData.value.length
    statistics.normal = allData.value.filter(item => 
      Number(item.memoryPercent) < 80 && Number(item.diskPercent) < 80
    ).length
    statistics.abnormal = statistics.total - statistics.normal
  }
  
  // 处理搜索过滤
  const handleSearch = () => {
    try {
      let filteredData = allData.value
  
      // 按项目筛选
      if (filterForm.project !== 'all') {
        filteredData = filteredData.filter(item => item.project === filterForm.project)
      }
  
      // 按主机名搜索
      if (filterForm.hostName) {
        const searchTerm = filterForm.hostName.toLowerCase()
        filteredData = filteredData.filter(item => 
          item.hostName.toLowerCase().includes(searchTerm)
        )
      }
  
      // 按状态过滤
      if (filterStatus.value !== 'all') {
        filteredData = filteredData.filter(item => {
          const isNormal = Number(item.memoryPercent) < 80 && Number(item.diskPercent) < 80
          return filterStatus.value === 'normal' ? isNormal : !isNormal
        })
      }
  
      // 应用排序
      if (sortState.prop && sortState.order) {
        filteredData.sort((a, b) => {
          try {
            let aValue: number
            let bValue: number
            
            // 只处理三个可排序字段
            switch (sortState.prop) {
              case 'cpuTotal':
                // CPU核心数
                aValue = Number(a[sortState.prop]) || 0
                bValue = Number(b[sortState.prop]) || 0
                break
              
              case 'memoryPercent':
              case 'diskPercent':
                // 使用率百分比
                aValue = Number(a[sortState.prop]) || 0
                bValue = Number(b[sortState.prop]) || 0
                break
              
              default:
                return 0
            }
            
            // 处理无效数字
            if (isNaN(aValue)) aValue = 0
            if (isNaN(bValue)) bValue = 0
            
            // 数字排序
            return sortState.order === 'ascending' ? aValue - bValue : bValue - aValue
          } catch (error) {
            console.error('排序出错:', error)
            return 0
          }
        })
      }
  
      tableData.value = filteredData
      updateStatistics() // 更新统计信息
    } catch (error) {
      console.error('处理数据出错:', error)
      ElMessage.error('数据处理失败')
      tableData.value = []
      updateStatistics() // 错误时也更新统计信息
    }
  }
  
  // 处理表格排序
  const handleSort = ({ prop, order }: SortParams) => {
    if (!prop || !order) return
    
    sortState.prop = prop
    sortState.order = order
    handleSearch() // 使用 handleSearch 来处理排序，保持逻辑一致
  }
  
  // 重置表单
  const resetForm = () => {
    filterForm.project = 'all'
    filterForm.hostName = ''
    filterStatus.value = 'all'
    handleSearch()
  }
  
  // 处理刷新
  const handleRefresh = () => {
    fetchServerList()
  }
  
  // 格式化大小
  const formatSize = (size: string) => {
    const num = Number(size)
    if (isNaN(num)) return '0 B'
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let index = 0
    let convertedSize = num
  
    while (convertedSize >= 1024 && index < units.length - 1) {
      convertedSize /= 1024
      index++
    }
  
    return `${convertedSize.toFixed(2)} ${units[index]}`
  }
  
  // 格式化时间
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  
  // 内存使用率颜色
  const getMemoryColor = (percentage: number) => {
    if (percentage < 70) return '#67C23A'
    if (percentage < 85) return '#E6A23C'
    return '#F56C6C'
  }
  
  // 磁盘使用率颜色
  const getDiskColor = (percentage: number) => {
    if (percentage < 75) return '#67C23A'
    if (percentage < 90) return '#E6A23C'
    return '#F56C6C'
  }
  
  // 处理状态过滤
  const handleStatusFilter = (status: 'normal' | 'abnormal') => {
    filterStatus.value = filterStatus.value === status ? 'all' : status
    handleSearch()
  }
  
  onMounted(() => {
    fetchServerList()
  })
  </script>
  
  <style scoped>
  .monitor-container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .monitor-container :deep(.el-card) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .monitor-container :deep(.el-card__body) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .filter-section {
    margin-bottom: 20px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
    flex-shrink: 0;
  }
  
  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
  }
  
  .filter-select {
    width: 200px;
  }
  
  .filter-input {
    width: 200px;
  }
  
  :deep(.el-form--inline .el-form-item) {
    margin-right: 0;
    margin-bottom: 0;
  }
  
  :deep(.el-form-item__content) {
    flex-wrap: nowrap;
  }
  
  /* 优化下拉框的搜索框样式 */
  :deep(.el-select .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
  }
  
  :deep(.el-select .el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
  }
  
  :deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }
  
  /* 优化下拉选项的样式 */
  :deep(.el-select-dropdown__item) {
    padding: 0 12px;
    height: 34px;
    line-height: 34px;
    font-size: 13px;
  }
  
  :deep(.el-select-dropdown__item.selected) {
    font-weight: 500;
    color: var(--el-color-primary);
  }
  
  /* 表格样式优化 */
  :deep(.el-table) {
    flex: 1;
    height: 100%;
  }
  
  :deep(.el-table__body-wrapper) {
    overflow-x: hidden;
  }
  
  :deep(.el-table__body-wrapper:hover) {
    overflow-x: auto;
  }
  
  :deep(.el-table__header-wrapper) {
    flex-shrink: 0;
  }
  
  /* 进度条样式优化 */
  :deep(.el-progress) {
    margin: 6px 0;
    
    .el-progress-bar__outer {
      border-radius: 4px;
      background-color: #f0f2f5;
    }
    
    .el-progress-bar__inner {
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    .el-progress__text {
      font-size: 12px;
      font-weight: 500;
      margin-left: 6px;
    }
  }
  
  /* 表格行hover效果 */
  :deep(.el-table__body tr:hover > td) {
    background-color: #f5f7fa !important;
  }
  
  /* 优化表格单元格内容的对齐方式 */
  :deep(.el-table .cell) {
    padding: 8px;
    line-height: 1.5;
  }
  
  /* 固定列的阴影效果 */
  :deep(.el-table__fixed-right::before),
  :deep(.el-table__fixed::before) {
    content: '';
    position: absolute;
    top: 0;
    width: 10px;
    height: 100%;
    pointer-events: none;
  }
  
  :deep(.el-table__fixed-right::before) {
    right: 100%;
    box-shadow: -5px 0 5px -5px rgba(0, 0, 0, 0.12);
  }
  
  :deep(.el-table__fixed::before) {
    left: 100%;
    box-shadow: 5px 0 5px -5px rgba(0, 0, 0, 0.12);
  }
  
  /* 调整表格行高和内边距 */
  :deep(.el-table__row) {
    height: 40px;
  }
  
  :deep(.el-table .cell) {
    padding: 4px 8px;
    line-height: 1.2;
  }

  .status-cards {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  .status-card {
    flex: 1;
    min-width: 200px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-light);
      background-color: var(--el-color-primary-light-9);
    }
    
    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .header-with-icon {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }

  .card-content {
    display: flex;
    align-items: baseline;
    justify-content: center;
    padding: 8px;
    border-radius: 4px;
    
    &.total .number {
      color: var(--el-color-primary);
    }
  }

  .card-content.clickable {
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
    
    &.active {
      background-color: var(--el-color-primary-light-8);
    }
  }

  .number {
    font-size: 32px;
    font-weight: bold;
    margin-right: 8px;
    line-height: 1;
    
    &.success {
      color: var(--el-color-success);
    }
    
    &.warning {
      color: var(--el-color-danger);
    }
  }

  .unit {
    font-size: 16px;
    color: var(--el-text-color-secondary);
  }

  .info-icon {
    font-size: 16px;
    color: var(--el-color-info);
    cursor: help;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--el-color-primary);
    }
  }

  /* 调整服务器列表卡片样式 */
  .server-list {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .header-with-tooltip {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .info-icon {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    cursor: help;
  }

  .card-content.clickable {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    &.active {
      background-color: var(--el-color-primary-light-9);
      border-radius: 4px;
      padding: 8px;
    }
  }
  </style> 