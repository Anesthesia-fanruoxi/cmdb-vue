// 文档类型
export interface Document {
  id: number
  title: string
  content: string
  category_id: number
  category_name: string
  creator_name: string
  updater_name: string
  version: number
  created_at: string
  updated_at: string
  tags: Tag[]
}

// 文档分类
export interface Category {
  id: number
  name: string
  parent_id: number | null
  children?: Category[]
}

// 文档标签
export interface Tag {
  id: number
  name: string
}

// 文档历史版本
export interface DocumentVersion {
  id: number
  doc_id: number
  title: string
  content: string
  version: number
  updater_name: string
  created_at: string
}

// 查询参数
export interface DocumentQueryParams {
  project_id: number
  category_id?: number
  keyword?: string
  page?: number
  page_size?: number
}

// 创建文档参数
export interface CreateDocumentParams {
  title: string
  content: string
  project_id: number
  category_id: number
  tag_ids: number[]
}

// 更新文档参数
export interface UpdateDocumentParams {
  id: number
  title: string
  content: string
  category_id: number
  tag_ids: number[]
}

export interface RecycleDocument {
  id: number
  doc_id: number
  title: string
  content: string
  project_id: string
  deleter_id: number
  deleted_at: string
  deleter: {
    id: number
    CreatedAt: string
    UpdatedAt: string
    Username: string
    Nickname: string
    Email: string
    Phone: string
    RoleID: number
    IsEnabled: boolean
    dept_id: number
  }
} 