// API 响应
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 字典查询参数
export interface DictQueryParams {
  name?: string
  code?: string
  page?: number
  page_size?: number
}

// 字典项数据
export interface DictItem {
  id: number
  dict_id: number
  label: string
  value: string
  sort: number
  is_enabled: boolean
}

// 字典项数据响应
export interface DictItemData {
  id: number
  name: string
  code: string
  items: DictItem[]
}

// 字典表单
export interface DictForm {
  dict_name: string
  table_name: string
  key_name: string
  value_name: string
}

// 创建字典参数
export interface CreateDictParams {
  name: string
  code: string
  description?: string
}

// 更新字典参数
export interface UpdateDictParams extends CreateDictParams {
  id: number
}

// 创建字典项参数
export interface CreateDictItemParams {
  dict_id: number
  label: string
  value: string
  sort?: number
  is_enabled?: boolean
}

// 更新字典项参数
export interface UpdateDictItemParams extends CreateDictItemParams {
  id: number
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