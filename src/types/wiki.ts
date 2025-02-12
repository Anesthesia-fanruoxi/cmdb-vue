// Wiki 空间
export interface WikiSpace {
  id: number
  label: string
  type: 'space'
  children?: (WikiSpace | WikiPage)[]
}

// Wiki 页面
export interface WikiPage {
  id: number
  label: string
  type: 'page'
  content: string
  author?: string
  updateTime?: string
  views?: number
}

// 版本历史
export interface WikiVersion {
  id: number
  version: string
  createTime: string
  author: string
  comment: string
  content: string
}

// 表单数据
export interface WikiFormData {
  id: number | null
  type: 'space' | 'page'
  title: string
  content: string
  parentId: number | null
}

// 移动表单数据
export interface MoveFormData {
  targetSpace: number | null
} 