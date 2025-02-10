<template>
  <div class="profile">
    <el-card>
      <div class="profile-content">
        <!-- 左侧头像区域 -->
        <div class="avatar-section">
          <el-avatar :size="120" :src="defaultAvatar">
            {{ userInfo.nickname?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <h3 class="username">{{ userInfo.username }}</h3>
          <p class="role-name">{{ userInfo.role?.name }}</p>
          <el-button type="primary" @click="handleChangePassword">
            修改密码
          </el-button>
        </div>

        <!-- 右侧信息区域 -->
        <div class="info-section">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="80px"
          >
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="formData.nickname" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="部门">
              <el-input :model-value="userInfo.department?.name" disabled />
            </el-form-item>
          </el-form>

          <!-- 底部按钮 -->
          <div class="form-footer">
            <el-button @click="resetForm">取消</el-button>
            <el-button 
              type="primary" 
              :loading="submitLoading"
              :disabled="!isFormChanged"
              @click="handleSubmit"
            >
              保存
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <profile-password-fields 
          v-model:password="passwordForm.password"
          v-model:confirmPassword="passwordForm.confirmPassword"
        />
      </el-form>
      <template #footer>
        <el-button @click="handleCancelPassword">取消</el-button>
        <el-button 
          type="primary" 
          :loading="passwordSubmitLoading"
          @click="handlePasswordSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { getUserInfo, updateUser } from '@/api/user'
import type { UserInfo, UpdateUserParams } from '@/api/user'
import { useUserStore } from '@/store/modules/user'
import ProfilePasswordFields from './components/ProfilePasswordFields.vue'

const router = useRouter()
const userStore = useUserStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 用户信息
const userInfo = ref<UserInfo>({} as UserInfo)
const originalFormData = ref<{
  nickname: string
  email: string
  phone: string
}>({
  nickname: '',
  email: '',
  phone: ''
})

// 表单相关
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 表单数据
const formData = reactive({
  nickname: '',
  email: '',
  phone: ''
})

// 判断表单是否有修改
const isFormChanged = computed(() => {
  if (!originalFormData.value) return false
  return JSON.stringify(formData) !== JSON.stringify(originalFormData.value)
})

// 表单校验规则
const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 密码相关
const passwordDialogVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordSubmitLoading = ref(false)
const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})

// 密码验证规则
const validatePassword = (rule: any, value: string, callback: any) => {
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

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }

  if (value !== passwordForm.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  
  callback()
}

const passwordRules = {
  password: [
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 获取用户信息
const getUserData = async () => {
  try {
    const res = await getUserInfo()
    console.log('获取用户信息返回:', res)
    if (res.data) {
      userInfo.value = res.data
      // 初始化表单数据
      formData.nickname = res.data.nickname
      formData.email = res.data.email
      formData.phone = res.data.phone
      // 保存原始数据用于比较
      originalFormData.value = { ...formData }
      console.log('用户信息已更新:', userInfo.value)
      console.log('表单数据已更新:', formData)
    }
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    ElMessage.error(error.message || '获取用户信息失败')
  }
}

// 重置表单
const resetForm = () => {
  router.back()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    // 只收集修改过的字段
    const updateData: UpdateUserParams = {
      id: userInfo.value.id
    }
    
    // 比较每个字段，只添加修改过的
    if (formData.nickname !== originalFormData.value.nickname) {
      updateData.nickname = formData.nickname
    }
    if (formData.email !== originalFormData.value.email) {
      updateData.email = formData.email
    }
    if (formData.phone !== originalFormData.value.phone) {
      updateData.phone = formData.phone
    }
    
    // 如果没有任何修改，直接返回
    if (Object.keys(updateData).length === 1) {
      ElMessage.info('没有任何修改')
      return
    }
    
    console.log('更新用户信息请求数据:', updateData)
    await updateUser(updateData)
    ElMessage.success('更新成功')
    await getUserData()
  } catch (error: any) {
    console.error('更新用户信息失败:', error)
    ElMessage.error(error.message || '更新失败')
  } finally {
    submitLoading.value = false
  }
}

// 修改密码
const handleChangePassword = () => {
  passwordDialogVisible.value = true
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
}

// 修改密码弹窗的取消按钮处理
const handleCancelPassword = () => {
  passwordDialogVisible.value = false
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
}

// 提交密码修改
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordSubmitLoading.value = true
    
    const updateData: UpdateUserParams = {
      id: userInfo.value.id,
      password: passwordForm.password
    }
    
    await updateUser(updateData)
    ElMessage.success('密码修改成功，请重新登录')
    passwordDialogVisible.value = false
    await userStore.logout()
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error.message || '修改密码失败')
  } finally {
    passwordSubmitLoading.value = false
  }
}

// 确保在组件挂载后获取数据
onMounted(async () => {
  console.log('组件挂载，开始获取用户信息')
  await getUserData()
})

// 监听用户信息变化
watch(userInfo, (newVal: UserInfo) => {
  console.log('用户信息发生变化:', newVal)
  if (newVal) {
    formData.nickname = newVal.nickname || ''
    formData.email = newVal.email || ''
    formData.phone = newVal.phone || ''
    originalFormData.value = { ...formData }
  }
}, { deep: true })
</script>

<style scoped>
.profile {
  padding: 16px;
  height: 100%;
  background-color: #f0f2f5;
}

.profile-content {
  display: flex;
  gap: 40px;
  padding: 20px;
}

.avatar-section {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.username {
  margin: 16px 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.role-name {
  margin: 0 0 20px;
  color: #666;
}

.info-section {
  flex: 1;
  max-width: 500px;
}

.form-footer {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-input__wrapper) {
  width: 100%;
}
</style> 