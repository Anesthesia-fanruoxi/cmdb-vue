import request from '@/utils/request'

// 部门接口的类型定义
export interface Department {
  id: number
  name: string
  code: string
  parent_id: number | null
  description: string
  sort: number
  created_at: string
  updated_at: string
  children?: Department[]
}

// 创建部门的参数类型
export interface CreateDepartmentParams {
  name: string
  code: string
  parent_id?: number | null
  description?: string
  sort?: number
}

// 更新部门的参数类型
export interface UpdateDepartmentParams {
  id: number
  name: string
  code: string
  parent_id?: number | null
  description?: string
  sort?: number
}

// 部门列表响应类型
export interface DepartmentListResponse {
  list: Department[]
  total: number
}

// 获取部门列表
export function getDepartmentList() {
  return request<DepartmentListResponse>({
    url: '/system/dept/list',
    method: 'get'
  })
}

// 创建部门
export function createDepartment(data: CreateDepartmentParams) {
  return request<{
    code: number
    data: null
  }>({
    url: '/system/dept/create',
    method: 'post',
    data: {
      name: data.name,
      code: data.code,
      description: data.description || '',
      parent_id: data.parent_id === undefined ? null : data.parent_id,
      sort: data.sort || 0
    }
  })
}

// 更新部门
export function updateDepartment(data: UpdateDepartmentParams) {
  return request<{
    code: number
    data: null
  }>({
    url: '/system/dept/update',
    method: 'post',
    data: {
      id: data.id,
      name: data.name,
      code: data.code,
      description: data.description || '',
      parent_id: data.parent_id === undefined ? null : data.parent_id,
      sort: data.sort || 0
    }
  })
}

// 删除部门
export function deleteDepartment(id: number) {
  return request<null>({
    url: '/system/dept/delete',
    method: 'post',
    data: { id }
  })
}

// 获取项目字典
export function getProjectDict() {
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
      table_name: 'project_dict'
    }
  })
}

// 获取部门项目配置
export function getDepartmentProjects(deptId: number) {
  return request<{
    code: number
    data: string[]  // 项目编码列表
  }>({
    url: '/system/dept/project',
    method: 'get',
    params: { dept_id: deptId }
  })
}

// 更新部门项目关联
export function updateDepartmentProjects(deptId: number, projectCodes: string[]) {
  return request<{
    code: number
    data: null
  }>({
    url: '/system/dept/project/update',
    method: 'post',
    data: { 
      id: deptId, 
      projects: projectCodes 
    }
  })
} 