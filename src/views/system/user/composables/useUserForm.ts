import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { createUser, updateUser, deleteUser } from '@/api/user'
import type { CreateUserParams, UpdateUserParams } from '@/api/user'
import type { TableUser } from '../types'

export function useUserForm(refreshList: () => void) {
  const formRef = ref<FormInstance>()
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const submitLoading = ref(false)
  const originalFormData = ref<any>(null)
  const currentUser = ref<TableUser | null>(null)

  const formData = reactive({
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

  const resetForm = () => {
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
  }

  const handleEdit = (row: TableUser) => {
    isEdit.value = true
    currentUser.value = row
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
    
    originalFormData.value = {
      nickname: row.nickname,
      phone: row.phone,
      email: row.email,
      role_id: row.role?.id || 0,
      department: { ...formData.department }
    }
    dialogVisible.value = true
  }

  const handleToggleStatus = async (row: TableUser) => {
    const action = row.status === 'enabled' ? '禁用' : '启用'
    try {
      await ElMessageBox.confirm(`确认${action}该用户？`, '提示', {
        type: 'warning'
      })
      
      await updateUser({
        id: row.id,
        is_enabled: row.status === 'enabled' ? false : true
      })
      ElMessage.success(`${action}成功`)
      refreshList()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error(`${action}失败:`, error)
        ElMessage.error(`${action}失败`)
      }
    }
  }

  const handleDelete = async (row: TableUser) => {
    try {
      await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      refreshList()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    
    try {
      await formRef.value.validate()
      submitLoading.value = true
      
      if (!isEdit.value) {
        await createUser({
          username: formData.username,
          password: formData.password,
          nickname: formData.nickname,
          phone: formData.phone,
          email: formData.email,
          is_enabled: true,
          role_id: formData.role_id,
          dept_id: formData.department?.id
        })
        ElMessage.success('创建成功')
      } else {
        const updateData: UpdateUserParams = { 
          id: formData.id,
          nickname: formData.nickname,
          phone: formData.phone,
          email: formData.email,
          role_id: formData.role_id,
          dept_id: formData.department?.id
        }

        if (formData.changePassword && formData.password) {
          updateData.password = formData.password
        }
        
        console.log('更新用户信息:', updateData)
        await updateUser(updateData)
        ElMessage.success('更新成功')
      }
      
      dialogVisible.value = false
      refreshList()
    } catch (error: any) {
      ElMessage.error(error.message || '提交失败')
    } finally {
      submitLoading.value = false
    }
  }

  return {
    formRef,
    dialogVisible,
    isEdit,
    formData,
    currentUser,
    originalFormData,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleToggleStatus
  }
} 