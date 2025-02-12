<template>
  <div class="wiki-manage">
    <!-- 左侧目录树 -->
    <div class="wiki-sidebar">
      <el-card>
        <template #header>
          <div class="sidebar-header">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索..."
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <div class="sidebar-actions">
              <el-button 
                type="primary" 
                link 
                @click="handleAddSpace"
              >
                新建空间
              </el-button>
            </div>
          </div>
        </template>
        
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="treeProps"
          node-key="id"
          :expand-on-click-node="false"
          highlight-current
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <span>{{ node.label }}</span>
              <div class="node-actions">
                <el-button 
                  v-if="data.type === 'space'"
                  type="primary" 
                  link
                  @click.stop="handleAddPage(data)"
                >
                  新建页面
                </el-button>
                <el-dropdown 
                  trigger="click" 
                  @click.stop 
                  @command="command => handleCommand(command, data)"
                >
                  <el-button link>
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="move">移动</el-dropdown-item>
                      <el-dropdown-item 
                        command="delete" 
                        divided
                      >
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>
        </el-tree>
      </el-card>
    </div>

    <!-- 右侧内容区 -->
    <div class="wiki-content">
      <el-card v-if="currentPage">
        <template #header>
          <div class="content-header">
            <h2>{{ currentPage.title }}</h2>
            <div class="content-actions">
              <el-button-group>
                <el-button 
                  type="primary" 
                  @click="handleEdit"
                >
                  编辑
                </el-button>
                <el-button 
                  type="success" 
                  @click="handleVersion"
                >
                  版本
                </el-button>
                <el-button 
                  type="warning" 
                  @click="handleMove"
                >
                  移动
                </el-button>
                <el-button 
                  type="danger" 
                  @click="handleDelete"
                >
                  删除
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>
        
        <div class="content-meta">
          <span>作者：{{ currentPage.author }}</span>
          <span>更新时间：{{ currentPage.updateTime }}</span>
          <span>浏览量：{{ currentPage.views }}</span>
        </div>
        
        <div class="content-body markdown-body" v-html="renderContent" />
      </el-card>
      
      <div v-else class="empty-content">
        <el-empty description="请选择或创建 Wiki 页面" />
      </div>
    </div>

    <!-- 空间/页面编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="getDialogTitle"
      width="80%"
      top="5vh"
      :fullscreen="isFullscreen"
      :before-close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        
        <template v-if="formData.type === 'page'">
          <el-form-item label="内容" prop="content">
            <div class="editor-toolbar">
              <el-radio-group v-model="editorMode" size="small">
                <el-radio-button label="markdown">Markdown</el-radio-button>
                <el-radio-button label="preview">预览</el-radio-button>
              </el-radio-group>
              <el-button 
                type="text" 
                :icon="isFullscreen ? 'Close' : 'FullScreen'"
                @click="toggleFullscreen"
              >
                {{ isFullscreen ? '退出全屏' : '全屏编辑' }}
              </el-button>
            </div>
            <div class="editor-container">
              <div v-show="editorMode === 'markdown'" class="markdown-editor">
                <el-input
                  v-model="formData.content"
                  type="textarea"
                  :rows="20"
                  placeholder="请输入内容（支持Markdown格式）"
                />
              </div>
              <div 
                v-show="editorMode === 'preview'" 
                class="markdown-preview markdown-body" 
                v-html="previewContent" 
              />
            </div>
          </el-form-item>
        </template>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 移动弹窗 -->
    <el-dialog
      v-model="moveDialogVisible"
      title="移动"
      width="400px"
    >
      <el-form
        ref="moveFormRef"
        :model="moveForm"
        :rules="moveRules"
        label-width="100px"
      >
        <el-form-item label="目标空间" prop="targetSpace">
          <el-select 
            v-model="moveForm.targetSpace"
            placeholder="请选择目标空间"
          >
            <el-option
              v-for="space in spaceList"
              :key="space.id"
              :label="space.title"
              :value="space.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="moveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleMoveSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 版本历史弹窗 -->
    <el-dialog
      v-model="versionDialogVisible"
      title="版本历史"
      width="800px"
    >
      <el-timeline>
        <el-timeline-item
          v-for="version in versionHistory"
          :key="version.id"
          :timestamp="version.createTime"
          :type="version.id === currentVersion ? 'primary' : ''"
        >
          <h4>版本 {{ version.version }}</h4>
          <p class="version-comment">{{ version.comment }}</p>
          <div class="version-meta">
            <span>作者：{{ version.author }}</span>
          </div>
          <div class="version-actions">
            <el-button 
              link 
              type="primary" 
              @click="handleViewVersion(version)"
            >
              查看
            </el-button>
            <el-button 
              v-if="version.id !== currentVersion"
              link 
              type="warning" 
              @click="handleRollback(version)"
            >
              回滚到此版本
            </el-button>
            <el-button 
              link 
              type="info" 
              @click="handleCompareVersion(version)"
            >
              对比
            </el-button>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <!-- 版本对比弹窗 -->
    <el-dialog
      v-model="compareDialogVisible"
      title="版本对比"
      width="90%"
      top="5vh"
    >
      <div class="compare-header">
        <div class="compare-version">
          <span class="compare-label">对比版本：</span>
          <el-select v-model="compareFrom" placeholder="选择版本">
            <el-option
              v-for="version in versionHistory"
              :key="version.id"
              :label="`版本 ${version.version}`"
              :value="version.id"
            />
          </el-select>
          <el-icon class="compare-arrow"><ArrowRight /></el-icon>
          <el-select v-model="compareTo" placeholder="选择版本">
            <el-option
              v-for="version in versionHistory"
              :key="version.id"
              :label="`版本 ${version.version}`"
              :value="version.id"
            />
          </el-select>
        </div>
      </div>
      
      <div class="compare-content">
        <div class="compare-side">
          <div class="compare-title">版本 {{ getVersionLabel(compareFrom) }}</div>
          <div class="compare-body markdown-body" v-html="fromContent" />
        </div>
        <div class="compare-side">
          <div class="compare-title">版本 {{ getVersionLabel(compareTo) }}</div>
          <div class="compare-body markdown-body" v-html="toContent" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { More, Search, ArrowRight } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { parseMarkdown } from '@/utils/markdown'
