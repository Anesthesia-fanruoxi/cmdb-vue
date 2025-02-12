<template>
  <div class="document-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入标题关键词"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="项目" class="project-select">
          <el-select 
            v-model="queryParams.project_id" 
            placeholder="请选择项目" 
            clearable
            style="width: 240px;"
          >
            <el-option
              v-for="item in projectOptions"
              :key="item.project"
              :label="item.project_name"
              :value="item.project"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 文档列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>文档列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleImport">导入文档</el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新建文档
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="documentList"
        style="width: 100%"
      >
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column 
          prop="project_name" 
          label="所属项目" 
          width="150"
          :formatter="(row) => getProjectName(row.project_id)"
        />
        <el-table-column prop="creator_name" label="创建人" width="120" />
        <el-table-column prop="updater_name" label="最后修改人" width="120" />
        <el-table-column prop="version" label="版本" width="80" align="center" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleHistory(row)"
            >
              历史
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.page_size"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建文档对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建文档"
      width="500px"
      append-to-body
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="项目" prop="project_id">
          <el-select 
            v-model="createForm.project_id" 
            placeholder="请选择项目"
            style="width: 100%;"
          >
            <el-option
              v-for="item in projectOptions"
              :key="item.project"
              :label="item.project_name"
              :value="item.project"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreateSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 使用拆分后的组件 -->
    <document-editor
      v-model:visible="editDialogVisible"
      :is-edit="true"
      :project-options="projectOptions"
      :initial-data="currentDoc"
      @submit="handleEditSubmit"
    />
    
    <document-import
      v-model:visible="importDialogVisible"
      :project-options="projectOptions"
      @submit="handleImportSubmit"
      ref="importRef"
    />
    
    <document-history
      v-model:visible="historyDialogVisible"
      :version-list="versionList"
      @view="handleViewVersion"
      @restore="handleRestore"
    />
    
    <document-preview
      v-model:visible="previewDialogVisible"
      :document="previewVersion"
      @edit="handleEdit"
      @history="handleHistory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { parseMarkdown } from '@/utils/markdown'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useProjectDict } from '@/composables/useProjectDict' // 使用 composable
import {
  getDocList,
  getDocDetail,
  createDoc,
  updateDoc,
  deleteDoc,
  getDocumentVersions,
  restoreVersion
} from '@/api/knowledge'
import { marked } from 'marked'
import 'github-markdown-css/github-markdown.css'
import DocumentEditor from './components/DocumentEditor.vue'
import DocumentImport from './components/DocumentImport.vue'
import DocumentHistory from './components/DocumentHistory.vue'
import DocumentPreview from './components/DocumentPreview.vue'

// 使用项目字典 composable
const { projectList: projectOptions } = useProjectDict()

// 处理项目名称显示
const getProjectName = (project_id: string) => {
  const project = projectOptions.value.find(p => p.project === project_id)
  return project ? project.project_name : project_id
}

// 查询参数
const queryParams = reactive({
  keyword: '',
  project_id: undefined,
  page: 1,
  page_size: 10
})

// 列表数据
const loading = ref(false)
const documentList = ref([])
const total = ref(0)

// 获取文档列表
const getList = async () => {
  try {
    loading.value = true
    const { data } = await getDocList(queryParams)
    if (data) {
      // 处理项目名称显示
      documentList.value = data.list.map(item => ({
        ...item,
        project_name: getProjectName(item.project_id)
      }))
      total.value = data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取文档列表失败')
  } finally {
    loading.value = false
  }
}

// 查询操作
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

const resetQuery = () => {
  queryParams.keyword = ''
  handleQuery()
}

// 分页操作
const handleSizeChange = (val: number) => {
  queryParams.page_size = val
  getList()
}

const handleCurrentChange = (val: number) => {
  queryParams.page = val
  getList()
}

// 新建文档
const createDialogVisible = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  title: '',
  project_id: undefined
})

const createRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  project_id: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ]
}

// 文档查看相关
const previewDialogVisible = ref(false)
const currentDoc = ref({
  id: undefined,
  title: '',
  content: '',
  creator_name: '',
  updated_at: '',
  version: 0,
  project_id: ''
})

