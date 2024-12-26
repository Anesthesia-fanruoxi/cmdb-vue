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
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="用户名">
            <el-input 
              v-model="queryParams.username" 
              placeholder="请输入用户名" 
              clearable 
              @input="handleSearch"
            />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input 
              v-model="queryParams.name" 
              placeholder="请输入昵称" 
              clearable 
              @input="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select 
              v-model="queryParams.status" 
              placeholder="请选择状态" 
              clearable 
              style="width: 160px"
              @change="handleSearch"
            >
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户列表 -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="昵称" />
        <el-table-column label="手机号">
          <template #default="{ row }">
            <el-tooltip 
              :content="row.phone" 
              placement="right"
              :show-after="0"
              :hide-after="0"
            >
              <span 
                @dblclick="copyToClipboard(row.phone)" 
                class="phone-number"
              >
                {{ maskPhoneNumber(row.phone) }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" show-overflow-tooltip />
        <el-table-column label="部门">
          <template #default="{ row }">
            <el-tag 
              v-if="row.department?.name" 
              size="small" 
              :type="getDepartmentTagType(row.department.code)"
              effect="plain"
            >
              {{ row.department.name }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="角色">
          <template #default="{ row }">
            <el-tag 
              v-if="row.role?.name" 
              size="small" 
              :type="getRoleTagType(row.role.code)"
              effect="plain"
            >
              {{ row.role.name }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button 
              link 
              :type="row.status === 'enabled' ? 'danger' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="formData.username" 
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>
        <template v-if="isEdit">
          <el-form-item label="修改密码">
            <el-switch v-model="formData.changePassword" />
          </el-form-item>
          <el-form-item 
            v-if="formData.changePassword"
            label="新密码" 
            prop="password"
          >
            <el-input 
              v-model="formData.password" 
              type="password"
              placeholder="请输入新密码" 
              show-password
            />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item 
            label="密码" 
            prop="password"
          >
            <el-input 
              v-model="formData.password" 
              type="password"
              placeholder="请输入密码" 
              show-password
            />
          </el-form-item>
        </template>
        <el-form-item label="姓名">
          <el-input v-model="formData.nickname" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门">
          <el-tree-select
            v-model="departmentId"
            :data="departmentOptions"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择部门"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="formData.role_id"
            placeholder="请选择角色"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import { Plus, Edit, Delete, Search } from "@element-plus/icons-vue"
import { getUserList, createUser, updateUser, deleteUser, updateUserStatus, resetUserPassword } from "@/api/user"
import type { UserListItem, UserQueryParams, CreateUserParams, UpdateUserParams } from "@/api/user"
import { getRoleList } from "@/api/role"
import type { Role } from "@/api/role"
import { getDepartmentList } from "@/api/department"
import type { Department } from "@/api/department"

// 查询参数
const queryParams = reactive<UserQueryParams>({
  username: '',
  name: '',
  phone: '',
  email: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

// 表格数据接口
interface TableUser extends Omit<UserListItem, 'role'> {
  name: string
  status: 'enabled' | 'disabled'
  role: {
    id: number
    name: string
    code: string
  }
}

// 表格数据
const tableData = ref<TableUser[]>([])
const total = ref(0)
const loading = ref(false)

// 弹窗表单
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const originalFormData = ref<any>(null)

// 表单数据
const formData = reactive<{
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  password: string
  changePassword: boolean
  role_id: number
  department: Department
}>({
  id: 0,
  username: '',
  nickname: '',
  phone: '',
  email: '',
  password: '',
  changePassword: false,
  role_id: 0,
  department: {
    id: 0,
    name: '',
    code: '',
    parent_id: null,
    description: '',
    sort: 0,
    created_at: '',
    updated_at: ''
  }
})

// 表单校验规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 角色选项
const roleOptions = ref<Role[]>([])
const departmentOptions = ref<Department[]>([])

// 部门ID的计算属性
const departmentId = computed({
  get: () => formData.department.id === 0 ? null : formData.department.id,
  set: (val) => {
    formData.department.id = val || 0
  }
})

// 获取用户列表
const getList = async () => {
  try {
    loading.value = true
    const res = await getUserList(queryParams)
    if (res.data) {
      tableData.value = res.data.list.map(user => ({
        ...user,
        name: user.nickname,
        status: user.is_enabled ? 'enabled' : 'disabled'
      }))
      total.value = res.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置搜索
const resetSearch = () => {
  queryParams.username = ''
  queryParams.name = ''
  queryParams.phone = ''
  queryParams.email = ''
  queryParams.status = ''
  queryParams.pageNum = 1
  getList()
}

// 新增用户
const handleAdd = () => {
  isEdit.value = false
  formData.id = 0
  formData.username = ''
  formData.nickname = ''
  formData.phone = ''
  formData.email = ''
  formData.password = ''
  formData.changePassword = false
  formData.role_id = 0
  formData.department = {
    id: 0,
    name: '',
    code: '',
    parent_id: null,
    description: '',
    sort: 0,
    created_at: '',
    updated_at: ''
  }
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: TableUser) => {
  isEdit.value = true
  formData.id = row.id
  formData.username = row.username
  formData.nickname = row.nickname
  formData.phone = row.phone
  formData.email = row.email
  formData.changePassword = false
  formData.password = ''
  formData.role_id = row.role?.id || 0
  formData.department = {
    id: row.department?.id || 0,
    name: row.department?.name || '',
    code: row.department?.code || '',
    parent_id: row.department?.parent_id || null,
    description: '',
    sort: 0,
    created_at: '',
    updated_at: ''
  }
  // 保存原始数据用于比较
  originalFormData.value = {
    nickname: row.nickname,
    phone: row.phone,
    email: row.email,
    role_id: row.role?.id || 0,
    department: { ...formData.department }
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (!isEdit.value) {
      // 创建用户
      const createData: CreateUserParams = {
        username: formData.username || '',
        password: formData.password || '',
        nickname: formData.nickname || '',
        phone: formData.phone || '',
        email: formData.email || '',
        is_enabled: true,  // 默认启用
        role_id: formData.role_id,
        dept_id: formData.department?.id || undefined
      }
      await createUser(createData)
      ElMessage.success('创建成功')
      dialogVisible.value = false
      getList()
    } else {
      if (!formData.id) {
        ElMessage.error('用户ID不能为空')
        return
      }

      // 只收集修改过的字段
      const updateData: UpdateUserParams = {
        id: formData.id
      }
      
      // 比较每个字段，只添加修改过的
      if (formData.nickname !== originalFormData.value.nickname) {
        updateData.nickname = formData.nickname
      }
      if (formData.phone !== originalFormData.value.phone) {
        updateData.phone = formData.phone
      }
      if (formData.email !== originalFormData.value.email) {
        updateData.email = formData.email
      }
      if (formData.changePassword && formData.password) {
        updateData.password = formData.password
      }
      
      // 比较角色是否有变化
      if (formData.role_id !== originalFormData.value.role_id) {
        updateData.role_id = formData.role_id
      }
      
      // 比较部门是否有变化
      if (formData.department?.id !== originalFormData.value.department.id) {
        updateData.dept_id = formData.department?.id || undefined
      }
      
      // 如果没有任何修改，直接返回
      if (Object.keys(updateData).length === 1) {
        ElMessage.info('没有任何修改')
        return
      }
      
      console.log('更新用户信息请求数据:', updateData)
      await updateUser(updateData)
      ElMessage.success('更新成功')
      dialogVisible.value = false
      getList()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 切换状态
const handleToggleStatus = async (row: TableUser) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}该用户？`, '提示', {
      type: 'warning'
    })
    
    const updateData: UpdateUserParams = {
      id: row.id,
      is_enabled: row.status === 'enabled' ? false : true
    }
    await updateUser(updateData)
    ElMessage.success(`${action}成功`)
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error(`${action}失败:`, error)
      ElMessage.error(`${action}失败`)
    }
  }
}

// 删除用户
const handleDelete = async (row: TableUser) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
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

// 分页
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  getList()
}

// 获取角色列表
const getRoles = async () => {
  try {
    const res = await getRoleList()
    roleOptions.value = res.data.list
  } catch (error: any) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  }
}

// 获部门列表
const getDepartments = async () => {
  try {
    const res = await getDepartmentList()
    departmentOptions.value = res.data.list
  } catch (error: any) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
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

// 初始化
onMounted(() => {
  getList()
  getRoles()
  getDepartments()
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
}

:deep(.el-tag) {
  margin-right: 4px;
}
</style>