// 部门信息
export interface DepartmentInfo {
  id: number
  name: string
  code: string
  parent_id: number | null
  description: string
  sort: number
  created_at: string
  updated_at: string
}

// 创建部门请求
export interface CreateDepartmentRequest {
  name: string
  code: string
  parent_id?: number | null
  description?: string
  sort?: number
}

// 更新部门请求
export interface UpdateDepartmentRequest {
  id: number
  name?: string
  description?: string
  parent_id?: number | null
  sort?: number
}

// 查询参数
export interface DepartmentQueryParams {
  keyword?: string
}

// 响应数据
export interface DepartmentListResponse {
  list: DepartmentInfo[]
} 