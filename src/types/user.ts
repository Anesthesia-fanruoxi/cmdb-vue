import type { Role } from './role'
import type { Department } from './department'

// 用户接口
export interface User {
  id: number
  username: string
  nickname?: string
  email?: string
  phone?: string
  is_enabled?: boolean
  role?: Role
  department?: Department
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

export interface CreateUserParams {
  username: string
  password: string
  nickname: string
  phone: string
  email: string
  role_id: number
  dept_id: number
}

export interface UpdateUserParams extends Omit<CreateUserParams, 'username' | 'password'> {
  id: number
  password?: string
}

export type TableUser = User 