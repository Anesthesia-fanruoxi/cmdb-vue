import type { Role } from '@/api/role'
import type { Department } from '@/api/department'

// 用户接口
export interface User {
  id: number
  username: string
  name: string
  phone: string
  email: string
  status: 'enabled' | 'disabled'
  roles: Role[]
  department: Department
  created_at: string
  updated_at: string
}

// 查询参数接口
export interface UserQueryParams {
  username: string
  name: string
  phone: string
  email: string
  status: string
  pageNum: number
  pageSize: number
}

// 表单数据接口
export interface UserForm {
  id: number
  username: string
  name: string
  phone: string
  email: string
  password?: string
  status: 'enabled' | 'disabled'
  roles: Role[]
  department: Department
} 