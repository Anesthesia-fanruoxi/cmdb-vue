import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      // 确保 headers 对象存在
      config.headers = config.headers || {}
      // 设置 Authorization 头
      config.headers.Authorization = `Bearer ${token}`
      // 设置 token 头
      config.headers.token = token
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
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

export default service