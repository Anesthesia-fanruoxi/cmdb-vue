<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="handleVisibleChange"
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
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
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

const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  id: 0,
  username: '',
  password: '',
  changePassword: false,
  nickname: '',
  phone: '',
  email: '',
  role_id: '',
  department: {
    id: 0,
    name: '',
    code: '',
    parent_id: null
  }
})

// 监听 currentUser 变化，更新表单数据
watch(
  () => props.currentUser,
  (newUser) => {
    if (newUser && props.isEdit) {
      formData.id = newUser.id
      formData.username = newUser.username
      formData.nickname = newUser.nickname || ''
      formData.phone = newUser.phone || ''
      formData.email = newUser.email || ''
      formData.role_id = newUser.role?.id || ''
      formData.department = {
        id: newUser.department?.id || 0,
        name: newUser.department?.name || '',
        code: newUser.department?.code || '',
        parent_id: newUser.department?.parent_id || null
      }
      formData.changePassword = false
      formData.password = ''
    } else {
      // 重置表单
      formData.id = 0
      formData.username = ''
      formData.nickname = ''
      formData.phone = ''
      formData.email = ''
      formData.password = ''
      formData.changePassword = false
      formData.role_id = ''
      formData.department = {
        id: 0,
        name: '',
        code: '',
        parent_id: null
      }
    }
  },
  { immediate: true }
)

// 监听 modelValue 的变化，当弹窗打开时重置表单
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && !props.isEdit) {
      // 新增用户时重置表单
      formData.id = 0
      formData.username = ''
      formData.nickname = ''
      formData.phone = ''
      formData.email = ''
      formData.password = ''
      formData.changePassword = false
      formData.role_id = ''
      formData.department = {
        id: 0,
        name: '',
        code: '',
        parent_id: null
      }
      // 如果表单实例存在，清除验证结果
      if (formRef.value) {
        formRef.value.clearValidate()
      }
    }
  }
)

// 计算部门ID
const departmentId = computed({
  get: () => formData.department.id,
  set: (val) => {
    formData.department.id = val
  }
})

// 密码验证规则
const validatePassword = (rule: any, value: string, callback: any) => {
  if (props.isEdit && !formData.changePassword) {
    callback()
    return
  }
  
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,32}$/
  if (!passwordRegex.test(value)) {
    callback(new Error('密码必须包含大小写字母和数字，长度8-32位'))
    return
  }
  
  callback()
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { validator: validatePassword, trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' }
  ],
  role_id: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 处理弹窗显示状态变化
const handleVisibleChange = (val: boolean) => {
  emit('update:modelValue', val)
  if (!val) {
    // 关闭弹窗时也清空表单
    formData.id = 0
    formData.username = ''
    formData.nickname = ''
    formData.phone = ''
    formData.email = ''
    formData.password = ''
    formData.changePassword = false
    formData.role_id = ''
    formData.department = {
      id: 0,
      name: '',
      code: '',
      parent_id: null
    }
    // 清除验证结果
    if (formRef.value) {
      formRef.value.clearValidate()
    }
    emit('cancel')
  }
}

const handleSubmit = () => {
  if (formRef.value) {
    formRef.value.validate(async (valid) => {
      if (valid) {
        const submitData = props.isEdit
          ? {
              id: formData.id,
              nickname: formData.nickname,
              phone: formData.phone,
              email: formData.email,
              role_id: formData.role_id,
              dept_id: formData.department.id,
              ...(formData.changePassword ? { password: formData.password } : {})
            }
          : {
              username: formData.username,
              password: formData.password,
              nickname: formData.nickname,
              phone: formData.phone,
              email: formData.email,
              role_id: formData.role_id,
              dept_id: formData.department.id
            }
        
        console.log('提交数据:', submitData)
        emit('submit', submitData)
      } else {
        ElMessage.error('表单验证失败')
      }
    })
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script> 