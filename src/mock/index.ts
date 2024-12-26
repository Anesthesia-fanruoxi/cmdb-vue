// 服务器列表模拟数据
export const serverList = [
  {
    id: 1,
    name: 'Web-Server-01',
    ip: '192.168.1.101',
    type: 'web',
    status: 'running',
    os: 'Ubuntu 20.04 LTS',
    cpu: 'Intel Xeon E5-2680 v4',
    memory: '32GB',
    disk: '2TB SSD',
    location: '北京机房'
  },
  {
    id: 2,
    name: 'DB-Server-01',
    ip: '192.168.1.102',
    type: 'database',
    status: 'running',
    os: 'CentOS 7.9',
    cpu: 'Intel Xeon E5-2690 v4',
    memory: '64GB',
    disk: '4TB SSD',
    location: '上海机房'
  },
  {
    id: 3,
    name: 'App-Server-01',
    ip: '192.168.1.103',
    type: 'app',
    status: 'stopped',
    os: 'Ubuntu 22.04 LTS',
    cpu: 'AMD EPYC 7542',
    memory: '16GB',
    disk: '1TB SSD',
    location: '广州机房'
  },
  {
    id: 4,
    name: 'Web-Server-02',
    ip: '192.168.1.104',
    type: 'web',
    status: 'error',
    os: 'Debian 11',
    cpu: 'Intel Xeon E5-2670 v3',
    memory: '16GB',
    disk: '500GB SSD',
    location: '深圳机房'
  },
  {
    id: 5,
    name: 'DB-Server-02',
    ip: '192.168.1.105',
    type: 'database',
    status: 'running',
    os: 'CentOS 8',
    cpu: 'AMD EPYC 7543',
    memory: '128GB',
    disk: '8TB SSD',
    location: '北京机房'
  }
]

// 服务器类型选项
export const serverTypes = [
  { label: 'Web服务器', value: 'web' },
  { label: '数据库服务器', value: 'database' },
  { label: '应用服务器', value: 'app' }
]

// 服务器状态选项
export const serverStatus = [
  { label: '运行中', value: 'running' },
  { label: '已停止', value: 'stopped' },
  { label: '异常', value: 'error' }
] 