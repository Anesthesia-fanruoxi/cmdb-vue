<template>
  <div class="role-manage">
    <div class="header">
      <h2 class="title">角色管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增角色
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
                placeholder="请输入角色名称"
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
        :data="filteredRoleList"
        border
        stripe
        highlight-current-row
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="角色名称" min-width="15%" />
        <el-table-column prop="code" label="角色编码" min-width="15%" />
        <el-table-column prop="description" label="角色描述" min-width="30%" show-overflow-tooltip />
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

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新增角色' : '编辑角色'"
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
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code" v-if="dialogType === 'create'">
          <el-input v-model="formData.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
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
import { getRoleList, createRole, updateRole, deleteRole } from '@/api/role'
import type { Role } from '@/api/role'

// 查询参数
const queryParams = reactive({
  keyword: ''
})

// 数据相关
const loading = ref(false)
const roleList = ref<Role[]>([])

// 过滤后的角色列表
const filteredRoleList = computed(() => {
  if (!queryParams.keyword) {
    return roleList.value
  }
  const keyword = queryParams.keyword.toLowerCase()
  return roleList.value.filter(role => 
    role.name.toLowerCase().includes(keyword) || 
    role.code.toLowerCase().includes(keyword) ||
    role.description.toLowerCase().includes(keyword)
  )
})

// 获取角色列表
const getList = async () => {
  try {
    loading.value = true
    const res = await getRoleList()
    if (res.data?.list) {
      roleList.value = res.data.list
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取角色列表失败')
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
  description: ''
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ]
}

// 新增角色
const handleAdd = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
  formData.id = 0
  formData.name = ''
  formData.code = ''
  formData.description = ''
}

// 编辑角色
const handleEdit = (row: Role) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(formData, row)
}

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    const res = await deleteRole(row.id)
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
      const res = await createRole(formData)
      if (res.code === 200) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        getList()
      }
    } else {
      const res = await updateRole(formData)
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
.role-manage {
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