import type { ApiResponse } from '@/types/api'
import type { 
  DictQueryParams,
  DictItem,
  DictItemData,
  CreateDictParams,
  UpdateDictParams,
  CreateDictItemParams,
  UpdateDictItemParams
} from '@/types/dict'
import request from '@/utils/request'

// 获取字典列表
export function getDicts(params: DictQueryParams) {
  return request<ApiResponse<DictItemData[]>>({
    url: '/system/dict/list',
    method: 'get',
    params
  })
}

// 获取字典项数据
export const getDictItems = (table_name: string) => {
  return request.get<ApiResponse<DictItemData[]>>('/system/dict/query', {
    params: { table_name }
  })
}

// 创建字典
export const createDict = (data: CreateDictParams) => {
  return request.post<ApiResponse<null>>('/system/dict/create', data)
}

// 更新字典
export const updateDict = (data: UpdateDictParams) => {
  return request.put<ApiResponse<null>>('/system/dict/update', data)
}

// 删除字典
export const deleteDict = (id: number) => {
  return request.delete<ApiResponse<null>>(`/system/dict/delete/${id}`)
}

// 创建字典项
export const createDictItem = (data: CreateDictItemParams) => {
  return request.post<ApiResponse<null>>('/system/dict/item/create', data)
}

// 删除字典项
export const deleteDictItem = (data: { table_name: string; key: string }) => {
  return request.post<ApiResponse<null>>('/system/dict/item/delete', data)
}

// 获取字典数据
export const getDictData = (dictType: string) => {
  return request({
    url: `/system/dict/data/type/${dictType}`,
    method: 'get'
  })
}

// 字典数据接口
export interface DictData {
  dictLabel: string
  dictValue: string
  [key: string]: any
} 