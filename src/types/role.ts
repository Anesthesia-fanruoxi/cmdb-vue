// 角色类型
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  permissions?: string[]
}

// 创建角色请求
export interface CreateRoleRequest {
  name: string
  code: string
  description: string
}

// 更新角色请求
export interface UpdateRoleRequest {
  id: number
  name: string
  description: string
}

// 分页查询参数
export interface RoleQueryParams {
  page: number
  page_size: number
  keyword?: string
}

// 分页响应数据
export interface RolePageResult {
  list: RoleInfo[]
  page: number
  page_size: number
  total: number
}

// 角色信息响应
export interface RoleInfo {
  id: number
  name: string
  code: string
  description: string
} 