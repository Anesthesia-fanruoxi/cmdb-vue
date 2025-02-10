import { getServerAssets, getServerList, getSSLMonitorList } from './asset'
import type { ServerAsset, ServerInfo, SSLCertificate } from './asset'

// 监控数据类型定义
interface MonitorItem {
  project: string
  instance: string
  cpu: number
  memory: number
  disk: number
}

// 区域映射
const REGION_MAP: Record<string, string> = {
  'cn-hangzhou': '杭州',
  'cn-shanghai': '上海',
  'cn-beijing': '北京',
  'cn-shenzhen': '深圳',
  // ... 其他区域映射
}

// 处理服务器资源数据
export async function getServerStats() {
  const res = await getServerAssets()
  const servers = (res.data || []) as ServerAsset[]
  
  // 按项目分组
  const projectGroups = groupBy(servers, 'project')
  // 按区域分组
  const regionGroups = groupBy(servers, 'region')
  // 按操作系统分组
  const osGroups = groupBy(servers, 'os')
  
  // 计算即将过期的服务器
  const now = new Date()
  const expiringServers = servers.filter((server: ServerAsset) => {
    const expireDate = new Date(server.expire_time)
    const daysLeft = Math.floor((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 30 && daysLeft > 0
  })
  // 只取前10个即将过期的服务器
  .sort((a: ServerAsset, b: ServerAsset) => {
    const aDaysLeft = Math.floor((new Date(a.expire_time).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const bDaysLeft = Math.floor((new Date(b.expire_time).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return aDaysLeft - bDaysLeft
  })
  .slice(0, 10)

  return {
    total: servers.length,
    projectStats: Object.entries(projectGroups).map(([name, items]) => ({
      name,
      count: items.length
    })),
    regionStats: Object.entries(regionGroups).map(([code, items]) => ({
      name: REGION_MAP[code] || code,
      count: items.length
    })),
    osStats: Object.entries(osGroups).map(([name, items]) => ({
      name,
      count: items.length
    })),
    expiringCount: servers.filter((server: ServerAsset) => {
      const expireDate = new Date(server.expire_time)
      const daysLeft = Math.floor((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft <= 30 && daysLeft > 0
    }).length, // 保持总数显示正确
    expiringServers: expiringServers.map((server: ServerAsset) => ({
      project: server.project,
      instance: server.instance_name,
      daysLeft: Math.floor((new Date(server.expire_time).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }))
  }
}

// 处理硬件监控数据
export async function getHardwareStats() {
  const res = await getServerList()
  const servers = (res.data || []) as ServerInfo[]
  
  // 处理监控数据
  const monitorData = servers.map((server: ServerInfo): MonitorItem => ({
    project: server.project,
    instance: server.hostName,
    cpu: Math.max(
      parseFloat(server.cpuLoad1),
      parseFloat(server.cpuLoad5),
      parseFloat(server.cpuLoad15)
    ),
    memory: parseFloat(server.memoryPercent),
    disk: parseFloat(server.diskPercent)
  }))

  return {
    cpuTop10: monitorData
      .sort((a: MonitorItem, b: MonitorItem) => b.cpu - a.cpu)
      .slice(0, 10),
    memoryTop10: monitorData
      .sort((a: MonitorItem, b: MonitorItem) => b.memory - a.memory)
      .slice(0, 10),
    diskTop10: monitorData
      .sort((a: MonitorItem, b: MonitorItem) => b.disk - a.disk)
      .slice(0, 10)
  }
}

// 处理SSL证书数据
export async function getSSLStats() {
  const res = await getSSLMonitorList()
  const certs = (res.data || []) as SSLCertificate[]
  
  // 按状态分组
  const statusGroups = groupBy(certs, 'status')
  
  // 按剩余天数排序
  const sortedByDaysLeft = [...certs].sort((a: SSLCertificate, b: SSLCertificate) => a.days_left - b.days_left)

  return {
    total: certs.length,
    statusStats: Object.entries(statusGroups).map(([status, items]) => ({
      status,
      count: items.length
    })),
    expiringCerts: sortedByDaysLeft
      .filter(cert => cert.days_left <= 30)
      .map(cert => ({
        project: cert.project,
        domain: cert.domain,
        daysLeft: cert.days_left,
        comment: cert.comment
      }))
  }
}

// 工具函数：数组分组
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = String(item[key])
    groups[value] = groups[value] || []
    groups[value].push(item)
    return groups
  }, {} as Record<string, T[]>)
}