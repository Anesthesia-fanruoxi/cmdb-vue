// 变量定义
export const templateVariables = {
  level: {
    name: '告警级别',
    required: true,
    validate: (value: string) => ['high', 'medium', 'low'].includes(value)
  },
  target: {
    name: '监控对象',
    required: true,
    validate: (value: string) => value.length > 0
  },
  metric: {
    name: '监控指标',
    required: true,
    validate: (value: string) => value.length > 0
  },
  value: {
    name: '当前值',
    required: true,
    validate: (value: string) => value.length > 0
  },
  threshold: {
    name: '阈值',
    required: true,
    validate: (value: string) => value.length > 0
  },
  duration: {
    name: '持续时间',
    required: false,
    validate: (value: string) => /^\d+[smh]$/.test(value)
  },
  time: {
    name: '告警时间',
    required: true,
    validate: (value: string) => !isNaN(Date.parse(value))
  },
  description: {
    name: '告警描述',
    required: false,
    validate: (value: string) => true
  }
}

// 验证模板变量
export const validateTemplate = (template: string) => {
  const errors: string[] = []
  const variables = new Set<string>()
  
  // 提取模板中的变量
  template.replace(/\{(\w+)\}/g, (_, key) => {
    variables.add(key)
    return ''
  })
  
  // 检查必需变量
  Object.entries(templateVariables).forEach(([key, config]) => {
    if (config.required && !variables.has(key)) {
      errors.push(`缺少必需变量: ${config.name}`)
    }
  })
  
  // 检查未知变量
  variables.forEach(key => {
    if (!templateVariables[key as keyof typeof templateVariables]) {
      errors.push(`未知变量: ${key}`)
    }
  })
  
  return errors
}

// 验证变量值
export const validateVariableValue = (key: string, value: string) => {
  const config = templateVariables[key as keyof typeof templateVariables]
  if (!config) return false
  return config.validate(value)
}

// 模板分类
export interface TemplateCategory {
  id: number
  name: string
  description?: string
  type: 'email' | 'dingtalk' | 'wecom' | 'webhook'
}

// 模板分类数据
export const templateCategories: TemplateCategory[] = [
  {
    id: 1,
    name: '告警通知',
    description: '用于发送告警通知的模板',
    type: 'email'
  },
  {
    id: 2,
    name: '故障通知',
    description: '用于发送故障通知的模板',
    type: 'dingtalk'
  },
  {
    id: 3,
    name: '恢复通知',
    description: '用于发送恢复通知的模板',
    type: 'wecom'
  },
  {
    id: 4,
    name: 'API回调',
    description: '用于API回调的模板',
    type: 'webhook'
  }
]

// 添加模板版本接口
export interface TemplateVersion {
  id: number
  templateId: number
  version: string
  content: {
    name: string
    type: string
    categoryId: number
    titleTemplate: string
    contentTemplate: string
  }
  createdBy: string
  createdAt: string
  comment?: string
}

// 添加版本比较函数
export const compareVersions = (v1: string, v2: string) => {
  const normalize = (v: string) => {
    return v.split('.').map(x => parseInt(x.replace(/[^0-9]/g, ''), 10))
  }
  
  const n1 = normalize(v1)
  const n2 = normalize(v2)
  
  for (let i = 0; i < Math.max(n1.length, n2.length); i++) {
    const v1 = n1[i] || 0
    const v2 = n2[i] || 0
    if (v1 > v2) return 1
    if (v1 < v2) return -1
  }
  return 0
}

// 生成新版本号
export const generateNextVersion = (currentVersion: string) => {
  const parts = currentVersion.split('.')
  const lastPart = parseInt(parts[parts.length - 1], 10)
  parts[parts.length - 1] = (lastPart + 1).toString()
  return parts.join('.')
}

// 模板版本历史示例数据
export const templateVersions: TemplateVersion[] = [
  {
    id: 1,
    templateId: 1,
    version: '1.0.0',
    content: {
      name: '标准邮件模板',
      type: 'email',
      categoryId: 1,
      titleTemplate: '[{level}] {target} - {metric}告警',
      contentTemplate: `监控对象：{target}
监控指标：{metric}
当前值：{value}
阈值：{threshold}
持续时间：{duration}
告警时间：{time}

{description}

请及时处理！`
    },
    createdBy: 'admin',
    createdAt: '2024-01-01 10:00:00',
    comment: '初始版本'
  },
  {
    id: 2,
    templateId: 1,
    version: '1.0.1',
    content: {
      name: '标准邮件模板',
      type: 'email',
      categoryId: 1,
      titleTemplate: '[{level}] {target} - {metric}告警',
      contentTemplate: `【告警详情】
监控对象：{target}
监控指标：{metric}
当前值：{value}
阈值：{threshold}
持续时间：{duration}
告警时间：{time}

【告警描述】
{description}

请及时处理！`
    },
    createdBy: 'admin',
    createdAt: '2024-01-02 14:30:00',
    comment: '优化内容格式'
  }
]

// 获取模板最新版本
export const getLatestVersion = (templateId: number) => {
  const versions = templateVersions
    .filter(v => v.templateId === templateId)
    .sort((a, b) => compareVersions(b.version, a.version))
  
  return versions[0]
}

// 获取模板所有版本
export const getTemplateVersions = (templateId: number) => {
  return templateVersions
    .filter(v => v.templateId === templateId)
    .sort((a, b) => compareVersions(b.version, a.version))
}

// 创建新版本
export const createVersion = (
  templateId: number,
  content: TemplateVersion['content'],
  comment?: string
) => {
  const versions = getTemplateVersions(templateId)
  const latestVersion = versions[0]?.version || '1.0.0'
  const newVersion = generateNextVersion(latestVersion)
  
  const version: TemplateVersion = {
    id: templateVersions.length + 1,
    templateId,
    version: newVersion,
    content,
    createdBy: 'admin', // TODO: 从用户上下文获取
    createdAt: new Date().toISOString(),
    comment
  }
  
  templateVersions.push(version)
  return version
} 