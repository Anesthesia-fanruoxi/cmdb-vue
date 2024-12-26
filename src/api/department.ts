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
  return request<null>({
    url: '/system/dept/create',
    method: 'post',
    data
  })
}

// 更新部门
export function updateDepartment(data: UpdateDepartmentParams) {
  return request<null>({
    url: '/api/department/update',
    method: 'post',
    data
  })
}

// 删除部门
export function deleteDepartment(id: number) {
  return request<null>({
    url: '/api/department/delete',
    method: 'post',
    data: { id }
  })
} 