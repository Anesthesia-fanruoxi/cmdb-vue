// 分页参数
export interface PageParams {
  page: number
  size: number
}

// 分页响应
export interface PageResult<T> {
  list: T[]
  total: number
}

// 通用响应状态
export type Status = 'enabled' | 'disabled'

// 基础字段
export interface BaseFields {
  id: number
  createTime: string
  updateTime: string
} 