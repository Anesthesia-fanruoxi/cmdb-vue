import request from '@/utils/request';

// 获取
export function getMonitorConfig() {
  return request({
    url: '/monitor/config',
    method: 'get'
  });
}

// 更新监控配置
export function updateMonitorConfig(data: any) {
  return request({
    url: '/monitor/config',
    method: 'put',
    data
  });
} 