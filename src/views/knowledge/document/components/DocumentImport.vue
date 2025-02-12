<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="导入文档"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入文档标题" />
      </el-form-item>
      <el-form-item label="所属项目" prop="project_id">
        <el-select v-model="form.project_id" placeholder="请选择项目" style="width: 100%">
          <el-option
            v-for="item in projectOptions"
            :key="item.project"
            :label="item.project_name"
            :value="item.project"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文件" prop="file">
        <el-upload
          class="upload-demo"
          action=""
          :auto-upload="false"
          :show-file-list="false"
          accept=".md"
          @change="handleFileChange"
        >
          <template #default>
            <div v-if="form.file" class="selected-file">
              {{ form.file.name }}
              <el-button link type="danger" @click.stop="form.file = null">删除</el-button>
            </div>
            <el-button v-else type="primary">选择文件</el-button>
          </template>
          <template #tip>
            <div class="el-upload__tip">只能上传 .md 文件</div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :disabled="!form.file || !form.title || !form.project_id"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  projectOptions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref<FormInstance>()
const form = reactive({
  title: '',
  project_id: '',
  file: null as File | null
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  project_id: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ]
}

const handleFileChange = (file: any) => {
  if (!file.raw) {
    ElMessage.error('请选择文件')
    return
  }
  
  form.file = file.raw
  
  // 如果标题为空，从文件名中提取标题（去掉.md后缀）
  if (!form.title) {
    const fileName = file.raw.name
    if (fileName.toLowerCase().endsWith('.md')) {
      form.title = fileName.slice(0, -3)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value || !form.file) return
  
  try {
    await formRef.value.validate()
    
    // 读取文件内容
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      emit('submit', {
        title: form.title,
        project_id: form.project_id,
        content
      })
      // 提交后重置表单
      form.title = ''
      form.project_id = ''
      form.file = null
      formRef.value?.resetFields()
    }
    reader.onerror = () => {
      ElMessage.error('文件读取失败')
    }
    reader.readAsText(form.file)
  } catch (error) {
    console.error('Form validation error:', error)
    ElMessage.error('请检查表单填写是否正确')
  }
}

const handleCancel = () => {
  // 重置表单
  form.title = ''
  form.project_id = ''
  form.file = null
  formRef.value?.resetFields()
  // 关闭对话框
  emit('update:visible', false)
}

defineExpose({
  resetForm: () => {
    form.title = ''
    form.project_id = ''
    form.file = null
    formRef.value?.resetFields()
  }
})
</script>

<style lang="scss" scoped>
.selected-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

:deep(.el-upload__tip) {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style> 