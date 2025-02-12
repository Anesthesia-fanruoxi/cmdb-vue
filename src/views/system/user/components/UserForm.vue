<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="500px"
    @closed="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input 
          v-model="formData.username" 
          :disabled="isEdit"
          placeholder="请输入用户名"
        />
      </el-form-item>
      
      <!-- 只有管理员才显示角色选择 -->
      <el-form-item 
        v-if="isAdmin" 
        label="角色" 
        prop="role_id"
      >
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
      
      <!-- 只有管理员才显示部门选择 -->
      <el-form-item 
        v-if="isAdmin" 
        label="部门" 
        prop="dept_id"
      >
        <el-tree-select
          v-model="formData.dept_id"
          :data="departmentOptions"
          :props="{ label: 'name', value: 'id' }"
          placeholder="请选择部门"
        />
      </el-form-item>

      <!-- 密码相关表单项 -->
      <password-fields 
        v-model:password="formData.password"
        v-model:change-password="formData.changePassword"
        :is-edit="isEdit"
      />

      <el-form-item label="姓名">
        <el-input v-model="formData.nickname" placeholder="请输入姓名" />
      </el-form-item>
      
      <el-form-item label="手机号">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      
      <el-form-item label="邮箱">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUserInfo } from '@/api/user'
import type { UserInfo } from '@/api/user'
import PasswordFields from './PasswordFields.vue'
import type { Department } from '@/api/department'
import type { Role } from '@/api/role'
import type { CreateUserParams, UpdateUserParams } from '@/api/user'

const props = defineProps<{
  modelValue: boolean
  isEdit: boolean
  roleOptions: Role[]
  departmentOptions: Department[]
  currentUser?: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: CreateUserParams | UpdateUserParams): void
  (e: 'cancel'): void
}>()

// 密码验证规则
const validatePassword = (rule: any, value: string, callback: any) => {
  // 编辑时，如果没有选择修改密码，则不验证
  if (props.isEdit && !formData.changePassword) {
    callback()
    return
  }
  
  // 新建用户或选择修改密码时，密码必填
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }

  // 密码格式验证
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,32}$/
  if (!passwordRegex.test(value)) {
    callback(new Error('密码必须包含大小写字母和数字，长度8-32位'))
    return
  }
  
  callback()
}

// 当前用户信息
const currentUserInfo = ref<UserInfo | null>(null)

// 判断当前用户角色
const isAdmin = computed(() => currentUserInfo.value?.role.code === 'admin')
const isSupervisor = computed(() => currentUserInfo.value?.role.code === 'supervisor')

// 获取当前用户信息
const loadCurrentUserInfo = async () => {
  try {
    const { data } = await getUserInfo()
    currentUserInfo.value = data
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    ElMessage.error(error.message || '获取用户信息失败')
  }
}

// 判断角色是否应该被禁用
const shouldDisableRole = (role: Role) => {
  if (isAdmin.value) {
    // 管理员可以选择所有角色，没有限制
    return false
  }
  
  if (isSupervisor.value && !props.isEdit) {
    // 主管创建用户时只能选择普通用户角色
    return role.code !== 'normal'
  }
  
  // 其他情况禁用所有角色选项
  return true
}

// 控制角色选择框的整体禁用状态
const isRoleDisabled = computed(() => {
  if (isAdmin.value) {
    // 管理员可以随意修改
    return false
  }
  
  if (isSupervisor.value) {
    // 主管编辑时不能修改角色
    return props.isEdit
  }
  
  // 其他用户不能修改角色
  return true
})

// 控制部门选择的禁用状态
const isDeptDisabled = computed(() => {
  if (isAdmin.value) {
    // 管理员可以随意修改
    return false
  }
  
  // 主管和其他用户都不能修改部门
  return true
})

// 定义表单的响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const formData = reactive({
  id: 0,
  username: '',
  password: '',
  changePassword: false,
  nickname: '',
  phone: '',
  email: '',
  role_id: undefined as number | undefined,
  dept_id: undefined as number | undefined
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: !props.isEdit, message: '请输入密码', trigger: 'blur' }, // 新建用户时密码必填
    { validator: validatePassword, trigger: 'blur' }
  ],
  // 只有管理员需要验证角色和部门
  ...(isAdmin.value ? {
    role_id: [
      { required: true, message: '请选择角色', trigger: 'change' }
    ],
    dept_id: [
      { required: true, message: '请选择部门', trigger: 'change' }
    ]
  } : {})
}

// 表单提交前的验证
const validateForm = () => {
  if (isSupervisor.value && props.isEdit) {
    // 主管只在编辑时验证，不能修改角色和部门
    if (formData.role_id !== props.currentUser?.role.id || 
        formData.dept_id !== props.currentUser?.department.id) {
      ElMessage.error('主管不能修改用户的角色和部门')
      return false
    }
  }
  return true
}

// 表单数据初始化
const initFormData = () => {
  if (isSupervisor.value && !props.isEdit) {
    // 主管创建用户时，自动设置部门为自己的部门
    formData.dept_id = currentUserInfo.value?.department.id
  }
}

// 监听 currentUser 变化，更新表单数据
watch(
  () => props.currentUser,
  (newUser) => {
    if (newUser && props.isEdit) {
      // 编辑时填充表单数据
      Object.assign(formData, {
        id: newUser.id,
        username: newUser.username,
        nickname: newUser.nickname || '',
        phone: newUser.phone || '',
        email: newUser.email || '',
        role_id: newUser.role?.id,
        dept_id: newUser.department?.id,
        changePassword: false,
        password: ''
      })
    }
  },
  { immediate: true }
)

// 监听对话框显示状态
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && !props.isEdit) {
      // 新增用户时重置表单并设置默认值
      Object.assign(formData, {
        id: 0,
        username: '',
        nickname: '',
        phone: '',
        email: '',
        password: '',
        changePassword: false,
        role_id: undefined,
        dept_id: undefined
      })
      
      // 清除验证结果
      if (formRef.value) {
        formRef.value.clearValidate()
      }
      
      // 设置默认值
      nextTick(() => {
        initFormData()
      })
    }
  }
)

// 处理弹窗显示状态变化
const handleClose = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (!validateForm()) return
    
    const submitData = props.isEdit
      ? {
          id: formData.id,
          nickname: formData.nickname,
          phone: formData.phone,
          email: formData.email,
          ...(isAdmin.value ? {
            role_id: formData.role_id,
            dept_id: formData.dept_id
          } : {}),
          ...(formData.changePassword ? { password: formData.password } : {})
        }
      : {
          username: formData.username,
          password: formData.password,
          nickname: formData.nickname,
          phone: formData.phone,
          email: formData.email,
          ...(isAdmin.value ? {
            role_id: formData.role_id,
            dept_id: formData.dept_id
          } : {})
        }
    
    emit('submit', submitData)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

// 初始化
onMounted(async () => {
  await loadCurrentUserInfo()
})
</script> 