<template>
  <div class="server-container">
    <div class="filter-stats">
      <div class="left-section">
        <el-radio-group
          v-model="filterProject"
          @change="handleFilter"
          class="filter-radio-group"
        >
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button
            v-for="project in sortedProjects"
            :key="project"
            :label="project"
          >
            {{ project }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="right-section">
        <el-card class="stat-card">
          <template #header>
            <div class="stat-header">总数</div>
          </template>
          <div class="stat-card-content" @click="handleFilterAll">
            <div class="stat-value">{{ statistics.total }}</div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <template #header>
            <div class="stat-header">正常运行</div>
          </template>
          <div class="stat-card-content" @click="handleFilterNormal">
            <div class="stat-value normal">{{ statistics.normal }}</div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <template #header>
            <div class="stat-header">即将到期</div>
          </template>
          <div class="stat-card-content" @click="handleFilterWarning">
            <div class="stat-value warning">{{ statistics.warning }}</div>
          </div>
        </el-card>
      </div>
    </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>服务器管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="showImportDialog">导入数据</el-button>
            <el-button type="primary" @click="handleRefresh">刷新</el-button>
          </div>
        </div>
      </template>

      <!-- 表格内容 -->
      <el-table 
        :data="filteredData" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        height="calc(100vh - 380px)"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="project" label="项目名称" min-width="120" />
        <el-table-column prop="instance_id" label="实例ID" min-width="120" />
        <el-table-column prop="instance_name" label="实例名称" min-width="120" />
        <el-table-column prop="hostname" label="主机名" min-width="120" />
        <el-table-column prop="os" label="操作系统" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'Running' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="region" label="地域" />
        <el-table-column prop="zone" label="可用区" />
        <el-table-column prop="public_ip" label="公网IP" min-width="120" />
        <el-table-column prop="private_ip" label="私网IP" min-width="120" />
        <el-table-column prop="elastic_ip" label="弹性IP" min-width="120" />
        <el-table-column label="配置信息" align="center">
          <el-table-column prop="cpu" label="CPU" />
          <el-table-column prop="memory" label="内存" />
          <el-table-column prop="instance_type" label="规格" min-width="120" />
        </el-table-column>
        <el-table-column prop="pay_type" label="付费类型" min-width="100" />
        <el-table-column prop="network_type" label="网络类型" min-width="100" />
        <el-table-column prop="created_time" label="创建时间" min-width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.created_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="expire_time" label="到期时间" min-width="150">
          <template #default="{ row }">
            <span :class="{ 'expire-warning': isExpiringSoon(row.expire_time) }">
              {{ formatDateTime(row.expire_time) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="danger" 
                link
                @click="handleDelete(row)"
              >
                删除
              </el-button>
              <el-button 
                type="primary" 
                link
                @click="handleRenew([row.instance_id])"
              >
                续费
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作按钮 -->
      <div class="batch-actions" v-if="selectedRows.length > 0">
        <el-button 
          type="primary" 
          @click="handleRenew(selectedRows.map(row => row.instance_id))"
        >
          批量续费
        </el-button>
      </div>
    </el-card>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入服务器数据"
      width="500px"
    >
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="项目" required>
          <el-select
            v-model="importForm.project"
            filterable
            placeholder="请选择项目"
            class="filter-select"
          >
            <el-option
              v-for="item in projectList"
              :key="item.project"
              :label="item.name"
              :value="item.project"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="CSV文件" required>
          <el-upload
            class="csv-uploader"
            action=""
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            accept=".csv"
            @change="handleFileChange"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传CSV格式的文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImport" :disabled="!canImport">
            确认导入
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 续费对话框 -->
    <el-dialog
      v-model="renewDialogVisible"
      title="续费服务器"
      width="400px"
    >
      <el-form :model="renewForm" label-width="100px">
        <el-form-item label="续费时长">
          <el-select v-model="renewForm.months">
            <el-option :value="1" label="1个月" />
            <el-option :value="3" label="3个月" />
            <el-option :value="6" label="6个月" />
            <el-option :value="12" label="1年" />
            <el-option :value="24" label="2年" />
            <el-option :value="36" label="3年" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRenew">
            确认续费
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getServerAssets, 
  importServerAssets,
  deleteServerAsset,
  renewServerAsset,
  type ServerAsset 
} from '@/api/asset'
import { getDeptProjects, type ProjectInfo } from '@/api/dept'
import { useUserStore } from '@/store/modules/user'
import { Monitor, CircleCheckFilled, WarningFilled, Grid, Folder } from '@element-plus/icons-vue'
import FilterStatsCard from '@/components/FilterStatsCard/index.vue'

interface Statistics {
  total: number
  normal: number
  warning: number
}

const loading = ref(false)
const tableData = ref<ServerAsset[]>([])
const filteredData = ref<ServerAsset[]>([])
const importDialogVisible = ref(false)
const importForm = ref({
  project: '',
  file: null as File | null
})

const userStore = useUserStore()
const projectList = ref<ProjectInfo[]>([])
const filterProject = ref('')
const statistics = ref<Statistics>({
  total: 0,
  normal: 0,
  warning: 0
})

// 选中的行
const selectedRows = ref<ServerAsset[]>([])

// 续费相关
const renewDialogVisible = ref(false)
const renewInstanceIds = ref<string[]>([])
const renewForm = ref({
  months: 12
})

// 获取部门项目列表
const fetchDeptProjects = async () => {
  const userInfo = userStore.userInfo
  
  // 确保有部门ID
  if (!userInfo?.department?.id) {
    ElMessage.error('获取部门信息失败')
    return
  }

  try {
    const res = await getDeptProjects(userInfo.department.id)
    // 转换数据格式
    projectList.value = res.data.map(code => ({
      project: code,
      name: code
    }))
  } catch (error: any) {
    ElMessage.error(error.message || '获取项目列表失败')
  }
}

// 是否可以导入
const canImport = computed(() => {
  return importForm.value.project.trim() && importForm.value.file
})

// 显示导入对话框
const showImportDialog = () => {
  importForm.value = {
    project: '',
    file: null
  }
  importDialogVisible.value = true
  fetchDeptProjects() // 打开对话框时获取项目列表
}

// 处理文件选择
const handleFileChange = (uploadFile: any) => {
  if (!uploadFile) return
  
  const file = uploadFile.raw
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    ElMessage.error('请上传CSV文件')
    importForm.value.file = null
    return
  }

  importForm.value.file = file
}

// 处理导入
const handleImport = async () => {
  if (!importForm.value.file) {
    ElMessage.warning('请选择CSV文件')
    return
  }
  
  try {
    loading.value = true
    
    // 创建 FormData
    const formData = new FormData()
    formData.append('file', importForm.value.file)
    formData.append('project', importForm.value.project)
    
    // 调用导入接口
    const res = await importServerAssets(formData)
    
    ElMessage.success(`导入成功，共导入 ${res.data.count} 条数据`)
    
    // 关闭对话框
    importDialogVisible.value = false
    
    // 刷新列表
    await fetchServerList()
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  } finally {
    loading.value = false
  }
}

// 获取唯一的项目列表
const projectOptions = computed(() => {
  const projects = new Set(tableData.value.map(item => item.project))
  return Array.from(projects).map(project => ({
    label: project,
    value: project
  }))
})

// 获取排序后的项目列表
const sortedProjects = computed(() => {
  const projects = Array.from(new Set(tableData.value.map(item => item.project)))
  return projects.sort((a, b) => a.localeCompare(b))
})

// 检查是否即将到期（15天内）
const isExpiringSoon = (expireTime: string) => {
  if (!expireTime) return false
  const expireDate = new Date(expireTime)
  const now = new Date()
  const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 15
}

// 更新统计数据
const updateStatistics = () => {
  const data = filteredData.value
  statistics.value = {
    total: data.length,
    normal: data.filter(item => !isExpiringSoon(item.expire_time)).length,
    warning: data.filter(item => isExpiringSoon(item.expire_time)).length
  }
}

// 处理筛选
const handleFilter = () => {
  if (!filterProject.value) {
    filteredData.value = tableData.value
  } else {
    filteredData.value = tableData.value.filter(
      item => item.project === filterProject.value
    )
  }
  updateStatistics()
}

// 获取服务器列表
const fetchServerList = async () => {
  try {
    loading.value = true
    const res = await getServerAssets()
    tableData.value = res.data
    filteredData.value = res.data
    updateStatistics()
  } catch (error: any) {
    ElMessage.error(error.message || '获取数据失败')
    tableData.value = []
    filteredData.value = []
    updateStatistics()
  } finally {
    loading.value = false
  }
}

// 刷新数据
const handleRefresh = async () => {
  await fetchServerList()
}

// 格式化时间
const formatDateTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

// 处理卡片点击筛选
const handleFilterAll = () => {
  filterProject.value = ''
  handleFilter()
}

const handleFilterNormal = () => {
  filteredData.value = tableData.value.filter(item => !isExpiringSoon(item.expire_time))
  updateStatistics()
}

const handleFilterWarning = () => {
  filteredData.value = tableData.value.filter(item => isExpiringSoon(item.expire_time))
  updateStatistics()
}

// 处理选择变化
const handleSelectionChange = (rows: ServerAsset[]) => {
  selectedRows.value = rows
}

// 处理删除
const handleDelete = async (row: ServerAsset) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除服务器 ${row.instance_name} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteServerAsset(row.instance_id)
    ElMessage.success('删除成功')
    await fetchServerList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 处理续费
const handleRenew = (instanceIds: string[]) => {
  renewInstanceIds.value = instanceIds
  renewDialogVisible.value = true
}

// 确认续费
const confirmRenew = async () => {
  try {
    await renewServerAsset({
      instance_ids: renewInstanceIds.value,
      months: renewForm.value.months
    })
    ElMessage.success('续费成功')
    renewDialogVisible.value = false
    await fetchServerList()
  } catch (error: any) {
    ElMessage.error(error.message || '续费失败')
  }
}

const statsData = computed(() => [
  {
    label: '总数',
    value: statistics.value.total,
    icon: 'Monitor',
    type: 'primary',
    action: 'all'
  },
  {
    label: '正常运行',
    value: statistics.value.normal,
    icon: 'CircleCheckFilled',
    type: 'success',
    action: 'normal'
  },
  {
    label: '即将到期',
    value: statistics.value.warning,
    icon: 'WarningFilled',
    type: 'warning',
    action: 'warning'
  }
])

const handleStatAction = (action: string) => {
  switch (action) {
    case 'all':
      handleFilterAll()
      break
    case 'normal':
      handleFilterNormal()
      break
    case 'warning':
      handleFilterWarning()
      break
  }
}

// 初始化加载数据
onMounted(() => {
  fetchServerList()
})
</script>

<style scoped>
.server-container {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

:deep(.el-upload) {
  width: auto;
}

:deep(.el-table) {
  margin-top: 20px;
}

.csv-uploader {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-list) {
  margin-top: 10px;
}

.el-upload__tip {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.filter-select {
  width: 100%;
}

.filter-stats {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-shrink: 0;
}

.left-section {
  margin-bottom: 0;
  overflow-x: auto;
  flex: 1;
}

.right-section {
  display: flex;
  gap: 16px;
  width: 300px;
  flex-shrink: 0;
}

.stat-card {
  flex: 1;
  cursor: pointer;
  transition: all 0.3s;
  height: 50px;
  border: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-header {
  font-size: 13px;
  color: var(--el-text-color-regular);
  text-align: center;
}

:deep(.el-card__header) {
  padding: 4px 8px;
  background-color: var(--el-fill-color-light);
  flex-shrink: 0;
}

:deep(.el-card__body) {
  flex: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card-content {
  text-align: center;
  background-color: white;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  line-height: 1;
}

.normal {
  color: var(--el-color-success);
}

.warning {
  color: var(--el-color-warning);
}

.expire-warning {
  color: var(--el-color-danger);
}

.batch-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-table) {
  border-radius: 4px;
  height: 100%;
  flex: 1;
}

:deep(.el-table__body-wrapper) {
  overflow-x: hidden;
}

:deep(.el-table__body-wrapper:hover) {
  overflow-x: auto;
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

:deep(.el-icon) {
  font-size: 16px;
}
</style> 