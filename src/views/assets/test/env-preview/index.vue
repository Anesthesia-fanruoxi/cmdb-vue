<template>
  <div class="env-preview-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>环境预览</span>
          <el-button-group>
            <el-button type="primary" @click="handleRefresh">刷新</el-button>
            <el-button type="success" @click="handleExport">导出</el-button>
          </el-button-group>
        </div>
      </template>

      <!-- 搜索过滤区域 -->
      <div class="filter-section">
        <div class="project-filter">
          <el-radio-group v-model="filterForm.project" @change="handleProjectChange">
            <el-radio label="all">全部</el-radio>
            <el-radio 
              v-for="item in projectList" 
              :key="item.project" 
              :label="item.project"
            >
              {{ item.project_name || item.project }}
            </el-radio>
          </el-radio-group>
        </div>
        <el-form v-if="filterForm.project !== 'all'" :inline="true">
          <el-form-item label="环境名称">
            <el-input 
              v-model="filterForm.envName" 
              placeholder="输入环境名称" 
              clearable 
              @input="handleFilter"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 环境列表表格 -->
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="project_name" label="项目名称" min-width="120" />
        <el-table-column prop="env_name" label="环境名称" min-width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button link type="success" @click="handleStart(row)" :disabled="row.status === 'running'">
              启动
            </el-button>
            <el-button link type="danger" @click="handleStop(row)" :disabled="row.status === 'stopped'">
              停止
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getClusterServices } from '@/api/cluster'
import { useProjectDict } from '@/composables/useProjectDict'

// 使用项目字典 composable
const { projectList, loading: projectLoading } = useProjectDict()

// 过滤表单
const filterForm = reactive({
  project: 'all',
  envName: ''
})

// 数据列表
const loading = ref(false)
const allData = ref<any[]>([])
const tableData = ref<any[]>([])

// 获取所有环境数据
const fetchAllEnvData = async () => {
  try {
    loading.value = true
    
    // 确保有项目列表数据
    if (projectList.value.length === 0) {
      return
    }

    // 获取环境数据
    const res = await getClusterServices({ 
      projects: projectList.value.map(item => item.project).filter(Boolean)
    })
    
    if (res.data) {
      // 将项目名称添加到服务数据中
      allData.value = res.data.map(item => {
        const projectInfo = projectList.value.find(p => p.project === item.project)
        return {
          ...item,
          project_name: projectInfo?.project_name || item.project
        }
      })

      console.log('请求的项目编码:', projectList.value.map(item => item.project).filter(Boolean));
      console.log('返回的数据:', res.data);

      applyFilters()
    }
  } catch (error) {
    ElMessage.error('获取环境数据失败')
  } finally {
    loading.value = false
  }
}

// 监听项目列表变化
watch(projectList, (newValue) => {
  console.log('项目列表已更新:', newValue)
  if (newValue.length > 0) {
    fetchAllEnvData()
  }
}, { immediate: true })

// 应用所有过滤条件
const applyFilters = () => {
  console.log('开始应用过滤条件')
  console.log('当前过滤表单:', filterForm)
  console.log('原始数据:', allData.value)
  
  let filteredData = [...allData.value]

  // 项目过滤
  if (filterForm.project !== 'all') {
    console.log('正在按项目过滤:', filterForm.project)
    filteredData = filteredData.filter(item => item.project === filterForm.project)
    console.log('项目过滤后的数据:', filteredData)
  }

  // 环境名称过滤
  if (filterForm.envName) {
    console.log('正在按环境名称过滤:', filterForm.envName)
    filteredData = filteredData.filter(item => 
      item.env_name.toLowerCase().includes(filterForm.envName.toLowerCase())
    )
    console.log('环境名称过滤后的数据:', filteredData)
  }

  console.log('最终过滤结果:', filteredData)
  tableData.value = filteredData
}

// 处理项目切换
const handleProjectChange = (selectedProject: string) => {
  console.log('项目切换事件触发:', selectedProject)
  applyFilters()
}

// 处理环境名称过滤
const handleFilter = () => {
  console.log('环境名称过滤事件触发:', filterForm.envName)
  applyFilters()
}

// 重置表单
const resetForm = () => {
  console.log('重置表单')
  filterForm.project = 'all'
  filterForm.envName = ''
  applyFilters()
}

// 处理刷新
const handleRefresh = () => {
  fetchAllEnvData()
}
</script>

<style scoped>
.env-preview-container {
  padding: 20px;
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
}

.project-filter {
  margin-bottom: 16px;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.radio-item {
  margin: 0;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style> 