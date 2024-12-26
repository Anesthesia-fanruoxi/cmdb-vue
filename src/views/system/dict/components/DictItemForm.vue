<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleModelUpdate"
    :title="`管理字典项 - ${dict?.dict_name}`"
    width="800px"
    append-to-body
  >
    <!-- 字典项列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="dictItems"
        style="width: 100%"
        border
        :max-height="450"
        class="hide-scrollbar"
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
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加字典项表单 -->
    <div class="add-form-container">
      <h3>添加字典项</h3>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="dict?.key_name" prop="key">
          <el-input v-model="form.key" :placeholder="`请输入${dict?.key_name}`" />
        </el-form-item>
        <el-form-item :label="dict?.value_name" prop="value">
          <el-input v-model="form.value" :placeholder="`请输入${dict?.value_name}`" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd" :loading="submitting">添加</el-button>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDictItems, createDictItem, deleteDictItem } from '@/api/dict'
import type { DictItem, DictItemData } from '@/types/dict'

const props = defineProps<{
  visible: boolean
  dict: DictItem
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const dictItems = ref<DictItemData[]>([])

const form = ref({
  key: '',
  value: ''
})

const rules = {
  key: [{ required: true, message: '请输入键', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }]
}

// 加载字典项数据
const loadDictItems = async () => {
  if (!props.dict?.table_name) return
  
  loading.value = true
  try {
    const { data } = await getDictItems(props.dict.table_name)
    console.log('Dict Items Response:', data)
    dictItems.value = data
  } catch (error) {
    console.error('获取字典项数据失败:', error)
    ElMessage.error('获取字典项数据失败')
  } finally {
    loading.value = false
  }
}

// 添加字典项
const handleAdd = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await createDictItem({
          table_name: props.dict.table_name,
          key: form.value.key,
          value: form.value.value
        })
        ElMessage.success('添加成功')
        form.value.key = ''
        form.value.value = ''
        loadDictItems()
      } catch (error) {
        console.error('添加字典项失败:', error)
        ElMessage.error('添加失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除字典项
const handleDelete = async (row: DictItemData) => {
  try {
    await ElMessageBox.confirm('确认要删除该字典项吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    const key = String(row[props.dict.key_name])
    await deleteDictItem({
      table_name: props.dict.table_name,
      key
    })
    ElMessage.success('删除成功')
    loadDictItems()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除字典项失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 监听 visible 变化
watch(() => props.visible, (val) => {
  if (val && props.dict?.table_name) {
    loadDictItems()
  }
})

// 取消
const handleCancel = () => {
  emit('update:visible', false)
}

const handleModelUpdate = (val: boolean) => {
  emit('update:visible', val)
}

defineExpose({
  loadDictItems
})
</script>

<style scoped>
.table-container {
  /* 设置表格容器样式 */
  position: relative;
  margin-bottom: 20px;
}

.hide-scrollbar {
  /* 隐藏滚动条但保持功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.hide-scrollbar::-webkit-scrollbar {
  /* Chrome, Safari and Opera */
  display: none;
}

/* 鼠标悬停时显示滚动条 */
.table-container:hover .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-container:hover .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.table-container:hover .el-table__body-wrapper::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.add-form-container {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.add-form-container h3 {
  margin: 0 0 20px;
  font-size: 16px;
}

.dialog-footer {
  text-align: right;
}
</style> 