// 查看文档
const handleView = async (row: any) => {
  try {
    const { data } = await getDocDetail(row.id)
    if (data) {
      // 直接将文档数据传给预览组件
      previewVersion.value = {
        id: data.id,
        title: data.title,
        content: data.content,
        creator_name: data.creator_name,
        updater_name: data.updater_name,
        version: data.version,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
      previewDialogVisible.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取文档详情失败')
  }
}

// 编辑文档
const editDialogVisible = ref(false)
const formData = ref({
  id: undefined,
  title: '',
  content: '',
  project_id: '',
  version: 1
})
const parsedEditContent = computed(() => parseMarkdown(formData.value.content))

// 历史版本相关
const historyDialogVisible = ref(false)
const versionList = ref([])
const previewVersion = ref<{
  id: number
  title: string
  content: string
  updater_name: string
  created_at: string
  version: number
} | null>(null)
const previewVersionContent = computed(() => 
  previewVersion.value ? parseMarkdown(previewVersion.value.content) : ''
)

// 获取文档列表
const handleAdd = () => {
  if (projectOptions.value.length === 0) {
    ElMessage.warning('您没有可用的项目，请先创建项目')
    return
  }
  createForm.title = ''
  createForm.project_id = undefined
  createDialogVisible.value = true
}

const handleCreateSubmit = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    await createDoc(createForm)
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '创建失败')
  }
}

// 处理编辑提交
const handleEditSubmit = async (formData: any) => {
  try {
    await updateDoc({
      id: formData.id,
      title: formData.title,
      content: formData.content,
      project_id: formData.project_id,
      version: formData.version
    })
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  }
}

// 删除操作
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该文档?', '提示', {
      type: 'warning'
    })
    await deleteDoc(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 历史版本操作
const handleHistory = async (row: any) => {
  try {
    const { data } = await getDocumentVersions(row.id)
    versionList.value = data
    historyDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '获取历史版本失败')
  }
}

// 查看历史版本
const handleViewVersion = (version: any) => {
  previewVersion.value = version
  historyDialogVisible.value = false
  previewDialogVisible.value = true
}

// 历史版本恢复
const handleRestore = async (version: any) => {
  try {
    await ElMessageBox.confirm('确认恢复到此版本?', '提示', {
      type: 'warning'
    })
    
    // 恢复历史版本时，同时保存当前版本到历史记录
    await restoreVersion({
      doc_id: currentDoc.value.id,
      history_id: version.id,
      current_version: {
        title: currentDoc.value.title,
        content: currentDoc.value.content,
        project_id: currentDoc.value.project_id,
        version: currentDoc.value.version
      }
    })
    
    ElMessage.success('恢复成功')
    historyDialogVisible.value = false
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '恢复失败')
    }
  }
}

// 导入相关
const importDialogVisible = ref(false)
const importFormRef = ref<FormInstance>()
const importForm = reactive({
  title: '',
  project_id: '',
  file: null as File | null
})

const importRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  project_id: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ]
}

// 预览相关
const previewHtml = computed(() => {
  return marked(formData.value.content || '')
})

// 处理内容变化
const handleContentChange = () => {
  // 实时更新预览，不需要额外处理，computed 会自动更新
}

// 处理文件选择
const handleFileChange = (file: any) => {
  if (!file.raw) {
    ElMessage.error('请选择文件')
    return
  }
  
  importForm.file = file.raw
  
  // 如果标题为空，从文件名中提取标题（去掉.md后缀）
  if (!importForm.title) {
    const fileName = file.raw.name
    if (fileName.toLowerCase().endsWith('.md')) {
      importForm.title = fileName.slice(0, -3)
    }
  }
}

// 处理导入提交
const handleImportSubmit = async (formData: any) => {
  try {
    await createDoc({
      title: formData.title,
      project_id: formData.project_id,
      content: formData.content
    })
    
    ElMessage.success('导入成功')
    importDialogVisible.value = false
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  }
}

