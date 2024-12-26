import request from '@/utils/request'

interface LoginForm {
  username: string
  password: string
}

// 登录
export function login(data: LoginForm) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 登出
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
} 