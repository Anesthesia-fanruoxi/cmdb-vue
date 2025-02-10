<template>
  <el-form-item 
    label="新密码" 
    prop="password"
  >
    <el-input 
      v-model="passwordValue" 
      type="password"
      placeholder="必须包含大小写字母和数字，长度8-32位" 
      show-password
      @input="handlePasswordInput"
    />
  </el-form-item>
  <el-form-item 
    label="确认密码" 
    prop="confirmPassword"
  >
    <el-input 
      v-model="confirmPasswordValue" 
      type="password"
      placeholder="请再次输入新密码" 
      show-password
    />
  </el-form-item>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  password: string
  confirmPassword: string
}>()

const emit = defineEmits<{
  (e: 'update:password', value: string): void
  (e: 'update:confirmPassword', value: string): void
}>()

const passwordValue = ref(props.password)
const confirmPasswordValue = ref(props.confirmPassword)

watch(() => props.password, (newVal) => {
  passwordValue.value = newVal
})

watch(() => props.confirmPassword, (newVal) => {
  confirmPasswordValue.value = newVal
})

watch(passwordValue, (newVal) => {
  emit('update:password', newVal)
})

watch(confirmPasswordValue, (newVal) => {
  emit('update:confirmPassword', newVal)
})
</script> 