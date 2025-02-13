<template>
  <div class="document-preview">
    <div class="preview-header">
      <h2>{{ title || '无标题' }}</h2>
      <div class="meta-info">
        <span>所属项目：{{ projectId }}</span>
        <span>删除人：{{ author }}</span>
        <span>删除时间：{{ formatDate(updateTime) }}</span>
      </div>
    </div>
    <div class="preview-content">
      <markdown-viewer :content="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MarkdownViewer } from '@/components/Markdown'

const props = defineProps<{
  content: string
  title?: string
  author?: string
  updateTime?: string
  projectId?: string | number
}>()

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.document-preview {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.preview-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.preview-header h2 {
  margin: 0 0 10px 0;
}

.meta-info {
  color: #909399;
  font-size: 14px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.preview-content {
  min-height: 200px;
}
</style> 