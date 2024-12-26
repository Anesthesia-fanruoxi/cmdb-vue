<template>
  <div class="department-manage">
    <div class="header">
      <h2 class="title">部门管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增部门
      </el-button>
    </div>

    <el-card class="content-card">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <div class="search-wrapper">
          <el-form :inline="true" :model="queryParams" class="search-form">
            <el-form-item>
              <el-input
                v-model="queryParams.keyword"
                placeholder="请输入部门名称或代码"
                clearable
                :prefix-icon="Search"
                size="default"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="default" @click="handleQuery">
                搜索
              </el-button>
              <el-button size="default" @click="resetQuery">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="filteredDepartmentList"
        border
        stripe
        highlight-current-row
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="部门名称" min-width="15%" />
        <el-table-column prop="code" label="部门代码" min-width="10%" />
        <el-table-column prop="description" label="描述" min-width="20%" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="created_at" label="创建时间" min-width="15%" />
        <el-table-column prop="updated_at" label="更新时间" min-width="15%" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 部门表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新增部门' : '编辑部门'"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门代码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入部门代码" />
        </el-form-item>
        <el-form-item label="上级部门" prop="parent_id">
          <el-tree-select
            v-model="formData.parent_id"
            :data="departmentList"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择上级部门"
            clearable
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入部门描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getDepartmentList, createDepartment, updateDepartment, deleteDepartment } from '@/api/department'
import type { Department } from '@/api/department'

// 查询参数
const queryParams = reactive({
  keyword: ''
})

// 数据相关
const loading = ref(false)
const departmentList = ref<Department[]>([])

// 过滤后的部门列表
const filteredDepartmentList = computed(() => {
  if (!queryParams.keyword) {
    return departmentList.value
  }
  const keyword = queryParams.keyword.toLowerCase()
  return departmentList.value.filter(dept => 
    dept.name.toLowerCase().includes(keyword) || 
    dept.code.toLowerCase().includes(keyword) || 
    dept.description?.toLowerCase().includes(keyword)
  )
})

// 获取部门列表
const getList = async () => {
  try {
    loading.value = true
    const res = await getDepartmentList()
    if (res.data?.list) {
      departmentList.value = res.data.list
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取部门列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  // 前端搜索，不需要重新请求
}

// 重置
const resetQuery = () => {
  queryParams.keyword = ''
}

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 表单数据
const formData = reactive({
  id: 0,
  name: '',
  code: '',
  parent_id: null as number | null,
  description: '',
  sort: 0
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入部门代码', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '部门代码只能包含大写字母和数字', trigger: 'blur' }
  ]
}

// 新增部门
const handleAdd = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
  formData.id = 0
  formData.name = ''
  formData.code = ''
  formData.parent_id = null
  formData.description = ''
  formData.sort = 0
}

// 编辑部门
const handleEdit = (row: Department) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(formData, row)
}

// 删除部门
const handleDelete = async (row: Department) => {
  try {
    await ElMessageBox.confirm('确定要删除该部门吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    const res = await deleteDepartment(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (dialogType.value === 'create') {
      const res = await createDepartment(formData)
      if (res.code === 200) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        getList()
      }
    } else {
      const res = await updateDepartment(formData)
      if (res.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        getList()
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped>
.department-manage {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.content-card {
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  display: flex;
  align-items: center;
}
</style> 