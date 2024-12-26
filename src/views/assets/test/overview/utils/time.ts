export const getTimeDiff = (action_timestamp?: string, operation_timestamp?: string): string => {
  if (!action_timestamp && !operation_timestamp) {
    return '-'
  }

  const now = Date.now()
  const timestamp = parseInt(action_timestamp || operation_timestamp || '')
  
  if (isNaN(timestamp)) {
    return '-'
  }

  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天${hours % 24}小时`
  }
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  }
  if (minutes > 0) {
    return `${minutes}分钟`
  }
  if (seconds > 0) {
    return `${seconds % 60}秒`
  }
  return '刚刚'
} 