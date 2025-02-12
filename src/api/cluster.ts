import request from '@/utils/request'

// 通用的项目参数接口
interface ProjectParams {
  projects: string[]
}

// 获取集群状态
export function getClusterStatus(params: ProjectParams) {
  return request({
    url: '/asset/test/cluster/status',
    method: 'get',
  })
}

// 修改集群状态（扩缩容）
export function scaleCluster(namespace: string, action: 'scale_up' | 'scale_down') {
  return request.post<any>('/asset/test/cluster/scale', {
    namespace,
    action
  })
}

// 批量修改集群状态
export function batchScaleCluster(namespaces: string[], action: 'scale_up' | 'scale_down') {
  return request.post<any>('/cluster/scale/batch', {
    namespaces,
    action
  })
}

// 迭代操作
export const iterateCluster = (data: { namespace: string; branch: string; remark: string; git_url: string }) => {
  return request({
    url: '/asset/test/cluster/iteration',
    method: 'post',
    data
  })
}

// 获取集群服务列表
export function getClusterServices(params: { projects: string[] }) {
  return request({
    url: '/asset/test/cluster/services',
    method: 'get',
    params
  })
} 