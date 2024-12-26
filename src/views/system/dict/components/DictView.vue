<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleModelUpdate"
    :title="dict?.dict_name || '查看字典'"
    width="800px"
    append-to-body
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="字典名称">{{ dict?.dict_name }}</el-descriptions-item>
      <el-descriptions-item label="字典编码">{{ dict?.table_name }}</el-descriptions-item>
      <el-descriptions-item label="键字段名">{{ dict?.key_name }}</el-descriptions-item>
      <el-descriptions-item label="值字段名">{{ dict?.value_name }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ new Date(dict?.created_at).toLocaleString() }}</el-descriptions-item>
    </el-descriptions>

    <!-- 字典项数据 -->
    <div class="dict-items-container">
      <div class="dict-items-header">
        <h3>字典项数据</h3>
      </div>
      <el-table
        v-loading="loading"
        :data="dictItems"
        style="width: 100%"
        border
        max-height="400"
      >
        <el-table-column :label="dict?.key_name || '键'">
          <template #default="{ row }">
            {{ row[dict?.key_name || ''] }}
          </template>
        </el-table-column>
        <el-table-column :label="dict?.value_name || '值'">
          <template #default="{ row }">
            {{ row[dict?.value_name || ''] }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getDictItems } from '@/api/dict'
import type { DictItem, DictItemData } from '@/types/dict'

const props = defineProps<{
  visible: boolean
  dict: DictItem
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const dictItems = ref<DictItemData[]>([])
const loading = ref(false)

// 加载字典��数据
const loadDictItems = async () => {
  if (!props.dict?.table_name) return
  
  loading.value = true
  try {
    const { data } = await getDictItems(props.dict.table_name)
    console.log('Dict Items Response:', data) // 添加日志
    dictItems.value = data
  } catch (error) {
    console.error('获取字典项数据失败:', error)
    ElMessage.error('获取字典项数据失败')
  } finally {
    loading.value = false
  }
}

// 监听 visible 变化
watch(() => props.visible, (val) => {
  if (val && props.dict?.table_name) {
    loadDictItems()
  }
})

const handleModelUpdate = (val: boolean) => {
  emit('update:visible', val)
}

defineExpose({
  loadDictItems
})
</script>

<style scoped>
.dict-items-container {
  margin-top: 20px;
}

.dict-items-header {
  margin-bottom: 10px;
}

.dict-items-header h3 {
  margin: 0;
  font-size: 16px;
}
</style> 