import request from '@/utils/request'

// 获取项目列表
export const getProjectList = () => {
  return request({
    url: '/asset/pro/project/list',
    method: 'get'
  })
}

// 定义项目信息接口
export interface ProjectInfo {
  project: string
  name: string
  description?: string
  status?: number
  created_at?: string
  updated_at?: string
} 