import type { WikiSpace, WikiPage, WikiVersion, WikiFormData, MoveFormData } from '@/types/wiki'
import 'github-markdown-css'

// 搜索关键词
const searchKeyword = ref('')

// 树形数据
const treeData = ref<WikiSpace[]>([
  {
    id: 1,
    label: '开发文档',
    type: 'space',
    children: [
      {
        id: 11,
        label: '前端规范',
        type: 'page',
        content: '# 前端开发规范\n\n## 1. 代码风格\n...'
      }
    ]
  }
])

// 树形配置
const treeProps = {
  label: 'label',
  children: 'children'
}

// 当前页面
const currentPage = ref<WikiPage | null>(null)

// 页面内容
const renderContent = computed(() => {
  if (!currentPage.value?.content) return ''
  return parseMarkdown(currentPage.value.content)
})

// 编辑相关
const dialogVisible = ref(false)
const isFullscreen = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  id: null as number | null,
  type: 'page',
  title: '',
  content: '',
  parentId: null as number | null
})

// 对话框标题
const getDialogTitle = computed(() => {
  if (!formData.id) {
    return formData.type === 'space' ? '新建空间' : '新建页面'
  }
  return formData.type === 'space' ? '编辑空间' : '编辑页面'
})

// 编辑器相关
const editorMode = ref('markdown')
const previewContent = computed(() => {
  return parseMarkdown(formData.content)
})

// 表单校验规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

// 移动相关
const moveDialogVisible = ref(false)
const moveFormRef = ref<FormInstance>()
const moveForm = reactive({
  targetSpace: null as number | null
})

// 移动表单校验规则
const moveRules = {
  targetSpace: [
    { required: true, message: '请选择目标空间', trigger: 'change' }
  ]
}

// 空间列表
const spaceList = computed(() => {
  return treeData.value.map(item => ({
    id: item.id,
    title: item.label
  }))
})

// 版本相关
const versionDialogVisible = ref(false)
const versionHistory = ref<WikiVersion[]>([])
const currentVersion = ref<number | null>(null)

