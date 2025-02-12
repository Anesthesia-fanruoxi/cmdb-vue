import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type {
  Document,
  Category,
  Tag,
  DocumentVersion,
  DocumentQueryParams,
  CreateDocumentParams,
  UpdateDocumentParams
} from '@/types/knowledge'

// 文档相关接口
export function getDocList(params: any) {
  return request<ApiResponse<any>>({
    url: '/knowledge/doc/list',
    method: 'get',
    params
  })
}

export function getDocDetail(id: number) {
  return request<ApiResponse<any>>({
    url: `/knowledge/doc/detail`,
    method: 'get',
    params: { id }
  })
}

export function createDoc(data: any) {
  return request<ApiResponse<any>>({
    url: '/knowledge/doc/create',
    method: 'post',
    data
  })
}

export function updateDoc(data: {
  id: number
  title: string
  content: string
  project_id: string
  version: number
}) {
  return request<ApiResponse<any>>({
    url: '/knowledge/doc/update',
    method: 'put',
    data
  })
}

export function deleteDoc(id: number) {
  return request<ApiResponse<any>>({
    url: '/knowledge/doc/delete',
    method: 'delete',
    params: { id }
  })
}

// 分类相关接口
export function getCategoryList(projectId: number) {
  return request<ApiResponse<any>>({
    url: '/knowledge/category/list',
    method: 'get',
    params: { project_id: projectId }
  })
}

export function createCategory(data: any) {
  return request<ApiResponse<any>>({
    url: '/knowledge/category/create',
    method: 'post',
    data
  })
}

export function updateCategory(data: any) {
  return request<ApiResponse<any>>({
    url: '/knowledge/category/update',
    method: 'put',
    data
  })
}

export function deleteCategory(id: number) {
  return request<ApiResponse<any>>({
    url: '/knowledge/category/delete',
    method: 'delete',
    params: { id }
  })
}

// 标签相关接口
export function getTags() {
  return request<ApiResponse<Tag[]>>({
    url: '/knowledge/tag',
    method: 'get'
  })
}

// 历史版本相关接口
export function getDocumentVersions(docId: number) {
  return request<ApiResponse<DocumentVersion[]>>({
    url: `/knowledge/doc/history`,
    method: 'get',
    params: { doc_id: docId }
  })
}

export function restoreVersion(data: {
  doc_id: number      // 文档ID
  history_id: number  // 历史版本ID
  current_version: {  // 当前版本数据，用于保存到历史记录
    title: string
    content: string
    project_id: string
    version: number
  }
}) {
  return request<ApiResponse<null>>({
    url: '/knowledge/doc/restore',
    method: 'post',
    data
  })
} 