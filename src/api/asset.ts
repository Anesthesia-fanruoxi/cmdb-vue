import request from '@/utils/request'

// 获取线上服务器列表
export const getServerList = () => {
  return request({
    url: '/asset/pro/server/monitor',
    method: 'get'
  })
}

// 获取静态服务器列表
export const getServerAssets = () => {
  return request({
    url: '/asset/pro/server/static',
    method: 'get'
  })
}

// 导入服务器资产
export const importServerAssets = (data: FormData) => {
  return request({
    url: '/asset/pro/server/static/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 定义服务器信息接口
export interface ServerInfo {
  project: string
  hostName: string
  cpuModel: string
  cpuTotal: string
  cpuLoad1: string
  cpuLoad5: string
  cpuLoad15: string
  memoryTotal: string
  memoryUsed: string
  memoryFree: string
  memoryPercent: string
  diskTotal: string
  diskUsed: string
  diskFree: string
  diskPercent: string
  osVersion: string
  kernelVersion: string
  instance: string
  updateTime: string
}

// 定义服务器资产接口
export interface ServerAsset {
  project: string
  instance_id: string
  instance_name: string
  hostname: string
  os: string
  status: string
  region: string
  zone: string
  public_ip: string
  private_ip: string
  elastic_ip: string
  cpu: number
  memory: string
  pay_type: string
  network_type: string
  bandwidth: number
  instance_type: string
  instance_family: string
  image_id: string
  resource_group_id: string
  created_time: string
  expire_time: string
}

// 删除服务器资产
export const deleteServerAsset = (instanceId: string) => {
  return request({
    url: `/asset/pro/server/static/delete?instance_id=${instanceId}`,
    method: 'delete'
  })
}

// 续费服务器资产
export const renewServerAsset = (data: { instance_ids: string[], months: number }) => {
  return request({
    url: '/asset/pro/server/static/renew',
    method: 'post',
    data
  })
}

export interface SSLCertificate {
  project: string
  domain: string
  days_left: number
  comment: string
  status: string
  instance: string
  update_time: string
}

// 获取 SSL 证书监控数据
export function getSSLMonitorList() {
  return request<SSLCertificate[]>({
    url: '/asset/pro/ssl/monitor',
    method: 'get'
  })
}

// 资产总览数据接口
export interface AssetOverview {
  server: {
    total: number
    running: number
    stopped: number
    regions: { name: string; count: number }[]
    types: { name: string; count: number }[]
  }
  hardware: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    alerts: number
    topCpu: { instance: string; usage: number }[]
    topMemory: { instance: string; usage: number }[]
  }
  ssl: {
    total: number
    normal: number
    expiring: number
    expired: number
    expiringDomains: { domain: string; daysLeft: number }[]
  }
}

// 获取资产总览数据
export function getAssetOverview() {
  return request<ApiResponse<AssetOverview>>({
    url: '/asset/overview',
    method: 'get'
  })
}