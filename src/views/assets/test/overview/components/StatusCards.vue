<template>
  <div class="status-cards">
    <el-card class="stat-card" @click="handleCardClick('all')">
      <template #header>
        <div class="stat-header">总数</div>
      </template>
      <div class="stat-card-content">
        <div class="stat-value">{{ totalCount }}</div>
      </div>
    </el-card>
    <el-card class="stat-card" @click="handleCardClick('running')">
      <template #header>
        <div class="stat-header">运行中</div>
      </template>
      <div class="stat-card-content">
        <div class="stat-value success">{{ runningCount }}</div>
      </div>
    </el-card>
    <el-card class="stat-card" @click="handleCardClick('stopped')">
      <template #header>
        <div class="stat-header">已停止</div>
      </template>
      <div class="stat-card-content">
        <div class="stat-value warning">{{ stoppedCount }}</div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  runningCount: number
  stoppedCount: number
  totalCount: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const handleCardClick = (status: string) => {
  if (status === props.modelValue) {
    emit('update:modelValue', '')
  } else {
    emit('update:modelValue', status)
  }
}
</script>

<style scoped>
.status-cards {
  display: flex;
  gap: 16px;
  width: 300px; /* 与过滤栏对齐 */
}

.stat-card {
  flex: 1;
  cursor: pointer;
  transition: all 0.3s;
  height: 50px;
  border: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-header {
  font-size: 13px;
  color: var(--el-text-color-regular);
  text-align: center;
}

:deep(.el-card__header) {
  padding: 4px 8px;
  background-color: var(--el-fill-color-light);
  flex-shrink: 0;
}

:deep(.el-card__body) {
  flex: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card-content {
  text-align: center;
  background-color: white;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  line-height: 1;
}

.success {
  color: var(--el-color-success);
}

.warning {
  color: var(--el-color-warning);
}

.stat-card.active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
</style>

<script lang="ts">
export default {
  name: 'StatusCards'
}
</script> 