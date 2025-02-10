<template>
  <template v-if="isEdit">
    <el-form-item label="修改密码">
      <el-switch v-model="changePasswordValue" @change="handleChangePassword" />
    </el-form-item>
    <el-form-item 
      v-if="changePasswordValue"
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
  </template>
  <template v-else>
    <el-form-item 
      label="密码" 
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

watch(() => props.password, (newVal) => {
  passwordValue.value = newVal
})

watch(() => props.changePassword, (newVal) => {
  changePasswordValue.value = newVal
})

const handlePasswordInput = () => {
  emit('update:password', passwordValue.value)
}

const handleChangePassword = () => {
  emit('update:changePassword', changePasswordValue.value)
  if (!changePasswordValue.value) {
    passwordValue.value = ''
    emit('update:password', '')
  }
}
</script> 