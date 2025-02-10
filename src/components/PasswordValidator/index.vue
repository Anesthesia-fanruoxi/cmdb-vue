<template>
  <div class="password-validator">
    <div class="validator-rules">
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, withDefaults } from 'vue'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'

const props = defineProps<{
  password: string
  // 是否显示校验规则列表
  showRules?: boolean
  // 是否立即校验（用于编辑场景）
  immediate?: boolean
}>()

const defaultProps = withDefaults(defineProps<{
  password: string
  showRules?: boolean
  immediate?: boolean
}>(), {
  showRules: true,
  immediate: true
})

const emit = defineEmits<{
  (e: 'update:isValid', value: boolean): void
}>()

const rules = ref([
  {
    valid: false,
    message: '长度在 8 到 32 个字符',
    validator: (pwd: string) => pwd.length >= 8 && pwd.length <= 32
  },
  {
    valid: false,
    message: '包含至少一个大写字母',
    validator: (pwd: string) => /[A-Z]/.test(pwd)
  },
  {
    valid: false,
    message: '包含至少一个小写字母',
    validator: (pwd: string) => /[a-z]/.test(pwd)
  },
  {
    valid: false,
    message: '包含至少一个数字',
    validator: (pwd: string) => /\d/.test(pwd)
  },
  {
    valid: false,
    message: '包含至少一个特殊字符',
    validator: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  }
])

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
watch(() => props.password, (newValue) => {
  validatePassword(newValue)
}, { immediate: props.immediate })

// 导出校验方法供外部使用
defineExpose({
  validate: validatePassword
})
</script>

<style scoped>
.password-validator {
  margin-top: 8px;
}

.validator-rules {
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