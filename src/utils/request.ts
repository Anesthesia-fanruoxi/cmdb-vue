import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'

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
  response => {
    const res = response.data
    if (res.code === 200) {
      return res
    }
    
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    console.error('响应错误:', error)
    if (error.response?.status === 401) {
      // token 过期或无效，跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default request