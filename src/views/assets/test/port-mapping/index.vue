<template>
  <div class="port-mapping-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>端口映射关系</span>
          <el-button-group>
            <el-button type="primary" @click="handleRefresh">刷新</el-button>
            <el-button type="success" @click="handleExport">导出</el-button>
          </el-button-group>
        </div>
      </template>

      <!-- 搜索过滤区域 -->
      <div class="filter-section">
        <div class="project-filter">
          <el-radio-group v-model="filterForm.project" @change="handleProjectChange" class="radio-group">
            <el-radio label="all" class="radio-item">全部</el-radio>
            <el-radio 
              v-for="item in projectList" 
              :key="item.project" 
              :label="item.project"
              class="radio-item"
            >
              {{ item.project_name }}
            </el-radio>
            <!-- <el-radio label="other" class="radio-item">其他</el-radio> -->
          </el-radio-group>
        </div>
        <div class="type-filter">
          <el-radio-group :model-value="filterForm.type" @update:model-value="(val) => filterForm.type = val" @change="handleTypeChange" class="radio-group">
            <el-radio label="middleware" class="radio-item">中间件</el-radio>
            <el-radio label="service" class="radio-item">服务</el-radio>
          </el-radio-group>
        </div>
        <div v-if="filterForm.type" class="namespace-filter">
          <el-radio-group :model-value="filterForm.namespace" @update:model-value="(val) => filterForm.namespace = val" @change="handleNamespaceChange" class="radio-group">
            <el-radio 
              v-for="namespace in namespaceList" 
              :key="namespace"
              :label="namespace.namespace"
              class="radio-item"
            >
              {{ namespace.namespace }}
            </el-radio>
          </el-radio-group>
        </div>
        <el-form v-if="filterForm.namespace" :inline="true" :model="filterForm">
          <el-form-item label="服务名称">
            <el-input 
              v-model="filterForm.serviceName" 
              placeholder="输入服务名称" 
              clearable 
              @input="handleNamespaceChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 服务映射关系表格 -->
      <el-table v-if="filterForm.type === 'service'" :data="tableData" style="width: 100%">
        <el-table-column prop="project_name" label="项目名称" min-width="100" />
        <el-table-column prop="namespace" label="命名空间" min-width="120" />
        <el-table-column prop="service_name" label="服务名称" min-width="120" />
        <el-table-column label="容器debug端口" min-width="120">
          <template #default>
            <span>5000</span>
          </template>
        </el-table-column>
        <el-table-column label="映射debug端口" min-width="120">
          <template #default="{ row }">
            <el-tag 
              type="danger" 
              class="port-tag" 
              @dblclick="handlePortClick(row.debug_port)"
            >
              {{ row.debug_port || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="容器服务端口" min-width="120">
          <template #default>
            <span>8080</span>
          </template>
        </el-table-column>
        <el-table-column label="映射服务端口" min-width="120">
          <template #default="{ row }">
            <el-tag 
              type="success" 
              class="port-tag" 
              @dblclick="handlePortClick(row.service_port)"
            >
              {{ row.service_port || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="容器jvm端口" min-width="120">
          <template #default>
            <span>8081</span>
          </template>
        </el-table-column>
        <el-table-column label="映射jvm端口" min-width="120">
          <template #default="{ row }">
            <el-tag 
              type="warning" 
              class="port-tag" 
              @dblclick="handlePortClick(row.jvm_port)"
            >
              {{ row.jvm_port || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" min-width="100">
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
																		
									   
							  
					 
						  
      </el-table>

      <!-- 中间件映射关系表格 -->
      <el-table v-else-if="filterForm.type === 'middleware'" :data="tableData" style="width: 100%">
        <el-table-column prop="project_name" label="项目名称" min-width="100" />
        <el-table-column prop="namespace" label="命名空间" min-width="120" />
        <el-table-column prop="service_name" label="中间件名称" min-width="120" />
        <el-table-column label="容器务端口" min-width="120">
          <template #default="{ row }">
            <span>{{ row.ports[0]?.target_port || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="映射服务端口" min-width="120">
          <template #default="{ row }">
            <el-tag 
              type="success" 
              class="port-tag" 
              @dblclick="copyPortAddress(row.ports[0]?.node_port)"
            >
              {{ row.ports[0]?.node_port || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户名" min-width="120">
          <template #default="{ row }">
            <el-tag 
              type="info" 
              class="port-tag" 
              @dblclick="handleUsernameClick(row.service_name)"
            >
              {{ getMiddlewareUsername(row.service_name) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="密码" min-width="120">
          <template #default="{ row }">
<!--            <el-tag -->
<!--              type="warning" -->
<!--              class="port-tag" -->
<!--              @dblclick="handlePasswordClick(row.service_name)"-->
<!--            >-->
<!--              ******-->
<!--            </el-tag>-->
          </template>
        </el-table-column>
        <el-table-column label="访问地址" min-width="200">
          <template #default="{ row }">
            <template v-if="row.service_name === 'nacos'">
              <el-link
                type="primary"
                :href="`http://192.168.3.10:${row.ports[0]?.node_port}/nacos`"
                target="_blank"
              >
                http://192.168.3.10:{{ row.ports[0]?.node_port }}/nacos
              </el-link>
            </template>
            <template v-else-if="row.service_name === 'rabbitmq-server'">
              <el-link
                type="primary"
                :href="`http://192.168.3.10:${row.ports[0]?.node_port}`"
                target="_blank"
              >
                http://192.168.3.10:{{ row.ports[0]?.node_port }}
              </el-link>
            </template>
            <template v-else>
              -
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { getDeptProjects } from '@/api/department'
import { useUserStore } from '@/store/modules/user'
import { getClusterServices } from '@/api/cluster'

interface Project {
  project: string
  project_name: string
}

interface PortMapping {
  project: string
  project_name: string
  namespace: string
  service_name: string
  type: string
  ports: {
    port: number
    target_port: number
    node_port: number
    protocol: string
  }[]
  debug_port?: number
  service_port?: number
  jvm_port?: number
				  
}

interface Namespace {
  namespace: string
  [key: string]: any
}

const loading = ref(false)
const tableData = ref<PortMapping[]>([])
const allData = ref<PortMapping[]>([])
const projectList = ref<Project[]>([])
const namespaceList = ref<Namespace[]>([])

const filterForm = reactive({
  project: 'all',
  type: '',
  namespace: '',
  serviceName: ''
})

// 获取所有端口映射数据
const fetchAllPortMappings = async () => {
  try {
    loading.value = true
    // 获取当前用户的部门ID
    const userStore = useUserStore()
    const deptId = userStore.userInfo.department?.id
    
    // 获取部门的项目列表
    let projects: string[] = []
    if (deptId) {
      const projectRes = await getDeptProjects(deptId)
      if (projectRes.code === 200) {
        projects = projectRes.data
      }
    }

    // 使用新的API函数替换原有的请求
    const res = await getClusterServices({ projects })
    allData.value = res.data
    // 从返回数据中提取项目列表
    const uniqueProjects = new Set(allData.value.map(item => item.project))
    projectList.value = Array.from(uniqueProjects).map(project => {
      const item = allData.value.find(d => d.project === project)
      return {
        project,
        project_name: item?.project_name || project
      }
    })
  } catch (error) {
    console.error('获取端口映射数据失败:', error)
    ElMessage.error('获取端口映射数据失败')
  } finally {
    loading.value = false
  }
}

// 处理项目选择变化
const handleProjectChange = (value: string | number | boolean | undefined) => {
  if (typeof value === 'string') {
    filterForm.type = ''
    filterForm.namespace = ''
    namespaceList.value = []
    tableData.value = []
  }
}

// 处理类型选择变化
const handleTypeChange = (value: string | number | boolean | undefined) => {
  if (typeof value === 'string') {
    filterForm.namespace = ''
    namespaceList.value = []
    tableData.value = []
    
    if (value) {
      let filteredData = allData.value
      if (filterForm.project !== 'all') {
        filteredData = filteredData.filter(item => 
          filterForm.project === 'other'
            ? !projectList.value.map(p => p.project).includes(item.project)
            : item.project === filterForm.project
        )
      }

      const namespaces = new Set(
        filteredData
          .filter(item => 
            value === 'middleware' 
              ? item.namespace.includes('middleware')
              : item.namespace.includes('service')
          )
          .map(item => item.namespace)
      )
      
      namespaceList.value = Array.from(namespaces).map(ns => ({ namespace: ns }))
    }
  }
}

// 处理命名空间选择变化
const handleNamespaceChange = () => {
  if (!filterForm.namespace) {
    tableData.value = []
    return
  }

  let filteredData = allData.value

  if (filterForm.project !== 'all') {
    filteredData = filteredData.filter(item => 
      filterForm.project === 'other'
        ? !projectList.value.map(p => p.project).includes(item.project)
        : item.project === filterForm.project
    )
  }

  if (filterForm.type) {
    filteredData = filteredData.filter(item => 
      filterForm.type === 'middleware'
        ? item.namespace.includes('middleware')
        : item.namespace.includes('service')
    )
  }

  filteredData = filteredData.filter(item => item.namespace === filterForm.namespace)
  
  if (filterForm.type === 'service') {
    filteredData = filteredData.map(item => {
      const ports = item.ports || []
      return {
        ...item,
        debug_port: ports.find(p => p.port === 5000)?.node_port,
        service_port: ports.find(p => p.port === 8080)?.node_port,
        jvm_port: ports.find(p => p.port === 8081)?.node_port
      }
    })
  }
  
  if (filterForm.serviceName) {
    filteredData = filteredData.filter(item => 
      item.service_name.toLowerCase().includes(filterForm.serviceName.toLowerCase())
    )
  }
  
  tableData.value = filteredData
}

// 重置表单
const resetForm = () => {
  filterForm.project = 'all'
  filterForm.type = ''
  filterForm.namespace = ''
  filterForm.serviceName = ''
  namespaceList.value = []
  tableData.value = []
}

// 处理刷新
const handleRefresh = () => {
  fetchAllPortMappings()
}

// 处理导出
const handleExport = () => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中')
}

// 获取中间件用户名
const getMiddlewareUsername = (serviceName: string) => {
  switch (serviceName) {
    case 'nacos':
      return 'nacos'
    case 'rabbitmq-server':
      return 'admin'
    case 'mysql':
      return 'root'
    case 'mongodb':
      return 'admin'
    default:
      return '-'
  }
}

// 获取中间件密码
const getMiddlewarePassword = (serviceName: string) => {
  switch (serviceName) {
    case 'nacos':
      return 'nacos'
    case 'rabbitmq-server':
      return 'admin123'
    case 'mysql':
      return 'admin123'
    case 'redis':
      return 'admin123'
    case 'mongodb':
      return 'admin123'
    default:
      return ''
  }
}

// 复制文本
const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => ElMessage.success('复制成功'))
    .catch(() => ElMessage.error('复制失败'))
}

// 复制端口地址
const copyPortAddress = (port: number) => {
  copyText(`192.168.3.10:${port}`)
}

// 处理用户名点击
const handleUsernameClick = (serviceName: string) => {
  const username = getMiddlewareUsername(serviceName)
  if (username === '-') {
    ElMessage.info('无需复制')
    return
  }
  copyText(username)
}

// 处理密码点击
const handlePasswordClick = (serviceName: string) => {
  const password = getMiddlewarePassword(serviceName)
  if (!password) {
    ElMessage.info('无需复制')
    return
  }
  copyText(password)
}

// 处理端口点击
const handlePortClick = (port: number | undefined) => {
  if (!port) {
    ElMessage.info('无需复制')
    return
  }
  copyPortAddress(port)
}

onMounted(() => {
  fetchAllPortMappings()
})
</script>

<style scoped>
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
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

:deep(.el-radio__label) {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #1677ff;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #1677ff;
  border-color: #1677ff;
}

:deep(.el-radio__inner:hover) {
  border-color: #1677ff;
}

.type-filter {
  margin-top: 16px;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.namespace-filter {
  margin-top: 16px;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.port-mapping-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.port-mapping-item:last-child {
  margin-bottom: 0;
}

.port-text {
  font-size: 13px;
  color: #606266;
}

.port-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.port-tag:hover {
  opacity: 0.8;
}

.no-copy {
  color: #909399;
  font-size: 13px;
}

				
																											
				  
 
</style> 