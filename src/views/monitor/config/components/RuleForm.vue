<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑告警规则' : '新增告警规则'"
    width="600px"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="规则名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入规则名称" />
      </el-form-item>
      
      <el-form-item label="监控指标" prop="metric">
        <el-select 
          v-model="formData.metric" 
          placeholder="请选择监控指标"
        >
          <el-option-group
            v-for="group in metricOptions"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-option-group>
        </el-select>
      </el-form-item>
      
      <el-form-item label="判断条件" prop="operator">
        <el-select v-model="formData.operator" placeholder="请选择判断条件">
          <el-option label="大于" value=">" />
          <el-option label="大于等于" value=">=" />
          <el-option label="小于" value="<" />
          <el-option label="小于等于" value="<=" />
          <el-option label="等于" value="=" />
          <el-option label="不等于" value="!=" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="阈值" prop="threshold">
        <el-input v-model="formData.threshold" placeholder="请输入阈值">
          <template #append>{{ getMetricUnit(formData.metric) }}</template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="持续时间" prop="duration">
        <el-input-number
          v-model="formData.durationValue"
          :min="1"
          :max="3600"
        />
        <el-select 
          v-model="formData.durationUnit" 
          style="margin-left: 10px; width: 80px"
        >
          <el-option label="秒" value="s" />
          <el-option label="分钟" value="m" />
          <el-option label="小时" value="h" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="告警级别" prop="level">
        <el-select v-model="formData.level" placeholder="请选择告警级别">
          <el-option label="严重" value="high" />
          <el-option label="警告" value="medium" />
          <el-option label="普通" value="low" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          rows="3"
          placeholder="请输入规则描述"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
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

// 监控指标选项
const metricOptions = [
  {
    label: '系统指标',
    options: [
      { label: 'CPU使用率', value: 'cpu_usage', unit: '%' },
      { label: '内存使用率', value: 'memory_usage', unit: '%' },
      { label: '磁盘使用率', value: 'disk_usage', unit: '%' },
      { label: '网络流量', value: 'network_traffic', unit: 'MB/s' }
    ]
  },
  {
    label: '应用指标',
    options: [
      { label: '进程数', value: 'process_count', unit: '个' },
      { label: '连接数', value: 'connection_count', unit: '个' },
      { label: '请求延迟', value: 'request_latency', unit: 'ms' },
      { label: '错误率', value: 'error_rate', unit: '%' }
    ]
  }
]

// 表单数据
const formData = reactive({
  name: '',
  metric: '',
  operator: '',
  threshold: '',
  durationValue: 5,
  durationUnit: 'm',
  level: '',
  description: ''
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  metric: [
    { required: true, message: '请选择监控指标', trigger: 'change' }
  ],
  operator: [
    { required: true, message: '请选择判断条件', trigger: 'change' }
  ],
  threshold: [
    { required: true, message: '请输入阈值', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择告警级别', trigger: 'change' }
  ]
}

// 获取指标单位
const getMetricUnit = (metricValue: string) => {
  for (const group of metricOptions) {
    const option = group.options.find(opt => opt.value === metricValue)
    if (option) {
      return option.unit
    }
  }
  return ''
}

// 初始化表单数据
const initFormData = () => {
  if (props.isEdit && props.data) {
    const { duration, ...rest } = props.data
    // 解析持续时间
    const match = duration.match(/(\d+)([smh])/)
    if (match) {
      formData.durationValue = parseInt(match[1])
      formData.durationUnit = match[2]
    }
    Object.assign(formData, rest)
  } else {
    formData.name = ''
    formData.metric = ''
    formData.operator = ''
    formData.threshold = ''
    formData.durationValue = 5
    formData.durationUnit = 'm'
    formData.level = ''
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
        duration: `${formData.durationValue}${formData.durationUnit}`
      }
      emit('submit', data)
      handleCancel()
    }
  })
}

// ���听visible变化
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
</script> 