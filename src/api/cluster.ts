import request from '@/utils/request'

// 获取集群状态
export const getClusterStatus = () => {
  return request({
    url: '/asset/test/cluster/status',
    method: 'get'
  })
}

// 单个环境状态切换
export const scaleCluster = (data: { namespace: string; action: 'scale_up' | 'scale_down' }) => {
  return request({
    url: '/asset/test/cluster/scale',
    method: 'post',
    data
  })
}

// 批量环境状态切换
export const scaleBatchCluster = (data: { namespaces: string[]; action: 'scale_up' | 'scale_down' }) => {
  return request({
    url: '/asset/test/cluster/scale/batch',
    method: 'post',
    data
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