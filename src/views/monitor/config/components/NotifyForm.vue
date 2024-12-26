<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑通知策略' : '新增通知策略'"
    width="600px"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="策略名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入策略名称" />
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
      
      <el-form-item 
        :label="getTargetLabel(formData.type)" 
        prop="target"
      >
        <el-select
          v-if="formData.type === 'dingtalk'"
          v-model="formData.target"
          placeholder="请选择钉钉群组"
        >
          <el-option label="运维组" value="ops" />
          <el-option label="开发组" value="dev" />
          <el-option label="测试组" value="qa" />
        </el-select>
        <el-input
          v-else
          v-model="formData.target"
          :placeholder="getTargetPlaceholder(formData.type)"
        />
      </el-form-item>
      
      <el-form-item label="告警级别" prop="levels">
        <el-checkbox-group v-model="formData.levels">
          <el-checkbox label="high">严重</el-checkbox>
          <el-checkbox label="medium">警告</el-checkbox>
          <el-checkbox label="low">普通</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
      <el-form-item label="通知时间" prop="notifyTime">
        <el-time-picker
          v-model="formData.startTime"
          format="HH:mm"
          placeholder="开始时间"
          :disabled-hours="disabledStartHours"
        />
        <span class="time-separator">至</span>
        <el-time-picker
          v-model="formData.endTime"
          format="HH:mm"
          placeholder="结束时间"
          :disabled-hours="disabledEndHours"
        />
      </el-form-item>
      
      <el-form-item label="通知间隔" prop="interval">
        <el-input-number
          v-model="formData.intervalValue"
          :min="1"
          :max="1440"
        />
        <el-select 
          v-model="formData.intervalUnit" 
          style="margin-left: 10px; width: 80px"
        >
          <el-option label="分钟" value="m" />
          <el-option label="小时" value="h" />
        </el-select>
      </el-form-item>
      
      <template v-if="formData.type === 'webhook'">
        <el-form-item label="请求方法" prop="method">
          <el-radio-group v-model="formData.method">
            <el-radio label="GET">GET</el-radio>
            <el-radio label="POST">POST</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="请求头" prop="headers">
          <el-input
            v-model="formData.headers"
            type="textarea"
            rows="3"
            placeholder="请输入请求头（JSON格式）"
          />
        </el-form-item>
      </template>
      
      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          rows="3"
          placeholder="请输入策略描述"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="info" @click="handleTest">测试</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'

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

// 表单数据
const formData = reactive({
  name: '',
  type: '',
  target: '',
  levels: [] as string[],
  startTime: null,
  endTime: null,
  intervalValue: 30,
  intervalUnit: 'm',
  method: 'POST',
  headers: '',
  description: ''
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入策略名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择通知方式', trigger: 'change' }
  ],
  target: [
    { required: true, message: '请输入通知对象', trigger: 'blur' }
  ],
  levels: [
    { required: true, message: '请选择告警级别', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个告警级别', trigger: 'change' }
  ],
  notifyTime: [
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (!formData.startTime || !formData.endTime) {
          callback(new Error('请选择通知时间范围'))
        } else if (formData.startTime >= formData.endTime) {
          callback(new Error('结束时间必须大于开始时间'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  headers: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (formData.type === 'webhook' && value) {
          try {
            JSON.parse(value)
            callback()
          } catch (e) {
            callback(new Error('请输入有效的JSON格式'))
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取目标标签
const getTargetLabel = (type: string) => {
  const labels: Record<string, string> = {
    email: '邮箱地址',
    dingtalk: '钉钉群组',
    wecom: '企业微信群',
    webhook: 'Webhook地址'
  }
  return labels[type] || '通知对象'
}

// 获取目标输入框提示
const getTargetPlaceholder = (type: string) => {
  const placeholders: Record<string, string> = {
    email: '请输入邮箱地址，多个地址用逗号分隔',
    wecom: '请输入企业微信群ID',
    webhook: '请输入Webhook地址'
  }
  return placeholders[type] || '请输入通知对象'
}

// 初始化表单数据
const initFormData = () => {
  if (props.isEdit && props.data) {
    const { interval, ...rest } = props.data
    // 解析间隔时间
    const match = interval?.match(/(\d+)([mh])/)
    if (match) {
      formData.intervalValue = parseInt(match[1])
      formData.intervalUnit = match[2]
    }
    Object.assign(formData, rest)
  } else {
    formData.name = ''
    formData.type = ''
    formData.target = ''
    formData.levels = []
    formData.startTime = null
    formData.endTime = null
    formData.intervalValue = 30
    formData.intervalUnit = 'm'
    formData.method = 'POST'
    formData.headers = ''
    formData.description = ''
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
      const data = {
        ...formData,
        interval: `${formData.intervalValue}${formData.intervalUnit}`
      }
      emit('submit', data)
      handleCancel()
    }
  })
}

// 测试通知
const handleTest = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 实现测试通知逻辑
        const testData = {
          level: 'low',
          target: 'test-server',
          metric: 'cpu_usage',
          value: '50%',
          threshold: '90%',
          time: new Date().toLocaleString(),
          description: '这是一条测试告警'
        }
        
        ElMessage.success('测试通知已发送')
      } catch (error) {
        ElMessage.error('测试通知发送失败')
      }
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

// 禁用开始时间的小时选项
const disabledStartHours = () => {
  const hours = []
  if (formData.endTime) {
    const endHour = new Date(formData.endTime).getHours()
    for (let i = endHour; i < 24; i++) {
      hours.push(i)
    }
  }
  return hours
}

// 禁用结束时间的小时选项
const disabledEndHours = () => {
  const hours = []
  if (formData.startTime) {
    const startHour = new Date(formData.startTime).getHours()
    for (let i = 0; i < startHour; i++) {
      hours.push(i)
    }
  }
  return hours
}

// 监听通知方式变化，重置相关字段
watch(
  () => formData.type,
  (val) => {
    formData.target = ''
    if (val === 'webhook') {
      formData.method = 'POST'
      formData.headers = ''
    }
  }
)
</script>

<style scoped>
.time-separator {
  margin: 0 10px;
}
</style> 