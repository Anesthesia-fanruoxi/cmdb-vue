import request from '@/utils/request'

// 项目字典接口
export interface ProjectDict {
  id: number
  project: string
  project_name: string
  created_at: string
  updated_at: string
}

export interface ProjectDictQueryParams {
  project?: string
  project_name?: string
  pageNum: number
  pageSize: number
}

// 项目字典API
export function getProjectDictList(params: ProjectDictQueryParams) {
  return request({
    url: '/project/dict/list',
    method: 'get',
    params
  })
}

// 获取项目字典
export function getProjectDict(projects?: string[]) {
  return request<{
    code: number
    data: Array<{
      id: number
      project: string
      project_name: string
      department_id?: number
    }>
  }>({
    url: '/system/dict/query',
    method: 'get',
    params: {
      table_name: 'project_dict',
      projects: projects?.join(',')
    }
  })
}