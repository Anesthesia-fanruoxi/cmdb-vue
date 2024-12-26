<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleModelUpdate"
    :title="dict.id ? '编辑字典' : '新增字典'"
    width="500px"
    append-to-body
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="字典名称" prop="dict_name">
        <el-input v-model="form.dict_name" placeholder="请输入字典名称" />
      </el-form-item>
      <el-form-item label="字典编码" prop="table_name">
        <el-input v-model="form.table_name" placeholder="请输入字典编码" />
      </el-form-item>
      <el-form-item label="键字段名" prop="key_name">
        <el-input v-model="form.key_name" placeholder="请输入键字段名" />
      </el-form-item>
      <el-form-item label="值字段名" prop="value_name">
        <el-input v-model="form.value_name" placeholder="请输入值字段名" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createDict, updateDict } from '@/api/dict'
import type { DictItem } from '@/types/dict'

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

const form = ref({
  dict_name: '',
  table_name: '',
  key_name: '',
  value_name: ''
})

const rules = {
  dict_name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  table_name: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
  key_name: [{ required: true, message: '请输入键字段名', trigger: 'blur' }],
  value_name: [{ required: true, message: '请输入值字段名', trigger: 'blur' }]
}

// 重置表单
const resetForm = () => {
  if (props.dict.id) {
    // 编辑模式：使用传入的数据
    form.value = {
      dict_name: props.dict.dict_name,
      table_name: props.dict.table_name,
      key_name: props.dict.key_name,
      value_name: props.dict.value_name
    }
  } else {
    // 新增模式：清空表单
    form.value = {
      dict_name: '',
      table_name: '',
      key_name: '',
      value_name: ''
    }
  }
}

// 监听 visible 变化
watch(() => props.visible, (val) => {
  if (val) {
    resetForm()
  }
})

// 取消
const handleCancel = () => {
  emit('update:visible', false)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (props.dict.id) {
          // 编辑模式：调用更新接口
          await updateDict({
            ...form.value,
            id: props.dict.id
          })
          ElMessage.success('修改成功')
        } else {
          // 新增模式：调用创建接口
          await createDict(form.value)
          ElMessage.success('新增成功')
        }
        emit('update:visible', false)
        emit('success')
      } catch (error) {
        console.error('保存字典失败:', error)
        ElMessage.error('保存失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleModelUpdate = (val: boolean) => {
  emit('update:visible', val)
}

defineExpose({
  resetForm
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 