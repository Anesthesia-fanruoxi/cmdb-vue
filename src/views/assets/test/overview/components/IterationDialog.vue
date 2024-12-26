<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="迭代配置"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="命名空间" prop="namespace">
        <el-input v-model="form.namespace" disabled />
      </el-form-item>
      <el-form-item label="Git 地址" prop="git_url">
        <el-input v-model="form.git_url" disabled />
      </el-form-item>
      <el-form-item label="分支" prop="branch">
        <el-input v-model="form.branch" placeholder="请输入分支名称" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入迭代备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { IterationForm, ApiResponse } from '../types'
import request from '../../../../../utils/request'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive<IterationForm>({
  namespace: '',
  git_url: '',
  branch: '',
  remark: ''
})

const rules = {
  branch: [{ required: true, message: '请输入分支名称', trigger: 'blur' }]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const response = await request.post<ApiResponse<any>>('/cluster/iteration', form)
        
        if (response.data.code === 200) {
          ElMessage.success('迭代操作已提交')
          emit('update:modelValue', false)
          emit('success')
        }
      } catch (error) {
        console.error('迭代操作失败:', error)
        ElMessage.error('迭代操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleClosed = () => {
  form.branch = ''
  form.remark = ''
}

defineExpose({
  form
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<script lang="ts">
export default {
  name: 'IterationDialog'
}
</script> 