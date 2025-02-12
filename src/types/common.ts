// 通用分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 通用表格行
export interface TableRow {
  id: number
  [key: string]: any
}

// 通用表单规则
export interface FormRules {
  [key: string]: {
    required?: boolean
    message?: string
    trigger?: 'blur' | 'change'
    min?: number
    max?: number
    type?: string
  }[]
} 