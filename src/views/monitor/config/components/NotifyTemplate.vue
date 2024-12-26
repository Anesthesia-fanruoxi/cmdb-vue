<template>
  <div class="template-actions">
    <el-upload
      class="template-import"
      accept=".json"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleImport"
    >
      <el-button>导入模板</el-button>
    </el-upload>
    <el-button @click="handleExport">导出模板</el-button>
    <el-button @click="handleLoadExample">加载示例</el-button>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑通知模板' : '新增通知模板'"
    width="800px"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入模板名称" />
      </el-form-item>
      
      <el-form-item label="通知方式" prop="type">
        <el-select v-model="formData.type" placeholder="请选择通知方式">
          <el-option
            v-for="item in notifyTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="模板分类" prop="categoryId">
        <el-select 
          v-model="formData.categoryId"
          placeholder="请选择模板分类"
          :disabled="!formData.type"
        >
          <el-option
            v-for="item in categories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span>{{ item.name }}</span>
            <span class="category-description">{{ item.description }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="标题模板" prop="titleTemplate">
        <el-input v-model="formData.titleTemplate" placeholder="请输入标题模板">
          <template #append>
            <el-popover
              placement="bottom"
              title="可用变量"
              :width="300"
              trigger="hover"
            >
              <template #reference>
                <el-icon><QuestionFilled /></el-icon>
              </template>
              <div class="variables-list">
                <div v-for="(desc, key) in titleVariables" :key="key">
                  <code>{'{'}{key}{'}'}</code> - {{ desc }}
                </div>
              </div>
            </el-popover>
          </template>
        </el-input>
        <div v-if="titleErrors.length" class="template-errors">
          <p v-for="error in titleErrors" :key="error" class="error-text">
            {{ error }}
          </p>
        </div>
      </el-form-item>
      
      <el-form-item label="内容模板" prop="contentTemplate">
        <el-input
          v-model="formData.contentTemplate"
          type="textarea"
          :rows="8"
          placeholder="请输入内容模板"
        />
        <div class="template-help">
          <p>可用变量：</p>
          <div class="variables-list">
            <div v-for="(desc, key) in contentVariables" :key="key">
              <code>{'{'}{key}{'}'}</code> - {{ desc }}
            </div>
          </div>
        </div>
        <div v-if="contentErrors.length" class="template-errors">
          <p v-for="error in contentErrors" :key="error" class="error-text">
            {{ error }}
          </p>
        </div>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handlePreview">预览效果</el-button>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog
    v-model="previewVisible"
    title="模板预览"
    width="600px"
    append-to-body
  >
    <div class="preview-content">
      <div class="preview-item">
        <div class="preview-label">标题预览：</div>
        <div class="preview-text">{{ previewTitle }}</div>
      </div>
      <div class="preview-item">
        <div class="preview-label">内容预览：</div>
        <div class="preview-text" v-html="previewContent"></div>
      </div>
    </div>
  </el-dialog>

  <el-dialog
    v-model="exampleVisible"
    title="选择模板示例"
    width="500px"
    append-to-body
  >
    <el-form>
      <el-form-item label="通知方式">
        <el-select v-model="selectedType" placeholder="请选择通知方式">
          <el-option
            v-for="item in notifyTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="模板示例">
        <el-select 
          v-model="selectedExample"
          placeholder="请选择模板示例"
          :disabled="!selectedType || !examples.length"
        >
          <el-option
            v-for="item in examples"
            :key="item.name"
            :label="item.name"
            :value="item"
          />
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="exampleVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :disabled="!selectedExample"
          @click="handleUseExample"
        >
          使用此模板
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { templateExamples } from '@/mock/templates'
import { validateTemplate, templateCategories } from '@/utils/template'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const dialogVisible = ref(props.visible)
const formRef = ref<FormInstance>()

// 通知方式选项
const notifyTypes = [
  { label: '邮件', value: 'email' },
  { label: '钉钉', value: 'dingtalk' },
  { label: '企业微信', value: 'wecom' },
  { label: 'Webhook', value: 'webhook' }
]

// 标题变量说明
const titleVariables = {
  level: '告警级别',
  target: '监控对象',
  metric: '监控指标',
  time: '告警时间'
}

// 内容变量说明
const contentVariables = {
  ...titleVariables,
  value: '当前值',
  threshold: '阈值',
  operator: '判断条件',
  duration: '持续时间',
  description: '告警描述'
}

// 表单数据
const formData = reactive({
  name: '',
  type: '',
  categoryId: null as number | null,
  titleTemplate: '',
  contentTemplate: ''
})

// 根据类型筛选分类
const categories = computed(() => {
  return formData.type 
    ? templateCategories.filter(c => c.type === formData.type)
    : []
})

// 模板验证错误
const titleErrors = computed(() => {
  if (!formData.titleTemplate) return []
  return validateTemplate(formData.titleTemplate)
})

const contentErrors = computed(() => {
  if (!formData.contentTemplate) return []
  return validateTemplate(formData.contentTemplate)
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择通知方式', trigger: 'change' }
  ],
  categoryId: [
    { required: true, message: '请选择模板分类', trigger: 'change' }
  ],
  titleTemplate: [
    { required: true, message: '请输入标题模板', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        const errors = validateTemplate(value)
        if (errors.length) {
          callback(new Error(errors[0]))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  contentTemplate: [
    { required: true, message: '请输入内容模板', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        const errors = validateTemplate(value)
        if (errors.length) {
          callback(new Error(errors[0]))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化表单数据
const initFormData = () => {
  if (props.isEdit && props.data) {
    Object.assign(formData, props.data)
  } else {
    formData.name = ''
    formData.type = ''
    formData.categoryId = null
    formData.titleTemplate = ''
    formData.contentTemplate = ''
  }
}

// 取消
const handleCancel = () => {
  emit('update:visible', false)
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...formData })
      handleCancel()
    }
  })
}

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val) {
      initFormData()
    }
  }
)

