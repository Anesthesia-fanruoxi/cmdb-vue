import axios, { AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import type { ApiResponse } from '@/types/api'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.code === 200) {
      return res
    }
    
    // 根据不同的错误码显示不同的错误信息
    switch (res.code) {
      case 401:
        ElMessage.error('用户名或密码错误')
        break
      case 403:
        ElMessage.error('没有权限访问')
        break
      case 429:
        ElMessage.error('请求过于频繁，请稍后再试')
        break
      default:
        ElMessage.error(res.message || '请求失败')
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    console.error('响应错误:', error)
    const message = error.response?.data?.message || error.message
    ElMessage.error(message || '网络错误，请稍后重试')
    return Promise.reject(error)
  }
)

export default request