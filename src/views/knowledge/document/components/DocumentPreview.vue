<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    width="80%"
    fullscreen
    append-to-body
    :close-on-press-escape="true"
    :show-close="true"
    class="doc-preview-dialog"
  >
    <!-- 顶部导航栏 -->
    <div class="doc-nav">
      <div class="nav-left">
        <el-button link @click="emit('update:visible', false)">
          <el-icon><Close /></el-icon>
        </el-button>
        <div class="doc-title-small">{{ document?.title }}</div>
      </div>
      <div class="nav-right">
        <el-button-group>
          <el-tooltip content="编辑文档" placement="bottom">
            <el-button @click="emit('edit', document)">
              <el-icon><Edit /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="历史版本" placement="bottom">
            <el-button @click="emit('history', document)">
              <el-icon><Timer /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>
    </div>

    <!-- 文档内容区域 -->
    <div class="doc-container">
      <!-- 左侧固定区域：文档信息和目录 -->
      <div class="doc-sidebar">
        <div class="doc-header">
          <h1 class="doc-title">{{ document?.title }}</h1>
          <div class="doc-info">
            <div class="info-item">作者：{{ document?.creator_name }}</div>
            <div class="info-item">最后修改：{{ document?.updater_name }}</div>
            <div class="info-item">更新时间：{{ document?.updated_at }}</div>
            <div class="info-item">版本：{{ document?.version }}</div>
          </div>
        </div>
        
        <div class="toc-container" v-if="tableOfContents.length > 0">
          <div class="toc-title">目录</div>
          <div class="toc-list">
            <div
              v-for="(item, index) in tableOfContents"
              :key="index"
              class="toc-item"
              :class="[`level-${item.level}`, { active: currentHeading === item.id }]"
              @click="scrollToHeading(item.id)"
            >
              {{ item.text }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧滚动区域：文档内容 -->
      <div class="doc-content">
        <div class="doc-body markdown-body" v-html="parsedContent" ref="contentRef" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { parseMarkdown } from '@/utils/markdown'
import { PropType } from 'vue'
import { Close, Edit, Timer } from '@element-plus/icons-vue'

interface Document {
  id: number
  title: string
  content: string
  creator_name: string
  updater_name: string
  version: number
  created_at: string
  updated_at: string
}

interface TocItem {
  id: string
  text: string
  level: number
}

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  document: {
    type: Object as PropType<Document>,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'edit', 'history'])

const contentRef = ref<HTMLElement>()
const currentHeading = ref('')

const parsedContent = computed(() => {
  return parseMarkdown(props.document?.content || '')
})

// 生成目录
const generateTableOfContents = () => {
  if (!contentRef.value) return []
  
  const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const toc: TocItem[] = []
  
  headings.forEach((heading, index) => {
    const id = `heading-${index}`
    heading.id = id
    toc.push({
      id,
      text: heading.textContent || '',
      level: parseInt(heading.tagName[1])
    })
  })
  
  return toc
}

const tableOfContents = ref<TocItem[]>([])

// 监听文档内容变化
watch(
  () => props.document?.content,
  () => {
    nextTick(() => {
      // 重置当前标题
      currentHeading.value = ''
      // 重新生成目录
      tableOfContents.value = generateTableOfContents()
      // 重新绑定滚动事件
      if (contentRef.value) {
        contentRef.value.removeEventListener('scroll', handleScroll)
        contentRef.value.addEventListener('scroll', handleScroll)
      }
    })
  }
)

// 监听可见性变化
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        // 当对话框打开时，重新生成目录
        tableOfContents.value = generateTableOfContents()
        // 重新绑定滚动事件
        if (contentRef.value) {
          contentRef.value.removeEventListener('scroll', handleScroll)
          contentRef.value.addEventListener('scroll', handleScroll)
        }
      })
    } else {
      // 当对话框关闭时，清空目录和当前标题
      tableOfContents.value = []
      currentHeading.value = ''
      // 移除滚动事件监听
      if (contentRef.value) {
        contentRef.value.removeEventListener('scroll', handleScroll)
      }
    }
  }
)

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    currentHeading.value = id
  }
}

const handleScroll = () => {
  if (!contentRef.value) return
  
  const headings = Array.from(contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  const scrollPosition = contentRef.value.scrollTop
  
  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i]
    if (heading.offsetTop <= scrollPosition + 100) {
      currentHeading.value = heading.id
      break
    }
  }
}

// 组件卸载时清理
onUnmounted(() => {
  if (contentRef.value) {
    contentRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style lang="scss" scoped>
:deep(.el-dialog) {
  margin: 0 !important;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .el-dialog__header {
    display: none;
  }
  
  .el-dialog__body {
    flex: 1;
    padding: 0;
    overflow: hidden;
  }
}

// 导航栏
.doc-nav {
  height: 48px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;

  .nav-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .doc-title-small {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      max-width: 500px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 内容区域
.doc-container {
  flex: 1;
  display: flex;
  position: relative;
  height: calc(100vh - 48px);
  overflow: hidden;
  
  .doc-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    background-color: #fff;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 999;

    .doc-header {
      padding: 24px;
      border-bottom: 1px solid #e4e7ed;
      flex-shrink: 0;

      .doc-title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #303133;
      }

      .doc-info {
        color: #606266;
        font-size: 14px;
        line-height: 1.8;

        .info-item {
          margin-bottom: 8px;
          &:last-child { margin-bottom: 0; }
        }
      }
    }

    .toc-container {
      flex: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .toc-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e4e7ed;
        flex-shrink: 0;
      }

      .toc-list {
        flex: 1;
        overflow-y: auto;

        .toc-item {
          padding: 6px 12px;
          margin: 4px 0;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s;
          
          &:hover {
            background-color: #f5f7fa;
          }
          
          &.active {
            background-color: #ecf5ff;
            color: #409eff;
          }
          
          &.level-1 { padding-left: 12px; font-weight: 600; }
          &.level-2 { padding-left: 24px; }
          &.level-3 { padding-left: 36px; }
          &.level-4 { padding-left: 48px; }
          &.level-5 { padding-left: 60px; }
          &.level-6 { padding-left: 72px; }
        }
      }
    }
  }

  .doc-content {
    position: absolute;
    top: 0;
    left: 300px;
    right: 0;
    bottom: 0;
    background-color: #f5f7fa;
    overflow-y: auto;
    
    .doc-body {
      max-width: 900px;
      margin: 40px auto;
      padding: 40px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }
}
</style> 