// 监听dialogVisible变化
watch(
  () => dialogVisible.value,
  (val) => {
    emit('update:visible', val)
  }
)

// 预览相关
const previewVisible = ref(false)
const previewData = {
  level: '严重',
  target: 'web-server-01',
  metric: 'CPU使用率',
  value: '95%',
  threshold: '90%',
  operator: '>',
  duration: '5分钟',
  time: '2024-01-10 12:00:00',
  description: 'CPU使用率持续超过阈值，请及时处理。'
}

// 替换模板变量
const replaceVariables = (template: string, data: Record<string, string>) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] || match
  })
}

// 预览标题
const previewTitle = computed(() => {
  return replaceVariables(formData.titleTemplate, previewData)
})

// 预览内容
const previewContent = computed(() => {
  const content = replaceVariables(formData.contentTemplate, previewData)
  // 如果是钉钉或企业微信，使用 Markdown 渲染
  if (['dingtalk', 'wecom'].includes(formData.type)) {
    return marked(content)
  }
  // 邮件和 Webhook 使用换行符
  return content.replace(/\n/g, '<br>')
})

// 预览
const handlePreview = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (!formData.titleTemplate || !formData.contentTemplate) {
        ElMessage.warning('请先填写模板内容')
        return
      }
      previewVisible.value = true
    }
  })
}

// 示例相关
const exampleVisible = ref(false)
const selectedType = ref('')
const selectedExample = ref<any>(null)

// 当前类型的示例列表
const examples = computed(() => {
  return selectedType.value ? templateExamples[selectedType.value as keyof typeof templateExamples] || [] : []
})

// 监听类型变化
watch(selectedType, () => {
  selectedExample.value = null
})

// 加载示例
const handleLoadExample = () => {
  selectedType.value = ''
  selectedExample.value = null
  exampleVisible.value = true
}

// 使用示例
const handleUseExample = () => {
  if (!selectedExample.value) return
  
  Object.assign(formData, selectedExample.value)
  exampleVisible.value = false
  ElMessage.success('模板已加载')
}

// 导入模板
const handleImport = (file: UploadFile) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const data = JSON.parse(content)
      
      // 验证必要字段
      if (!data.name || !data.type || !data.titleTemplate || !data.contentTemplate) {
        throw new Error('无效的模板文件')
      }
      
      Object.assign(formData, data)
      ElMessage.success('导入成功')
    } catch (error) {
      ElMessage.error('导入失败：无效的模板文件')
    }
  }
  reader.readAsText(file.raw!)
}

// 导出模板
const handleExport = () => {
  const data = JSON.stringify(formData, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${formData.name || 'template'}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 监听类型变化时重置分类
watch(
  () => formData.type,
  () => {
    formData.categoryId = null
  }
)
</script>

<style scoped>
.variables-list {
  font-size: 14px;
  line-height: 1.8;
}

.variables-list code {
  background-color: #f5f7fa;
  padding: 2px 4px;
  border-radius: 4px;
  margin-right: 8px;
}

.template-help {
  margin-top: 8px;
  font-size: 14px;
  color: #909399;
}

.preview-content {
  padding: 20px;
}

.preview-item {
  margin-bottom: 20px;
}

.preview-label {
  font-weight: bold;
  margin-bottom: 8px;
}

.preview-text {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
}

:deep(.preview-text p) {
  margin: 0;
}

:deep(.preview-text ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.template-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.template-import {
  display: inline-block;
}

.category-description {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.template-errors {
  margin-top: 4px;
}

.error-text {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1.5;
  margin: 2px 0;
}
</style> 