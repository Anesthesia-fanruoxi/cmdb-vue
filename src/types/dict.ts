// API 响应
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 字典项
export interface DictItem {
  id: number
  dict_name: string
  table_name: string
  key_name: string
  value_name: string
  nickname: string
  created_at: string
  updated_at: string
}

// 字典表单
export interface DictForm {
  dict_name: string
  table_name: string
  key_name: string
  value_name: string
}

// 字典项数据
export interface DictItemData {
  [key: string]: string | number
}

// 查询参数
export interface DictQueryParams {
  page: number
  page_size: number
  dict_name?: string
}

// 创建字典参数
export interface CreateDictParams {
  dict_name: string
  table_name: string
  key_name: string
  value_name: string
}

// 更新字典参数
export interface UpdateDictParams extends CreateDictParams {
  id: number
}

// 创建字典项参数
export interface CreateDictItemParams {
  table_name: string
  key: string
  value: string
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[]
  pagination: {
    total: number
    page: number
    page_size: number
  }
} 