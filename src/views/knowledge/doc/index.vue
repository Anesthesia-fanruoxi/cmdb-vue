<template>
  <div class="doc-list">
    <div class="search-bar">
      <el-form :inline="true" :model="queryParams">
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索关键词"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="success" @click="handleAdd">新建文档</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="loading"
      :data="docList"
      style="width: 100%"
    >
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }">
          <span 
            class="document-title" 
            @click.stop="handlePreview(row)"
            style="display: inline-block; width: 100%"
          >
            {{ row.title || '无标题' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="category_name" label="分类" width="120" />
      <el-table-column prop="creator_name" label="创建人" width="120" />
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column prop="updated_at" label="更新时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.updated_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            link
            @click.stop="handleView(row)"
          >
            查看
          </el-button>
          <el-button 
            type="primary" 
            link
            @click.stop="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button 
            type="danger" 
            link
            @click.stop="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 侧边预览抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="`预览文档 - ${currentDoc?.title || '无标题'}`"
      size="50%"
      destroy-on-close
      :with-header="true"
      direction="rtl"
      :modal="true"
      :show-close="true"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      class="doc-preview-drawer"
    >
      <document-preview
        v-if="currentDoc"
        :content="currentDoc.content || ''"
        :title="currentDoc.title || ''"
        :author="currentDoc.creator_name || ''"
        :update-time="currentDoc.updated_at || ''"
        :project-id="currentDoc.project_id || ''"
      />
    </el-drawer>

    <!-- 全屏预览对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentDoc?.title || '无标题'"
      width="90%"
      fullscreen
      destroy-on-close
      class="doc-preview-dialog"
    >
      <document-preview
        v-if="currentDoc"
        :content="currentDoc.content || ''"
        :title="currentDoc.title || ''"
        :author="currentDoc.creator_name || ''"
        :update-time="currentDoc.updated_at || ''"
        :project-id="currentDoc.project_id || ''"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit(currentDoc)">编辑</el-button>
      </template>
    </el-dialog>

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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Document } from '@/types/knowledge'
import { getDocList, deleteDoc } from '@/api/knowledge'
import DocumentPreview from '@/components/DocumentPreview/index.vue'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const docList = ref<Document[]>([])
const drawerVisible = ref(false)
const dialogVisible = ref(false)
const currentDoc = ref<Document | null>(null)

const queryParams = reactive({
  keyword: '',
  page: 1,
  page_size: 20,
  project_id: 1  // 根据实际情况修改
})

// 格式化日期
const formatDate = (dateStr: string) => {
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

// 获取文档列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getDocList(queryParams)
    if (res.code === 200) {
      docList.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取文档列表失败:', error)
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

// 点击标题，显示侧边预览
const handlePreview = (row: Document) => {
  console.log('预览文档:', row)
  currentDoc.value = row
  drawerVisible.value = true
  console.log('抽屉状态:', drawerVisible.value)
  console.log('当前文档:', currentDoc.value)
}

// 监听抽屉状态变化
watch(drawerVisible, (newVal) => {
  console.log('抽屉状态变化:', newVal)
})

// 点击查看按钮，显示全屏预览
const handleView = (row: Document) => {
  currentDoc.value = row
  dialogVisible.value = true
}

// 点击编辑按钮
const handleEdit = (doc: Document) => {
  if (dialogVisible.value) {
    dialogVisible.value = false
  }
  router.push(`/knowledge/doc/edit/${doc.id}`)
}

// 点击删除按钮
const handleDelete = (row: Document) => {
  ElMessageBox.confirm('确定要删除该文档吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDoc(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除文档失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 新建文档
const handleAdd = () => {
  router.push('/knowledge/doc/create')
}

// 搜索和重置
const handleSearch = () => {
  queryParams.page = 1
  getList()
}

const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.page = 1
  getList()
}

// 分页相关方法
const handleSizeChange = (val: number) => {
  queryParams.page_size = val
  getList()
}

const handleCurrentChange = (val: number) => {
  queryParams.page = val
  getList()
}

// 初始化
getList()
</script>

<style scoped>
.doc-list {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.document-title {
  color: #409EFF;
  cursor: pointer;
}

.document-title:hover {
  text-decoration: underline;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.doc-preview-dialog .el-dialog__body) {
  padding: 0;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

:deep(.doc-preview-dialog .el-dialog__header) {
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid #dcdfe6;
}

:deep(.doc-preview-dialog .el-dialog__footer) {
  margin: 0;
  padding: 20px;
  border-top: 1px solid #dcdfe6;
}
</style> 