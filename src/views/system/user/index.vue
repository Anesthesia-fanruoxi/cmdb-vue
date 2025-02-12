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
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入用户名(支持模糊搜索)"
            clearable
            @input="handleInputChange"
          />
        </el-form-item>
        <el-form-item label="部门" prop="dept_id">
          <el-select
            v-model="queryParams.dept_id"
            placeholder="请选择部门"
            clearable
            style="width: 240px"
            @change="handleInputChange"
          >
            <el-option
              v-for="item in deptOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
            @change="handleInputChange"
          >
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表 -->
      <user-table
        :data="tableData"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle-status="handleToggleStatus"
      />
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
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getRoleList } from '@/api/role'
import { getDepartmentList } from '@/api/department'
import { getUserInfo, getUserList } from '@/api/user'
import UserForm from './components/UserForm.vue'
import SearchForm from './components/SearchForm.vue'
import UserTable from './components/UserTable.vue'
import { useUserList } from './composables/useUserList'
import { useUserForm } from './composables/useUserForm'
import { createUser, updateUser, deleteUser, updateUserStatus } from '@/api/user'
import type { CreateUserParams, UpdateUserParams, UserQueryParams, UserListItem } from '@/api/user'
import { debounce } from 'lodash-es'

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
  dialogVisible,
  isEdit,
  currentUser,
  resetForm
} = useUserForm(getList)

// 角色和部门选项
const roleOptions = ref([])
const departmentOptions = ref([])

// 当前用户信息
const currentUserInfo = ref(null)
const isAdmin = computed(() => currentUserInfo.value?.role?.code === 'admin')
const isSupervisor = computed(() => currentUserInfo.value?.role?.code === 'supervisor')

// 部门选项
const deptOptions = ref([])

// 获取当前用户信息和相关数据
const loadData = async () => {
  try {
    // 先获取当前用户信息
    const { data: userInfo } = await getUserInfo()
    currentUserInfo.value = userInfo

    // 只有管理员需要加载角色和部门数据
    if (isAdmin.value) {
      const [roleRes, deptRes] = await Promise.all([
        getRoleList(),
        getDepartmentList()
      ])
      roleOptions.value = roleRes.data.list
      departmentOptions.value = deptRes.data.list
      // 管理员也需要部门筛选选项
      deptOptions.value = deptRes.data.list
    }
    // 主管不需要加载部门数据，因为只能看到自己部门的用户
    
    // 加载用户列表
    await getList()
  } catch (error: any) {
    console.error('加载数据失败:', error)
    ElMessage.error(error.message || '加载数据失败')
  }
}

// 表单相关
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  currentUser.value = row
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: any) => {
  // 修改权限判断：管理员可以删除任何用户，主管只能删除自己部门的用户
  if (!isAdmin.value && (!isSupervisor.value || row.department?.id !== currentUserInfo.value?.department?.id)) {
    ElMessage.error('没有删除权限')
    return
  }

  try {
    await ElMessageBox.confirm(`确认删除用户"${row.nickname}"吗？`, '提示', {
      type: 'warning'
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 启用/禁用用户
const handleToggleStatus = async (row: any) => {
  // 修改权限判断：管理员可以操作任何用户，主管只能操作自己部门的用户
  if (!isAdmin.value && (!isSupervisor.value || row.department?.id !== currentUserInfo.value?.department?.id)) {
    ElMessage.error('没有操作权限')
    return
  }

  try {
    const newStatus = row.is_enabled ? 0 : 1
    await updateUserStatus(row.id, newStatus)
    ElMessage.success(`${row.is_enabled ? '禁用' : '启用'}成功`)
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 添加防抖的输入处理
const handleInputChange = debounce(() => {
  getList()
}, 300)

// 修改重置方法，重置后自动触发搜索
const resetQuery = () => {
  queryParams.value = {
    username: '',
    name: '',
    phone: '',
    email: '',
    status: '',
    dept_id: undefined
  }
  handleInputChange()
}

// 表单相关
const handleFormSubmit = async (data: CreateUserParams | UpdateUserParams) => {
  try {
    if (isEdit.value) {
      await updateUser(data as UpdateUserParams)
      ElMessage.success('更新成功')
    } else {
      // 创建用户时，根据当前用户角色处理数据
      const submitData = {
        ...data,
        // 如果是主管，设置固定部门，不传角色
        ...(isSupervisor.value ? {
          dept_id: currentUserInfo.value?.department?.id,
          role_id: undefined
        } : {}),
        // 如果不是管理员也不是主管，不传角色和部门
        ...(!isAdmin.value && !isSupervisor.value ? {
          role_id: undefined,
          dept_id: undefined
        } : {})
      }

      // 创建用户
      await createUser(submitData as CreateUserParams)
      ElMessage.success('创建成功')
    }

    // 关闭弹窗并刷新列表
    dialogVisible.value = false
    await getList() // 使用 await 确保列表刷新完成
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleFormCancel = () => {
  dialogVisible.value = false
}

// 初始化
onMounted(() => {
  loadData()
})
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
  margin-bottom: 16px;
}

:deep(.el-tag) {
  margin-right: 4px;
}

:deep(.el-select) {
  width: 100%;
}
</style>