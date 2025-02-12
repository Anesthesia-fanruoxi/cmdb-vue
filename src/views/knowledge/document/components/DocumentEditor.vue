<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="isEdit ? '编辑文档' : '新建文档'"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="editor-container">
      <div class="editor-left">
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
          <el-form-item label="内容" prop="content">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="20"
              placeholder="请输入文档内容"
              @input="handleContentChange"
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="editor-right">
        <div class="preview-header">预览</div>
        <div class="markdown-preview markdown-body" v-html="previewHtml"></div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import type { FormInstance } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  projectOptions: {
    type: Array,
    required: true
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref<FormInstance>()
const form = ref({
  id: undefined,
  title: '',
  content: '',
  project_id: '',
  version: 1
})

// 表单校验规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  project_id: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

// 预览内容
const previewHtml = computed(() => {
  return marked(form.value.content || '')
})

// 处理内容变化
const handleContentChange = () => {
  // 实时更新预览，不需要额外处理，computed 会自动更新
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...form.value })
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  }
}

// 取消
const handleCancel = () => {
  emit('update:visible', false)
}

// 监听初始数据变化
watch(
  () => props.initialData,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      form.value = {
        id: newVal.id,
        title: newVal.title,
        content: newVal.content,
        project_id: newVal.project_id,
        version: newVal.version
      }
    }
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
.editor-container {
  display: flex;
  gap: 20px;
  height: 60vh;
  
  .editor-left,
  .editor-right {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
  }
  
  .editor-right {
    background-color: #fafafa;
    
    .preview-header {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--el-border-color);
    }
  }
}
</style> 