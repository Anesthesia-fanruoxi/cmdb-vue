import type { User } from './user'

// 通用 API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// API 请求参数类型
export interface PaginationParams {
  page: number
  page_size: number
}

// API 响应分页数据类型
export interface PaginationResponse<T> {
  list: T[]
  total: number
}

// 用户相关类型
export interface UserInfo {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  avatar?: string
  is_enabled: boolean
  role?: Role
  department?: Department
}

// 角色相关类型
export interface Role {
  id: number
  name: string
  code: string
  description?: string
}

// 部门相关类型
export interface Department {
  id: number
  name: string
  code: string
  parent_id?: number
  children?: Department[]
}

// 用户创建参数
export interface CreateUserParams {
  username: string
  password: string
  nickname: string
  email: string
  phone: string
  role_id: number
  dept_id: number
}

// 用户更新参数
export interface UpdateUserParams extends Omit<CreateUserParams, 'password'> {
  id: number
  password?: string
}

// 导出其他类型...
export * from './dict'

// 分页响应接口
export interface PageResponse<T> {
  list: T[]
  total: number
}

// 组合分页响应类型
export type PageApiResponse<T> = ApiResponse<PageResponse<T>>

// 使用时
interface UserResponse {
  list: User[]
  total: number
}

const res = await getUsers() as ApiResponse<UserResponse> 