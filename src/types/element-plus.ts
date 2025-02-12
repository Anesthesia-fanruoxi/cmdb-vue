// Element Plus 通用类型
export type ElTagType = 'success' | 'warning' | 'info' | 'primary' | 'danger'

// 标签类型转换工具
export const getTagType = (type: string): ElTagType => {
  const typeMap: Record<string, ElTagType> = {
    success: 'success',
    warning: 'warning',
    info: 'info',
    primary: 'primary',
    danger: 'danger'
  }
  return typeMap[type] || 'info'
}

// 告警级别转标签类型
export const getAlarmLevelType = (level: number): ElTagType => {
  const levelMap: Record<number, ElTagType> = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return levelMap[level] || 'info'
} 