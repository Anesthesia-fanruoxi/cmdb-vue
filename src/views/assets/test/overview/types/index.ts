export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export interface ProjectDict {
  project: string
  project_name: string
  [key: string]: any
}

export interface GitDict {
  project: string
  git_url: string
  [key: string]: any
}

export interface ClusterStatus {
  project: string
  project_name: string
  namespace: string
  has_pods: boolean
  action_user_name?: string
  action_time?: string
  action_timestamp?: string
  action?: string
  release_user_name?: string
  release_time?: string
  operation_timestamp?: string
  loading?: boolean
}

export interface IterationForm {
  namespace: string
  git_url: string
  branch: string
  remark: string
} 