<template>
  <div class="document-manage">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="文档标题">
          <el-input v-model="searchForm.title" placeholder="请输入文档标题" />
        </el-form-item>
        <el-form-item label="文档分类">
          <el-cascader
            v-model="searchForm.category"
            :options="categoryOptions"
            :props="{ checkStrictly: true }"
            placeholder="请选择文档分类"
            clearable
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新建文档
      </el-button>
      <el-button type="success" @click="handleImport">
        <el-icon><Upload /></el-icon>导入文档
      </el-button>
      <el-button type="warning" :disabled="!selectedRows.length" @click="handleExport">
        <el-icon><Download /></el-icon>导出文档
      </el-button>
      <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
    </div>

    <!-- 文档列表 -->
    <el-card>
      <el-table 
        :data="tableData" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="文档标题" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="180">
          <template #default="{ row }">
            <el-tag>{{ getCategoryPath(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column prop="views" label="浏览量" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="success" @click="handleVersion(row)">版本</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 文档编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑文档' : '新建文档'"
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
        <el-form-item label="文档标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入文档标题" />
        </el-form-item>
        
        <el-form-item label="文档分类" prop="category">
          <el-cascader
            v-model="formData.category"
            :options="categoryOptions"
            :props="{ checkStrictly: true }"
            placeholder="请选择文档分类"
          />
        </el-form-item>
        
        <el-form-item label="文档内容" prop="content">
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
                placeholder="请输入文档内容（支持Markdown格式）"
              />
            </div>
            <div v-show="editorMode === 'preview'" class="markdown-preview markdown-body" v-html="previewContent" />
          </div>
        </el-form-item>
        
        <el-form-item label="标签" prop="tags">
          <el-tag
            v-for="tag in formData.tags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="handleRemoveTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="tagInputRef"
            v-model="inputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">
            + 新增标签
          </el-button>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
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
          <p>{{ version.comment }}</p>
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
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { Plus, Upload, Download, Delete } from '@element-plus/icons-vue'
import type { FormInstance, TagInputInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as marked from 'marked'
import 'github-markdown-css'

// 搜索表单
const searchForm = reactive({
  title: '',
  category: [] as number[],
  timeRange: [] as string[]
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    title: '服务器管理规范',
    category: [1, 11],
    author: '张三',
    updateTime: '2024-01-10 12:00:00',
    views: 128,
    content: '# 服务器管理规范\n\n## 1. 服务器命名规范\n...',
    tags: ['规范', '服务器']
  },
  {
    id: 2,
    title: '数据库备份指南',
    category: [1, 12],
    author: '李四',
    updateTime: '2024-01-09 15:30:00',
    views: 86,
    content: '# 数据库备份指南\n\n## 1. 备份策略\n...',
    tags: ['数据库', '运维']
  }
])

// 分类选项
const categoryOptions = [
  {
    value: 1,
    label: '运维文档',
    children: [
      {
        value: 11,
        label: '服务器'
      },
      {
        value: 12,
        label: '数据库'
      },
      {
        value: 13,
        label: '网络'
      }
    ]
  },
  {
    value: 2,
    label: '开发文档',
    children: [
      {
        value: 21,
        label: '前端'
      },
      {
        value: 22,
        label: '后端'
      }
    ]
  }
]

// 获取分类路径
const getCategoryPath = (categoryIds: number[]) => {
  const path: string[] = []
  let options = categoryOptions
  
  categoryIds.forEach(id => {
    const option = options.find(opt => opt.value === id)
    if (option) {
      path.push(option.label)
      options = option.children || []
    }
  })
  
  return path.join(' / ')
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref<any[]>([])

// 编辑相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  title: '',
  category: [] as number[],
  content: '',
  tags: [] as string[]
})

// 表单校验规则
const rules = {
  title: [
    { required: true, message: '请输入文档标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择文档分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文档内容', trigger: 'blur' }
  ]
}

// 编辑器相关
const editorMode = ref('markdown')
const isFullscreen = ref(false)
const previewContent = computed(() => {
  return marked.parse(formData.content)
})

// 标签相关
const inputVisible = ref(false)
const inputValue = ref('')
const tagInputRef = ref<TagInputInstance>()

// 版本相关
const versionDialogVisible = ref(false)
const currentVersion = ref(1)
const versionHistory = [
  {
    id: 1,
    version: '1.0.0',
    createTime: '2024-01-10 12:00:00',
    comment: '初始版本',
    content: '# 服务器管理规范\n\n## 1. 服务器命名规范\n...'
  },
  {
    id: 2,
    version: '1.0.1',
    createTime: '2024-01-10 14:30:00',
    comment: '更新命名规范',
    content: '# 服务器管理规范\n\n## 1. 服务器命名规范（更新）\n...'
  }
]

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索逻辑
  console.log('search:', searchForm)
  currentPage.value = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.title = ''
  searchForm.category = []
  searchForm.timeRange = []
  handleSearch()
}

// 新建文档
const handleAdd = () => {
  isEdit.value = false
  formData.title = ''
  formData.category = []
  formData.content = ''
  formData.tags = []
  dialogVisible.value = true
}

// 编辑文档
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 查看文档
const handleView = (row: any) => {
  // TODO: 实现查看逻辑
  console.log('view:', row)
}

// 删除文档
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该文档？', '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 实现删除逻辑
    ElMessage.success('删除成功')
    fetchData()
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedRows.value.length) return
  ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 个文档？`, '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 实现批量删除逻辑
    ElMessage.success('删除成功')
    fetchData()
  })
}

// 导入文档
const handleImport = () => {
  // TODO: 实现导入逻辑
  console.log('import')
}

// 导出文档
const handleExport = () => {
  // TODO: 实现导出逻辑
  console.log('export:', selectedRows.value)
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
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      fetchData()
    }
  })
}

// 显示标签输入框
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.input?.focus()
  })
}

// 处理标签输入
const handleInputConfirm = () => {
  if (inputValue.value) {
    if (!formData.tags.includes(inputValue.value)) {
      formData.tags.push(inputValue.value)
    }
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 移除标签
const handleRemoveTag = (tag: string) => {
  formData.tags = formData.tags.filter(t => t !== tag)
}

// 查看版本历史
const handleVersion = (row: any) => {
  // TODO: 获取版本历史
  versionDialogVisible.value = true
}

// 查看指定版本
const handleViewVersion = (version: any) => {
  // TODO: 实现版本查看逻辑
  console.log('view version:', version)
}

// 回滚到指定版本
const handleRollback = (version: any) => {
  ElMessageBox.confirm('确认回滚到此版本？当前版本将会被保存为新版本', '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 实现回滚逻辑
    ElMessage.success('回滚成功')
    versionDialogVisible.value = false
  })
}

// 表格选择变化
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

// 获取表格数据
const fetchData = () => {
  // TODO: 实现获取数据逻辑
  total.value = tableData.value.length
}

// 初始化
fetchData()
</script>

<style scoped>
.document-manage {
  .search-card {
    margin-bottom: 20px;
  }

  .action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
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

  .markdown-editor {
    :deep(.el-textarea__inner) {
      border: none;
      border-radius: 0;
    }
  }

  .markdown-preview {
    padding: 20px;
    min-height: 500px;
    overflow-y: auto;
  }

  .tag-input {
    width: 100px;
    margin-left: 10px;
    vertical-align: bottom;
  }

  .button-new-tag {
    margin-left: 10px;
  }

  .version-actions {
    margin-top: 8px;
  }
}
</style> 