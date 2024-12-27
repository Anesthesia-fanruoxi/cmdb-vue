import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ProjectDict, GitDict, ApiResponse } from '../types'
import request from '../../../../../utils/request'
import { getProjectDict } from '@/api/project-dict'
import { getDepartmentProjects } from '@/api/department'
import { useUserStore } from '@/store/modules/user'

export function useProjectDict() {
  const projectList = ref<any[]>([])
  const gitDict = ref<any[]>([])

  const fetchProjectDict = async () => {
    try {
      console.log('Fetching project dictionary...')
      const userStore = useUserStore()
      const deptId = userStore.userInfo.department?.id
      
      let projects: string[] = []
      if (deptId) {
        const projectRes = await getDepartmentProjects(deptId)
        if (projectRes.code === 200) {
          projects = projectRes.data
        }
      }

      const res = await getProjectDict(projects)
      if (res.code === 200) {
        projectList.value = res.data
        console.log('Project List:', projectList.value)
      }
    } catch (error) {
      console.error('获取项目字典失败:', error)
      ElMessage.error('获取项目字典失败')
    }
  }

  const fetchGitDict = async () => {
    try {
      const response = await request({
        url: '/system/dict/query',
        method: 'get',
        params: {
          table_name: 'git_dict'
        }
      })
      if (response && Array.isArray(response.data)) {
        gitDict.value = response.data
      }
    } catch (error) {
      console.error('获取 Git 字典失败:', error)
      ElMessage.error('获取 Git 字典失败')
    }
  }

  return {
    projectList,
    gitDict,
    fetchProjectDict,
    fetchGitDict
  }
} 