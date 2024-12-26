<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑监控项' : '新增监控项'"
    width="600px"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="监控名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入监控名称" />
      </el-form-item>
      
      <el-form-item label="监控对象" prop="target">
        <el-select 
          v-model="formData.target" 
          placeholder="请选择监控对象"
          filterable
        >
          <el-option
            v-for="item in targetOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
      
      <el-form-item label="采集间隔" prop="interval">
        <el-input-number
          v-model="formData.intervalValue"
          :min="1"
          :max="3600"
        />
        <el-select 
          v-model="formData.intervalUnit" 
          style="margin-left: 10px; width: 80px"
        >
          <el-option label="秒" value="s" />
          <el-option label="分钟" value="m" />
          <el-option label="小时" value="h" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          rows="3"
          placeholder="请输入监控项描述"
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
import { ref, reactive, defineProps, defineEmits, watch } from 'vue'
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

// 监控对象选项
const targetOptions = [
  { label: 'web-server-01', value: 'web-server-01' },
  { label: 'web-server-02', value: 'web-server-02' },
  { label: 'db-server-01', value: 'db-server-01' }
]

// 监控指标选项
const metricOptions = [
  {
    label: '系统指标',
    options: [
      { label: 'CPU使用率', value: 'cpu_usage' },
      { label: '内存使用率', value: 'memory_usage' },
      { label: '磁盘使用率', value: 'disk_usage' },
      { label: '网络流量', value: 'network_traffic' }
    ]
  },
  {
    label: '应用指标',
    options: [
      { label: '进程数', value: 'process_count' },
      { label: '连接数', value: 'connection_count' },
      { label: '请求延迟', value: 'request_latency' },
      { label: '错误率', value: 'error_rate' }
    ]
  }
]

// 表单数据
const formData = reactive({
  name: '',
  target: '',
  metric: '',
  intervalValue: 30,
  intervalUnit: 's',
  description: ''
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入监控名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  target: [
    { required: true, message: '请选择监控对象', trigger: 'change' }
  ],
  metric: [
    { required: true, message: '请选择监控指标', trigger: 'change' }
  ],
  intervalValue: [
    { required: true, message: '请输入采集间隔', trigger: 'blur' }
  ]
}

// 初始化表单数据
const initFormData = () => {
  if (props.isEdit && props.data) {
    const { interval, ...rest } = props.data
    // 解析间隔时间
    const match = interval.match(/(\d+)([smh])/)
    if (match) {
      formData.intervalValue = parseInt(match[1])
      formData.intervalUnit = match[2]
    }
    Object.assign(formData, rest)
  } else {
    formData.name = ''
    formData.target = ''
    formData.metric = ''
    formData.intervalValue = 30
    formData.intervalUnit = 's'
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
</script> 