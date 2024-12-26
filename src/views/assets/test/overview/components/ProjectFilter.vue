<template>
  <div class="filter-section">
    <el-radio-group :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" @change="handleChange" class="radio-group">
      <el-radio label="all" class="radio-item">全部</el-radio>
      <el-radio 
        v-for="item in projectList" 
        :key="item.project" 
        :label="item.project"
        class="radio-item"
      >
        {{ item.project_name }}
      </el-radio>
      <el-radio label="other" class="radio-item">其他</el-radio>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import type { ProjectDict } from '../types'

defineProps<{
  modelValue: string
  projectList: ProjectDict[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const handleChange = (value: string) => {
  emit('change', value)
}
</script>

<style scoped>
.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.radio-item {
  margin: 0;
}

:deep(.el-radio__label) {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #1677ff;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #1677ff;
  border-color: #1677ff;
}

:deep(.el-radio__inner:hover) {
  border-color: #1677ff;
}
</style>

<script lang="ts">
export default {
  name: 'ProjectFilter'
}
</script> 