<template>
  <div class="recycle-bin">
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
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="loading"
      :data="documentList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }">
          <span class="document-title">{{ row.title || '无标题' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="project_id" label="所属项目" width="120">
        <template #default="{ row }">
          {{ row.project_id }}
        </template>
      </el-table-column>
      <el-table-column label="删除人" width="120">
        <template #default="{ row }">
          {{ row.deleter?.Nickname }}
        </template>
      </el-table-column>
      <el-table-column prop="deleted_at" label="删除时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.deleted_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            link
            @click.stop="handleRestore(row.id)"
          >
            恢复
          </el-button>
          <el-button 
            type="danger" 
            link
            @click.stop="handleDelete(row.id)"
          >
            彻底删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 预览抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="`预览文档 - ${currentDoc?.title || '无标题'}`"
      size="50%"
      destroy-on-close
    >
      <document-preview
        v-if="currentDoc"
        :content="currentDoc.content"
        :title="currentDoc.title"
        :author="currentDoc.deleter?.Nickname"
        :update-time="currentDoc.deleted_at"
        :project-id="currentDoc.project_id"
      />
    </el-drawer>

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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { RecycleDocument } from '@/types/knowledge'
import { 
  getRecycleList, 
  restoreDocument, 
  removeDocument,
  batchRestore,
  batchRemove 
} from '@/api/knowledge'
import DocumentPreview from '@/components/DocumentPreview/index.vue'

const loading = ref(false)
const total = ref(0)
const documentList = ref<RecycleDocument[]>([])
const selectedIds = ref<number[]>([])
const dateRange = ref<[string, string]>(['', ''])

const queryParams = reactive({
  keyword: '',
  page: 1,
  page_size: 20,
  startTime: '',
  endTime: ''
})

// 预览相关
const drawerVisible = ref(false)
const currentDoc = ref<RecycleDocument | null>(null)

// 添加日期格式化函数
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

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    console.log('请求参数:', {
      project: 1,
      page: queryParams.page,
      page_size: queryParams.page_size,
      keyword: queryParams.keyword,
      startTime: queryParams.startTime,
      endTime: queryParams.endTime
    })
    
    const response = await getRecycleList({
      project: 1,
      page: queryParams.page,
      page_size: queryParams.page_size,
      keyword: queryParams.keyword,
      startTime: queryParams.startTime,
      endTime: queryParams.endTime
    })
    
    console.log('API响应:', response)
    
    if (response.code === 200 && response.data) {
      documentList.value = response.data.list
      total.value = response.data.total
    } else {
      throw new Error(response.msg || '获取数据失败')
    }
  } catch (error: any) {
    console.error('获取回收站列表失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    ElMessage.error(error.response?.data?.msg || '获取列表失败')
  } finally {
    loading.value = false
  }
}

// 恢复文档
const handleRestore = async (id: number) => {
  try {
    await restoreDocument({ id })
    ElMessage.success('文档恢复成功')
    getList()
  } catch (error) {
    console.error('恢复文档失败:', error)
    ElMessage.error('恢复失败')
  }
}

// 彻底删除
const handleDelete = async (id: number) => {
  ElMessageBox.confirm('此操作将永久删除该文档, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await removeDocument(id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除文档失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 批量操作相关方法
const handleSelectionChange = (selection: RecycleDocument[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 搜索和重置
const handleSearch = () => {
  queryParams.page = 1
  if (dateRange.value) {
    [queryParams.startTime, queryParams.endTime] = dateRange.value
  }
  getList()
}

const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.page = 1
  dateRange.value = ['', '']
  queryParams.startTime = ''
  queryParams.endTime = ''
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

// 点击行显示预览
const handleRowClick = (row: RecycleDocument) => {
  currentDoc.value = row
  drawerVisible.value = true
}

// 初始化
getList()
</script>

<style scoped>
.recycle-bin {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.document-title {
  color: #409EFF;
  cursor: pointer;
}

.document-title:hover {
  text-decoration: underline;
}

:deep(.el-table__row) {
  cursor: pointer;
}
</style> 