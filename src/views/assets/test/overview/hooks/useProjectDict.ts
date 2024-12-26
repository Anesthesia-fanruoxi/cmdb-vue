import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ProjectDict, GitDict, ApiResponse } from '../types'
import request from '../../../../../utils/request'

export const useProjectDict = () => {
  const projectList = ref<ProjectDict[]>([])
  const gitDict = ref<GitDict[]>([])

  const fetchProjectDict = async () => {
    try {
      console.log('Fetching project dictionary...')
      const response = await request({
        url: '/system/dict/query',
        method: 'get',
        params: {
          table_name: 'project_dict'
        }
      })
      console.log('Project Dict Response:', response)
      if (response && Array.isArray(response.data)) {
        projectList.value = response.data
        console.log('Project List:', projectList.value)
      }
    } catch (error) {
      console.error('Fetch Project Dict Error:', error)
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