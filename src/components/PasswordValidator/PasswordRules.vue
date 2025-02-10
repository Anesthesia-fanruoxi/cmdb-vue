<template>
  <div class="password-rules">
    <div 
      v-for="(rule, index) in rules" 
      :key="index"
      class="rule-item"
      :class="{ 'is-valid': rule.valid }"
    >
      <el-icon :class="{ 'is-valid': rule.valid }">
        <component :is="rule.valid ? 'CircleCheck' : 'CircleClose'" />
      </el-icon>
      <span>{{ rule.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { passwordRules } from '@/utils/validators/password'

const props = defineProps<{
  password: string
}>()

const emit = defineEmits<{
  (e: 'update:isValid', value: boolean): void
}>()

const rules = ref(passwordRules.map(rule => ({
  ...rule,
  valid: false
})))

// 验证密码
const validatePassword = (password: string) => {
  rules.value.forEach(rule => {
    rule.valid = rule.validator(password)
  })
  
  // 检查是否所有规则都通过
  const isValid = rules.value.every(rule => rule.valid)
  emit('update:isValid', isValid)
}

// 监听密码变化
watch(() => props.password, validatePassword, { immediate: true })
</script>

<style scoped>
.password-rules {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.el-icon {
  font-size: 14px;
  color: var(--el-color-danger);
}

.el-icon.is-valid {
  color: var(--el-color-success);
}

.rule-item.is-valid {
  color: var(--el-text-color-secondary);
  text-decoration: line-through;
}
</style> 