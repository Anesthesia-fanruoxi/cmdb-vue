<template>
  <template v-if="isEdit">
    <el-form-item label="修改密码">
      <el-switch v-model="changePasswordValue" />
    </el-form-item>
    <el-form-item
      v-if="changePasswordValue"
      label="新密码"
      prop="password"
    >
      <el-input
        v-model="passwordValue"
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
      :rules="[
        { required: true, message: '请输入密码', trigger: 'blur' },
        { validator: validatePassword, trigger: 'blur' }
      ]"
    >
      <el-input
        v-model="passwordValue"
        type="password"
        placeholder="请输入密码"
        show-password
      />
    </el-form-item>
  </template>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  password: string
  changePassword: boolean
  isEdit: boolean
}>()

const emit = defineEmits<{
  (e: 'update:password', value: string): void
  (e: 'update:changePassword', value: boolean): void
}>()

const passwordValue = ref(props.password)
const changePasswordValue = ref(props.changePassword)

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

watch(passwordValue, (val) => {
  emit('update:password', val)
})

watch(changePasswordValue, (val) => {
  emit('update:changePassword', val)
})

watch(() => props.password, (val) => {
  passwordValue.value = val
})

watch(() => props.changePassword, (val) => {
  changePasswordValue.value = val
})
</script> 