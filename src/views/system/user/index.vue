<template>
  <div class="user-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增用户
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <search-form
        @search="handleSearch"
        @reset="handleSearchReset"
      />

      <!-- 用户列表 -->
      <user-table
        :data="tableData"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle-status="handleToggleStatus"
      />

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户表单弹窗 -->
    <user-form
      v-model="dialogVisible"
      :is-edit="isEdit"
      :role-options="roleOptions"
      :department-options="departmentOptions"
      :current-user="currentUser"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getRoleList } from '@/api/role'
import { getDepartmentList } from '@/api/department'
import UserForm from './components/UserForm.vue'
import SearchForm from './components/SearchForm.vue'
import UserTable from './components/UserTable.vue'
import { useUserList } from './composables/useUserList'
import { useUserForm } from './composables/useUserForm'
import { createUser, updateUser } from '@/api/user'
import type { CreateUserParams, UpdateUserParams } from '@/api/user'

const {
  tableData,
  total,
  loading,
  queryParams,
  getList,
  handleSizeChange,
  handleCurrentChange
} = useUserList()

const {
  formRef,
  dialogVisible,
  isEdit,
  formData,
  currentUser,
  resetForm,
  handleSubmit,
  handleEdit,
  handleDelete,
  handleToggleStatus
} = useUserForm(getList)

// 角色和部门选项
const roleOptions = ref([])
const departmentOptions = ref([])

// 初始化数据
onMounted(async () => {
  getList()
  await Promise.all([
    getRoleList().then(res => roleOptions.value = res.data.list),
    getDepartmentList().then(res => departmentOptions.value = res.data.list)
  ])
})

// 搜索相关
const handleSearch = () => {
  queryParams.pageNum = 1
  getList()
}

const handleSearchReset = () => {
  queryParams.pageNum = 1
  getList()
}

// 表单相关
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleFormSubmit = async (data: CreateUserParams | UpdateUserParams) => {
  try {
    if (isEdit.value) {
      await updateUser(data as UpdateUserParams)
      ElMessage.success('更新成功')
    } else {
      await createUser(data as CreateUserParams)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleFormCancel = () => {
  dialogVisible.value = false
}

// 重置密码
const handleResetPassword = async (row: TableUser) => {
  try {
    await ElMessageBox.confirm('确定要重置该用户的密码吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await resetUserPassword(row.id)
    ElMessage.success('密码重置成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '密码重置失败')
    }
  }
}

// 手机号脱敏
const maskPhoneNumber = (phone: string) => {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 获取标签类型的通用函数
const getTagType = (code: string, isRole = false): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  if (!code) return 'info'
  // 使用字符串的ASCII码值总和来决定颜色
  const sum = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  // 角色和部门使用不同的颜色顺序，避免相似代码的角色和部门用同样的颜色
  const types: Array<'success' | 'warning' | 'info' | 'primary' | 'danger'> = isRole
    ? ['success', 'warning', 'info', 'primary', 'danger']
    : ['primary', 'success', 'warning', 'danger', 'info']
  return types[sum % types.length]
}

// 获取角色标签类型
const getRoleTagType = (code: string) => getTagType(code, true)

// 获取部门标签类型
const getDepartmentTagType = (code: string) => getTagType(code, false)
</script>

<style scoped>
.user-manage {
  padding: 16px;
  height: 100%;
  background-color: #f0f2f5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.phone-number {
  cursor: pointer;
  color: #606266;
}

.phone-number:hover {
  color: #409EFF;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
}

:deep(.el-tag) {
  margin-right: 4px;
}
</style>