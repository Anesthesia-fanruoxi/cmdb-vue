// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message?: string
  data?: T
}

// 集群状态类型
export interface ClusterStatus {
  project: string
  project_name: string
  namespace: string
  has_pods: boolean
  action_user_name?: string
  action_time?: string
  action_timestamp?: string
  operation_timestamp?: string
  action?: 'scale_up' | 'scale_down'
  release_user_name?: string
  release_time?: string
  loading?: boolean
}

// 项目字典类型
export interface ProjectDict {
  project: string
  project_name: string
}

// Git 字典类型
export interface GitDict {
  project: string
  git_url: string
}

// 迭代表单类型
export interface IterationForm {
  namespace: string
  git_url: string
  branch: string
  remark: string
} 