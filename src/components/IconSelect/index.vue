<template>
  <div class="icon-select">
    <el-input
      v-model="searchText"
      placeholder="搜索图标"
      clearable
      @click="showDialog = true"
      readonly
    >
      <template #prefix>
        <el-icon v-if="currentIcon">
          <component :is="currentIcon" />
        </el-icon>
      </template>
    </el-input>

    <el-dialog
      title="选择图标"
      v-model="showDialog"
      width="800px"
      destroy-on-close
    >
      <div class="dialog-header">
        <el-input
          v-model="searchText"
          placeholder="搜索图标"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-tabs v-model="activeCategory">
        <el-tab-pane
          v-for="category in iconCategories"
          :key="category.name"
          :label="category.label"
          :name="category.name"
        >
          <div class="icon-list">
            <div
              v-for="icon in filteredIcons[category.name]"
              :key="icon"
              class="icon-item"
              :class="{ active: currentIcon === icon }"
              @click="handleSelect(icon)"
            >
              <el-icon>
                <component :is="icon" />
              </el-icon>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { Search } from '@element-plus/icons-vue'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const showDialog = ref(false)
const currentIcon = ref(props.modelValue)
const searchText = ref('')
const activeCategory = ref('direction')

// 图标分类
const iconCategories = [
  { name: 'direction', label: '方向图标' },
  { name: 'operation', label: '操作图标' },
  { name: 'data', label: '数据图标' },
  { name: 'file', label: '文件图标' },
  { name: 'menu', label: '菜单图标' },
  { name: 'other', label: '其他图标' }
]

// 图标分类规则
const categorizeIcon = (icon: string) => {
  const directionIcons = ['arrow', 'back', 'forward', 'top', 'bottom', 'right', 'left']
  const operationIcons = ['edit', 'delete', 'add', 'remove', 'search', 'refresh', 'upload', 'download']
  const dataIcons = ['data', 'chart', 'pie', 'monitor', 'dashboard']
  const fileIcons = ['document', 'folder', 'file']
  const menuIcons = ['menu', 'list', 'grid', 'setting', 'user', 'home']

  const iconLower = icon.toLowerCase()
  
  if (directionIcons.some(key => iconLower.includes(key))) return 'direction'
  if (operationIcons.some(key => iconLower.includes(key))) return 'operation'
  if (dataIcons.some(key => iconLower.includes(key))) return 'data'
  if (fileIcons.some(key => iconLower.includes(key))) return 'file'
  if (menuIcons.some(key => iconLower.includes(key))) return 'menu'
  return 'other'
}

// 获取所有图标并分类
const allIcons = Object.keys(ElementPlusIcons).reduce((acc, key) => {
  const category = categorizeIcon(key)
  if (!acc[category]) acc[category] = []
  acc[category].push(key)
  return acc
}, {} as Record<string, string[]>)

// 过滤图标
const filteredIcons = computed(() => {
  const result: Record<string, string[]> = {}
  
  for (const category in allIcons) {
    result[category] = allIcons[category].filter(icon => 
      icon.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  
  return result
})

// 选择图标
const handleSelect = (icon: string) => {
  currentIcon.value = icon
  emit('update:modelValue', icon)
  emit('change', icon)
  showDialog.value = false
  searchText.value = ''
}

// 监听外部值变化
watch(
  () => props.modelValue,
  (val) => {
    currentIcon.value = val
  }
)

// 处理搜索
const handleSearch = (value: string) => {
  searchText.value = value
}

defineExpose({
  showDialog,
  handleSearch,
  handleSelect
})
</script>

<style scoped>
.icon-select {
  width: 100%;
}

.dialog-header {
  padding: 0 20px 20px;
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  padding: 16px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid var(--el-border-color-light);
}

.icon-item:hover {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.icon-item.active {
  background-color: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

:deep(.el-icon) {
  font-size: 24px;
}

:deep(.el-tabs__content) {
  max-height: 400px;
  overflow-y: auto;
}
</style> 