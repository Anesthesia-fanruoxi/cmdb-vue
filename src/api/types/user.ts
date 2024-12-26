import type { BaseFields, Status } from './index'

// 用户信息
export interface User extends BaseFields {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  is_enabled: boolean
  role?: {
    id: number
    name: string
    code: string
  }
  department?: {
    id: number
    name: string
    code: string
  }
}

// 创建用户参数
export interface CreateUserParams {
  username: string
  password: string
  name: string
  email: string
  phone: string
  status: Status
  roles: number[]
  deptId: number
}

// 更新用户参数
export interface UpdateUserParams extends Partial<CreateUserParams> {
  id: number
} 