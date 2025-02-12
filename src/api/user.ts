import request from '@/utils/request'
import type { Role } from './role'
import type { Department } from './department'
import type { ApiResponse } from '@/types/api'

// 用户信息响应类型
export interface UserInfo {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  is_enabled: boolean
  role: {
    id: number
    name: string
    code: string
  }
  department: {
    id: number
    name: string
    code: string
  }
}

// 用户查询参数
export interface UserQueryParams {
  username: string
  name: string
  phone: string
  email: string
  status: string
  dept_id?: number
}

// 用户列表项类型
export interface UserListItem {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  is_enabled: boolean
  role: {
    id: number
    name: string
    code: string
  }
  department: {
    id: number
    name: string
    code: string
    parent_id: number | null
  }
}

// 创建用户的参数类型
export interface CreateUserParams {
  username: string
  nickname: string
  phone: string
  email: string
  password: string
  is_enabled: boolean
  role_id: number
  dept_id?: number
}

// 更新用户的参数类型
export interface UpdateUserParams {
  id: number
  nickname?: string
  phone?: string
  email?: string
  password?: string
  is_enabled?: boolean
  role_id?: number
  dept_id?: number
}

// 用户列表响应类型
export interface UserListResponse {
  list: UserListItem[]
}

// 登录参数
export interface LoginParams {
  username: string
  password: string
}

// 登录
export function login(data: LoginParams) {
  return request<{ token: string }>({
    url: '/system/user/login',
    method: 'post',
    data
  })
}

// 获取当前用户信息
export function getUserInfo() {
  return request<UserInfo>({
    url: '/system/user/detail',
    method: 'get'
  })
}

// 用户登出
export function logout() {
  return request<null>({
    url: '/system/user/logout',
    method: 'post'
  })
}

// 获取用户列表
export function getUserList(params: UserQueryParams) {
  return request<UserListResponse>({
    url: '/system/user/list',
    method: 'get',
    params
  })
}

// 创建用户
export function createUser(data: CreateUserParams) {
  return request<null>({
    url: '/system/user/create',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(data: UpdateUserParams) {
  return request<null>({
    url: '/system/user/update',
    method: 'post',
    data
  })
}

// 删除用户
export function deleteUser(id: number) {
  return request<null>({
    url: '/system/user/delete',
    method: 'post',
    data: { id }
  })
}

// 更新个人信息
export function updateProfile(data: UpdateUserParams) {
  return request<ApiResponse<User>>({
    url: '/user/profile',
    method: 'post',
    data
  })
}

// 更新用户状态
export function updateUserStatus(id: number, is_enabled: 0 | 1) {
  return request<null>({
    url: '/system/user/update',
    method: 'post',
    data: { 
      id,
      is_enabled
    }
  })
}
