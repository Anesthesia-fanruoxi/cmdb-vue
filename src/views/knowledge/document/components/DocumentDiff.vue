<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="版本对比"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="diff-container">
      <div class="diff-header">
        <div class="version-info">
          <div class="version left">
            <h3>当前版本 (v{{ currentDoc?.version }})</h3>
            <p>更新时间：{{ currentDoc?.updated_at }}</p>
            <p>修改人：{{ currentDoc?.updater_name }}</p>
          </div>
          <div class="version right">
            <h3>历史版本 (v{{ historyDoc?.version }})</h3>
            <p>更新时间：{{ historyDoc?.created_at }}</p>
            <p>修改人：{{ historyDoc?.updater_name }}</p>
          </div>
        </div>
      </div>
      
      <div class="diff-content">
        <div class="diff-view">
          <div class="diff-columns">
            <!-- 当前版本 -->
            <div class="diff-column">
              <div class="column-header">当前版本</div>
              <div class="diff-lines">
                <div 
                  v-for="(line, index) in currentLines" 
                  :key="'current-' + index"
                  class="diff-line"
                  :class="getLineClass(line)"
                >
                  <div class="line-number">{{ line.lineNumber }}</div>
                  <div class="line-content">{{ line.content }}</div>
                </div>
              </div>
            </div>
            
            <!-- 历史版本 -->
            <div class="diff-column">
              <div class="column-header">历史版本</div>
              <div class="diff-lines">
                <div 
                  v-for="(line, index) in historyLines" 
                  :key="'history-' + index"
                  class="diff-line"
                  :class="getLineClass(line)"
                >
                  <div class="line-number">{{ line.lineNumber }}</div>
                  <div class="line-content">{{ line.content }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="emit('update:visible', false)">关闭</el-button>
        <el-button type="warning" @click="emit('restore')" v-if="canRestore">
          恢复到此版本
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import DiffMatchPatch from 'diff-match-patch'

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

interface DiffLine {
  content: string
  lineNumber: number
  type: 'added' | 'removed' | 'modified' | 'unchanged'
}

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  currentDoc: {
    type: Object as PropType<Document>,
    required: true
  },
  historyDoc: {
    type: Object as PropType<Document>,
    required: true
  },
  canRestore: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible', 'restore'])

// 将文本分割成行
const splitIntoLines = (text: string): string[] => text.split(/\r\n|\r|\n/)

// 计算差异
const computeDiff = (text1: string, text2: string) => {
  const dmp = new DiffMatchPatch()
  const diffs = dmp.diff_main(text1, text2)
  dmp.diff_cleanupSemantic(diffs)
  return diffs
}

// 处理差异结果
const { currentLines, historyLines } = computed(() => {
  const currentContent = props.currentDoc?.content || ''
  const historyContent = props.historyDoc?.content || ''
  
  const currentTextLines = splitIntoLines(currentContent)
  const historyTextLines = splitIntoLines(historyContent)
  
  const diffs = computeDiff(currentContent, historyContent)
  
  let currentLineNumber = 1
  let historyLineNumber = 1
  
  const current: DiffLine[] = []
  const history: DiffLine[] = []
  
  let currentIndex = 0
  let historyIndex = 0
  
  diffs.forEach(([type, text]) => {
    const lines = splitIntoLines(text)
    
    if (type === 0) { // 未改变
      lines.forEach(line => {
        current.push({
          content: line,
          lineNumber: currentLineNumber++,
          type: 'unchanged'
        })
        history.push({
          content: line,
          lineNumber: historyLineNumber++,
          type: 'unchanged'
        })
      })
    } else if (type === -1) { // 删除
      lines.forEach(line => {
        current.push({
          content: line,
          lineNumber: currentLineNumber++,
          type: 'removed'
        })
      })
    } else { // 新增
      lines.forEach(line => {
        history.push({
          content: line,
          lineNumber: historyLineNumber++,
          type: 'added'
        })
      })
    }
  })
  
  return {
    currentLines: current,
    historyLines: history
  }
})

// 获取行的样式类
const getLineClass = (line: DiffLine) => ({
  'line-added': line.type === 'added',
  'line-removed': line.type === 'removed',
  'line-modified': line.type === 'modified',
  'line-unchanged': line.type === 'unchanged'
})
</script>

<style lang="scss" scoped>
.diff-container {
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  
  .diff-header {
    padding: 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    
    .version-info {
      display: flex;
      justify-content: space-between;
      
      .version {
        flex: 1;
        padding: 0 20px;
        
        h3 {
          margin: 0 0 12px;
          font-size: 16px;
          font-weight: 600;
        }
        
        p {
          margin: 8px 0;
          color: #606266;
          font-size: 14px;
        }
        
        &.left {
          border-right: 1px solid #e4e7ed;
        }
      }
    }
  }
  
  .diff-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #fff;
    
    .diff-columns {
      display: flex;
      gap: 20px;
      
      .diff-column {
        flex: 1;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        
        .column-header {
          padding: 10px;
          background-color: #f5f7fa;
          border-bottom: 1px solid #e4e7ed;
          font-weight: 600;
        }
        
        .diff-lines {
          font-family: monospace;
          font-size: 14px;
          line-height: 1.5;
          
          .diff-line {
            display: flex;
            
            .line-number {
              width: 40px;
              padding: 0 8px;
              text-align: right;
              color: #909399;
              background-color: #f5f7fa;
              user-select: none;
              border-right: 1px solid #e4e7ed;
            }
            
            .line-content {
              flex: 1;
              padding: 0 8px;
              white-space: pre-wrap;
              word-break: break-all;
            }
            
            &.line-added {
              background-color: #e6ffe6;
              border-left: 3px solid #42b983;
            }
            
            &.line-removed {
              background-color: #ffe6e6;
              border-left: 3px solid #f56c6c;
            }
            
            &.line-modified {
              background-color: #fff8e6;
              border-left: 3px solid #e6a23c;
            }
            
            &.line-unchanged {
              background-color: #fff;
              border-left: 3px solid transparent;
            }
          }
        }
      }
    }
  }
}
</style> 