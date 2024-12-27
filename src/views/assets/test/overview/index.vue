<template>
  <div class="overview-container">
    <el-card>
      <template #header>
        <div class="header">
          <h2>环境概览</h2>
          <el-button type="primary" @click="handleRefresh">
            刷新
          </el-button>
        </div>
      </template>

      <ProjectFilter
        v-model="selectedProject"
        :project-list="projectList"
        @change="(val) => filterStatusData(projectList)"
      />

      <StatusCards
        v-model="statusFilter"
        :running-count="getFilteredCount('running', projectList)"
        :stopped-count="getFilteredCount('stopped', projectList)"
        :total-count="getFilteredCount('total', projectList)"
      />

      <StatusTable
        :data="statusData"
        @status-change="() => {}"
        @iteration="handleIteration"
      />

      <IterationDialog
        v-model="showIterationDialog"
        ref="iterationDialogRef"
        @success="handleRefresh"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { ClusterStatus } from './types'
import { useProjectDict } from './hooks/useProjectDict'
import { useClusterStatus } from './hooks/useClusterStatus'
import ProjectFilter from './components/ProjectFilter.vue'
import StatusCards from './components/StatusCards.vue'
import StatusTable from './components/StatusTable.vue'
import IterationDialog from './components/IterationDialog.vue'
import { getDepartmentProjects } from '@/api/department'
import { useUserStore } from '@/store/modules/user'

const {
  statusData,
  selectedProject,
  statusFilter,
  getFilteredCount,
  handleRefresh: refreshStatus,
  filterStatusData
} = useClusterStatus()

const { projectList, gitDict, fetchProjectDict, fetchGitDict } = useProjectDict()

const showIterationDialog = ref(false)
const iterationDialogRef = ref()

// 刷新按钮点击事件
const handleRefresh = async () => {
  try {
    loading.value = true
    // 获取当前用户的部门ID
    const userStore = useUserStore()
    const deptId = userStore.userInfo.department?.id
    
    // 获取部门的项目列表
    let projects: string[] = []
    if (deptId) {
      const projectRes = await getDepartmentProjects(deptId)
      if (projectRes.code === 200) {
        projects = projectRes.data
      }
    }
    
    // 调用刷新接口时带上项目列表
    await refreshStatus(projectList.value, projects)
  } catch (error: any) {
    ElMessage.error(error.message || '刷新失败')
  } finally {
    loading.value = false
  }
}

// 处理迭代
const handleIteration = (row: ClusterStatus) => {
  if (iterationDialogRef.value) {
    const gitInfo = gitDict.value.find(item => item.project === row.project)
    if (gitInfo) {
      iterationDialogRef.value.form.namespace = row.namespace
      iterationDialogRef.value.form.git_url = gitInfo.git_url
      showIterationDialog.value = true
    }
  }
}

onMounted(async () => {
  await Promise.all([
    fetchProjectDict(),
    fetchGitDict(),
    refreshStatus(projectList.value)
  ])
})

watch(
  () => selectedProject.value,
  () => {
    filterStatusData(projectList.value)
  }
)

watch(
  () => statusFilter.value,
  () => {
    filterStatusData(projectList.value)
  }
)

const getList = async () => {
  try {
    loading.value = true
    // 获取当前用户的部门ID
    const userStore = useUserStore()
    const deptId = userStore.userInfo.department?.id
    
    // 获取部门的项目列表
    let projects: string[] = []
    if (deptId) {
      const projectRes = await getDepartmentProjects(deptId)
      if (projectRes.code === 200) {
        projects = projectRes.data
      }
    }
    
    // 调用列表接口时带上项目列表
    const res = await getEnvironmentList({
      projects,
      ...queryParams
    })
    
    if (res.code === 200) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.overview-container {
  height: calc(100vh - 120px);
  padding: 24px;
}

.overview-container :deep(.el-card) {
  height: 100%;
}

.overview-container :deep(.el-card__body) {
  height: calc(100% - 73px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2f3d;
}
</style> 