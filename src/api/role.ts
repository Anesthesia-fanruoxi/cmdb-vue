import request from '@/utils/request'

// 角色接口的类型定义
export interface Role {
  id: number
  name: string
  code: string
  description: string
}

// 创建角色的参数类型
export interface CreateRoleParams {
  name: string
  code: string
  description: string
}

// 更新角色的参数类型
export interface UpdateRoleParams {
  id: number
  name: string
  description: string
}

// 角色列表响应类型
export interface RoleListResponse {
  list: Role[]
  total: number
}

// 获取角色列表
export function getRoleList() {
  return request<RoleListResponse>({
    url: '/system/role/list',
    method: 'get'
  })
}

// 创建角色
export function createRole(data: CreateRoleParams) {
  return request<null>({
    url: '/system/role/create',
    method: 'post',
    data
  })
}

// 更新角色
export function updateRole(data: UpdateRoleParams) {
  return request<null>({
    url: '/system/role/update',
    method: 'post',
    data
  })
}

// 删除角色
export function deleteRole(id: number) {
  return request<null>({
    url: '/system/role/delete',
    method: 'post',
    data: { id }
  })
} 