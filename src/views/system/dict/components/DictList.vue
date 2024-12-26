<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>字典管理</span>
        <!-- <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增字典
        </el-button> -->
      </div>
    </template>

    <!-- 搜索区域 -->
    <div class="search-bar">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="字典名称">
          <el-input 
            v-model="queryParams.dict_name" 
            placeholder="请输入字典名称" 
            clearable 
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <el-table
      v-loading="loading"
      :data="dictList"
      style="width: 100%"
      border
    >
      <el-table-column prop="dict_name" label="字典名称" />
      <el-table-column prop="table_name" label="字典编码" />
      <el-table-column prop="key_name" label="键字段名" />
      <el-table-column prop="value_name" label="值字段名" />
      <el-table-column label="创建时间">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
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
            管理字典项
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
        :current-page="queryParams.page"
        :page-size="queryParams.page_size"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 查看弹窗 -->
    <DictView
      :visible="viewDialogVisible"
      :dict="currentDict"
      @update:visible="val => viewDialogVisible = val"
    />

    <!-- 编辑弹窗 -->
    <DictForm
      :visible="editDialogVisible"
      :dict="currentDict"
      @update:visible="val => editDialogVisible = val"
      @success="handleSuccess"
    />

    <!-- 字典项编辑弹窗 -->
    <DictItemForm
      :visible="itemFormVisible"
      :dict="currentDict"
      @update:visible="val => itemFormVisible = val"
      @success="handleSuccess"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDictList, deleteDict } from '@/api/dict'
import type { DictItem } from '@/types/dict'
import DictView from './DictView.vue'
import DictForm from './DictForm.vue'
import DictItemForm from './DictItemForm.vue'

// 查询参数
const queryParams = reactive({
  page: 1,
  page_size: 10,
  dict_name: ''
})

// 表格数据
const dictList = ref<DictItem[]>([])
const loading = ref(false)
const total = ref(0)

// 弹窗控制
const viewDialogVisible = ref(false)
const editDialogVisible = ref(false)
const itemFormVisible = ref(false)
const currentDict = ref<DictItem>({} as DictItem)

// 获取字典列表
const getList = async () => {
  loading.value = true
  try {
    const params = {
      page: queryParams.page,
      page_size: queryParams.page_size,
      dict_name: queryParams.dict_name || undefined
    }
    const { data } = await getDictList(params)
    console.log('API Response:', data)
    dictList.value = data
    total.value = data.length
  } catch (error: any) {
    console.error('获取字典列表失败:', error)
    ElMessage.error(error.message || '获取字典列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.dict_name = ''
  handleQuery()
}

// 查看字典
const handleView = (row: DictItem) => {
  currentDict.value = { ...row }
  viewDialogVisible.value = true
}

// 编辑字典项
const handleEdit = (row: DictItem) => {
  currentDict.value = { ...row }
  itemFormVisible.value = true
}

// 删除字典
const handleDelete = async (row: DictItem) => {
  try {
    await ElMessageBox.confirm(`确认要删除字典"${row.dict_name}"吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    const { data: res } = await deleteDict(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 分页
const handleSizeChange = (val: number) => {
  queryParams.page_size = val
  getList()
}

const handleCurrentChange = (val: number) => {
  queryParams.page = val
  getList()
}

// 操作成功回调
const handleSuccess = () => {
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
}
</style> 