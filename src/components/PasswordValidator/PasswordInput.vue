<template>
  <div class="password-input">
    <el-input
      v-model="password"
      type="password"
      show-password
      :placeholder="placeholder"
      @input="handleInput"
    />
    <PasswordRules
      v-if="showRules"
      :password="password"
      v-model:isValid="isValid"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PasswordRules from './PasswordRules.vue'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  showRules?: boolean
}>(), {
  placeholder: '请输入密码',
  showRules: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:isValid', value: boolean): void
}>()

const password = ref(props.modelValue)
const isValid = ref(false)

const handleInput = (value: string) => {
  emit('update:modelValue', value)
}

watch(() => isValid.value, (val) => {
  emit('update:isValid', val)
})
</script> 