// 处理导入按钮点击
const handleImport = () => {
  // 重置表单数据
  importForm.title = ''
  importForm.project_id = ''
  importForm.file = null
  
  // 显示导入表单对话框
  importDialogVisible.value = true
}

// 编辑文档
const handleEdit = async (row: any) => {
  try {
    const { data } = await getDocDetail(row.id)
    if (data) {
      // 设置当前文档数据
      currentDoc.value = {
        id: data.id,
        title: data.title,
        content: data.content,
        project_id: row.project_id, // 从列表数据中获取
        version: data.version
      }
      editDialogVisible.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取文档详情失败')
  }
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.document-container {
  padding: 20px;
  
  .search-card {
    margin-bottom: 20px;

    :deep(.el-form--inline) {
      .el-form-item {
        margin-right: 16px;
        
        &.project-select {
          margin-right: 16px;
          
          .el-select {
            width: 240px;
          }
        }
      }
    }
  }
  
  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 12px;
        
        :deep(.el-upload) {
          margin-right: 12px;
        }
      }
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }

  .editor-container {
    display: flex;
    gap: 20px;
    height: 60vh;
    
    .editor-left,
    .editor-right {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 4px;
    }
    
    .editor-right {
      background-color: #fafafa;
      
      .preview-header {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--el-border-color);
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .right-buttons {
      display: flex;
      gap: 12px;
    }
  }

  :deep(.doc-preview-dialog) {
    .el-dialog__header {
      display: none;
    }
    
    .el-dialog__body {
      padding: 0;
      background-color: #f5f7fa;
    }

    .markdown-body {
      h1:first-child {
        text-align: center !important;
        margin: 0 0 1em !important;
        padding-bottom: 0.5em;
        border-bottom: 1px solid #ebeef5;
      }
    }
  }

  .doc-content {
    max-width: 1200px;
    margin: 40px auto;
    padding: 48px;
    min-height: calc(100vh - 80px);
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    
    .doc-header {
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 1px solid #ebeef5;
      text-align: center;

      .doc-title {
        text-align: center !important;
        font-size: 32px;
        font-weight: 600;
        margin: 0 auto 24px;
        max-width: 80%;
        color: #303133;
        display: block;
      }
      
      .doc-info {
        color: #606266;
        font-size: 14px;
        line-height: 1.8;
        padding-left: 2px;
        text-align: left;
        
        .info-item {
          margin-bottom: 8px;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
    
    .doc-body {
      max-width: 900px;
      margin: 0 auto;
      padding: 0;
      color: #2c3e50;
      line-height: 1.6;
      
      :deep(h1, h2, h3, h4, h5, h6) {
        margin-top: 1.5em;
        margin-bottom: 1em;
        font-weight: 600;
        line-height: 1.25;
      }
      
      :deep(p) {
        margin: 1em 0;
        line-height: 1.8;
      }
      
      :deep(code) {
        background-color: #f8f9fa;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
        color: #476582;
      }
      
      :deep(pre) {
        margin: 1em 0;
        padding: 1em;
        background-color: #282c34;
        border-radius: 6px;
        overflow: auto;
        
        code {
          background-color: transparent;
          padding: 0;
          color: #abb2bf;
        }
      }
      
      :deep(blockquote) {
        margin: 1em 0;
        padding: 0.5em 1em;
        color: #666;
        background-color: #f8f9fa;
        border-left: 4px solid #42b983;
      }
      
      :deep(img) {
        max-width: 100%;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
      
      :deep(table) {
        width: 100%;
        margin: 1em 0;
        border-collapse: collapse;
        
        th, td {
          padding: 0.75em;
          border: 1px solid #dcdfe6;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
      }
    }
  }
}

:deep(.markdown-body) {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  
  pre {
    background-color: #f6f8fa;
    border-radius: 6px;
    padding: 16px;
    overflow: auto;
  }
  
  code {
    background-color: rgba(27,31,35,0.05);
    border-radius: 3px;
    padding: 0.2em 0.4em;
    font-size: 85%;
  }
}

.selected-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

:deep(.el-upload__tip) {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style> 