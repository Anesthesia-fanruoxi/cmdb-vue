import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ClusterStatus, ApiResponse, ProjectDict } from '../types'
import request from '../../../../../utils/request'
import { getDepartmentProjects } from '@/api/department'
import { useUserStore } from '@/store/modules/user'
import { getClusterStatus, scaleCluster, batchScaleCluster } from '@/api/cluster'

export const useClusterStatus = () => {
  const allStatusData = ref<ClusterStatus[]>([])
  const statusData = ref<ClusterStatus[]>([])
  const selectedProject = ref<string>('all')
  const statusFilter = ref<string>('all')
  const selectedRows = ref<ClusterStatus[]>([])
  const batchLoading = ref(false)

  // 获取筛选后的数量
  const getFilteredCount = (type: string, projectList: ProjectDict[]) => {
    let filteredData = allStatusData.value
    if (selectedProject.value !== 'all') {
      if (selectedProject.value === 'other') {
        const projectCodes = projectList.map(p => p.project)
        filteredData = filteredData.filter(item => !projectCodes.includes(item.project))
      } else {
        filteredData = filteredData.filter(item => item.project === selectedProject.value)
      }
    }
    
    if (type === 'running') {
      return filteredData.filter(item => item.has_pods).length
    } else if (type === 'stopped') {
      return filteredData.filter(item => !item.has_pods).length
    } else {
      return filteredData.length
    }
  }

  // 刷新状态
  const handleRefresh = async (projectList: any[]) => {
    try {
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

      const res = await getClusterStatus({ projects })
      console.log('API Response:', res)
      if (res && Array.isArray(res.data)) {
        // 处理数据，添加必要的字段
        const processedData = res.data.map(item => ({
          ...item,
          project_name: item.project_name || '', // 确保有 project_name 字段
          release_user_name: item.release_user_name || '',
          release_time: item.release_time || '',
          operation_timestamp: item.operation_timestamp || item.action_timestamp || '',
          loading: false
        }))
        
        // 按运行状态和命名空间排序
        allStatusData.value = processedData.sort((a, b) => {
          if (a.has_pods === b.has_pods) {
            return a.namespace.localeCompare(b.namespace)
          }
          return b.has_pods ? 1 : -1
        })
        
        filterStatusData(projectList)
        ElMessage.success('刷新成功')
      }
    } catch (error) {
      console.error('获取状态数据失败:', error)
      ElMessage.error('刷新状态失败')
    }
  }

  // 根据选择的项目筛选数据
  const filterStatusData = (projectList: ProjectDict[]) => {
    let filteredData = allStatusData.value
    
    if (selectedProject.value !== 'all') {
      if (selectedProject.value === 'other') {
        const projectCodes = projectList.map(p => p.project)
        filteredData = filteredData.filter(item => !projectCodes.includes(item.project))
      } else {
        filteredData = filteredData.filter(item => item.project === selectedProject.value)
      }
    }
    
    if (statusFilter.value === 'running') {
      filteredData = filteredData.filter(item => item.has_pods)
    } else if (statusFilter.value === 'stopped') {
      filteredData = filteredData.filter(item => !item.has_pods)
    }
    
    statusData.value = filteredData
  }

  // 处理状态变更
  const handleStatusChange = async (val: boolean, row: ClusterStatus) => {
    row.loading = true
    try {
      const response = await scaleCluster(
        row.namespace, 
        val ? 'scale_up' : 'scale_down'
      )
      if (response.data.code === 200) {
        ElMessage.success(`${val ? '启动' : '停止'}成功`)
        row.has_pods = val
        row.action_time = new Date().toLocaleString()
        row.action_timestamp = Date.now().toString()
        // 更新过滤后的数据
        statusData.value = [...statusData.value]
      }
    } catch (error) {
      console.error('修改状态失败:', error)
      ElMessage.error('修改状态失败')
    } finally {
      row.loading = false
    }
  }

  // 批量操作
  const handleBatchOperation = async (action: 'scale_up' | 'scale_down') => {
    const targetStatus = action === 'scale_up'
    const needOperateRows = selectedRows.value.filter(row => row.has_pods !== targetStatus)
    
    if (needOperateRows.length === 0) {
      ElMessage.warning('所选项目当前状态已经是目标状态，无需操作')
      return
    }

    try {
      needOperateRows.forEach(row => {
        row.loading = true
      })

      batchLoading.value = true
      
      const response = await batchScaleCluster(
        needOperateRows.map(row => row.namespace),
        action
      )

      if (response.data.code === 200) {
        ElMessage.success(`批量${action === 'scale_up' ? '启动' : '停止'}操作已提交`)
      } else {
        throw new Error(response.data?.message || '批量操作失败')
      }
    } catch (error) {
      console.error('批量操作失败:', error)
      ElMessage.error('批量操作失败')
    } finally {
      // 重置所有行的 loading 状态
      needOperateRows.forEach(row => {
        row.loading = false
      })
      batchLoading.value = false
    }
  }

  return {
    allStatusData,
    statusData,
    selectedProject,
    statusFilter,
    selectedRows,
    batchLoading,
    getFilteredCount,
    handleRefresh,
    filterStatusData,
    handleStatusChange,
    handleBatchOperation
  }
} 