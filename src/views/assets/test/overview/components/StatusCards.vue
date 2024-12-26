<template>
  <div class="overview-cards">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card 
          shadow="hover" 
          class="stat-card" 
          :class="{ active: modelValue === 'running' }"
          @click="handleCardClick('running')"
        >
          <div class="stat-header running">
            <span class="stat-label">运行中</span>
          </div>
          <div class="stat-content">
            <div class="stat-number" style="color: #67c23a;">
              {{ runningCount }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card 
          shadow="hover" 
          class="stat-card" 
          :class="{ active: modelValue === 'stopped' }"
          @click="handleCardClick('stopped')"
        >
          <div class="stat-header stopped">
            <span class="stat-label">已停止</span>
          </div>
          <div class="stat-content">
            <div class="stat-number" style="color: #f56c6c;">
              {{ stoppedCount }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card 
          shadow="hover" 
          class="stat-card" 
          :class="{ active: modelValue === 'all' }"
          @click="handleCardClick('all')"
        >
          <div class="stat-header total">
            <span class="stat-label">总计</span>
          </div>
          <div class="stat-content">
            <div class="stat-number" style="color: #909399;">
              {{ totalCount }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
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
  emit('update:modelValue', status === props.modelValue ? 'all' : status)
}
</script>

<style scoped>
.overview-cards {
  margin: 24px 0;
  flex-shrink: 0;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 160px;
}

.stat-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-card.active {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.stat-card.active .stat-header {
  filter: brightness(1.1);
}

.stat-card.active .stat-content {
  background-color: rgba(246, 248, 255, 0.7);
}

.stat-header {
  padding: 8px 20px;
  text-align: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  flex: none;
}

.stat-header.running {
  background-color: #67c23a;
}

.stat-header.stopped {
  background-color: #f56c6c;
}

.stat-header.total {
  background-color: #909399;
}

.stat-label {
  font-size: 14px;
  color: white;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.stat-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  background-color: white;
  border: 1px solid #e4e7ed;
  border-top: none;
}

.stat-number {
  font-size: 48px;
  font-weight: bold;
  margin: 0;
  line-height: 1;
  transition: all 0.3s ease;
}

:deep(.stat-card .el-card__body) {
  padding: 0;
  border: none;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.stat-card) {
  border: none;
  background: transparent;
}

.stat-card:hover .stat-number {
  transform: scale(1.1);
}
</style>

<script lang="ts">
export default {
  name: 'StatusCards'
}
</script> 