// 版本对比
const compareDialogVisible = ref(false)
const compareFrom = ref<number | null>(null)
const compareTo = ref<number | null>(null)
const fromContent = ref('')
const toContent = ref('')

// 获取版本标签
const getVersionLabel = (versionId: number | null) => {
  const version = versionHistory.value.find(v => v.id === versionId)
  return version ? `${version.version}` : ''
}

// 树节点点击
const handleNodeClick = (data: WikiSpace | WikiPage) => {
  if (data.type === 'page') {
    currentPage.value = {
      ...data,
      author: '张三',
      updateTime: '2024-01-10 12:00:00',
      views: 128
    }
  }
}

// 新建空间
const handleAddSpace = () => {
  formData.id = null
  formData.type = 'space'
  formData.title = ''
  formData.content = ''
  formData.parentId = null
  dialogVisible.value = true
}

// 新建页面
const handleAddPage = (space: WikiSpace) => {
  formData.id = null
  formData.type = 'page'
  formData.title = ''
  formData.content = ''
  formData.parentId = space.id
  dialogVisible.value = true
}

// 处理命令
const handleCommand = (command: string, data: WikiSpace | WikiPage) => {
  switch (command) {
    case 'edit':
      handleEdit(data)
      break
    case 'move':
      handleMove(data)
      break
    case 'delete':
      handleDelete(data)
      break
  }
}

// 编辑
const handleEdit = (data: WikiSpace | WikiPage) => {
  formData.id = data.id
  formData.type = data.type
  formData.title = data.label
  formData.content = 'page' in data ? data.content : ''
  formData.parentId = null // TODO: 获取父节点ID
  dialogVisible.value = true
}

// 移动
const handleMove = (data: WikiSpace | WikiPage) => {
  moveForm.targetSpace = null
  moveDialogVisible.value = true
}

// 删除
const handleDelete = (data: WikiSpace | WikiPage) => {
  ElMessageBox.confirm(
    `确认删除${data.type === 'space' ? '空间' : '页面'}「${data.label}」？`,
    '提示',
    {
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现删除逻辑
    ElMessage.success('删除成功')
  })
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 关闭弹窗
const handleClose = () => {
  ElMessageBox.confirm('确认关闭？未保存的内容将会丢失', '提示', {
    type: 'warning'
  }).then(() => {
    dialogVisible.value = false
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交逻辑
      console.log('submit:', formData)
      ElMessage.success(formData.id ? '更新成功' : '创建成功')
      dialogVisible.value = false
    }
  })
}

// 提交移动
const handleMoveSubmit = async () => {
  if (!moveFormRef.value) return
  
  await moveFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现移动逻辑
      console.log('move to:', moveForm.targetSpace)
      ElMessage.success('移动成功')
      moveDialogVisible.value = false
    }
  })
}

// 处理搜索
const handleSearch = (value: string) => {
  console.log('search:', value)
}

// 版本相关处理函数
const handleVersion = () => {
  if (!currentPage.value) return
  versionDialogVisible.value = true
  // TODO: 加载版本历史
}

const handleViewVersion = (version: WikiVersion) => {
  // TODO: 查看版本内容
  console.log('view version:', version)
}

const handleRollback = (version: WikiVersion) => {
  ElMessageBox.confirm(`确认回滚到版本 ${version.version}？`, '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 实现回滚逻辑
    ElMessage.success('回滚成功')
  })
}

const handleCompareVersion = (version: WikiVersion) => {
  compareFrom.value = version.id
  compareTo.value = currentVersion.value
  compareDialogVisible.value = true
  // TODO: 加载对比内容
}
</script>

<style scoped>
.wiki-manage {
  display: flex;
  gap: 20px;
  height: 100%;
}

.wiki-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.wiki-content {
  flex: 1;
  min-width: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-actions {
  display: none;
}

.tree-node:hover .node-actions {
  display: flex;
  gap: 4px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header h2 {
  margin: 0;
}

.content-meta {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
}

.content-body {
  min-height: 500px;
}

.empty-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-toolbar {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.markdown-editor :deep(.el-textarea__inner) {
  border: none;
  border-radius: 0;
}

.markdown-preview {
  padding: 20px;
  min-height: 500px;
  overflow-y: auto;
}
</style> 