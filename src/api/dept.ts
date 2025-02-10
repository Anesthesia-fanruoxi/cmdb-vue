import request from '@/utils/request'

// 获取部门项目列表
export const getDeptProjects = (deptId: number) => {
  return request.get<ApiResponse<ProjectInfo[]>>(`/system/dept/project`, {
    params: { dept_id: deptId }
  })
}

export interface ProjectInfo {
  project: string
  name: string
  // 如果后端返回的字段名不一样，需要修改这里
  // 例如：可能是 project_code 和 project_name
} 