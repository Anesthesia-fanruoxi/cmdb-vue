<template>
  <div class="alarm-manage">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="告警级别">
          <el-select v-model="searchForm.level" placeholder="请选择告警级别">
            <el-option label="全部" value="" />
            <el-option label="严重" value="high" />
            <el-option label="警告" value="medium" />
            <el-option label="普通" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="请选择处理状态">
            <el-option label="全部" value="" />
            <el-option label="未处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
            <el-option label="已忽略" value="ignored" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button-group>
        <el-button 
          type="primary" 
          :disabled="!selectedRows.length"
          @click="handleBatchProcess"
        >
          批量处理
        </el-button>
        <el-button 
          type="warning" 
          :disabled="!selectedRows.length"
          @click="handleBatchIgnore"
        >
          批量忽略
        </el-button>
      </el-button-group>
    </div>

    <!-- 告警列表 -->
    <el-card>
      <el-table 
        :data="tableData" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="time" label="告警时间" width="180" sortable />
        <el-table-column prop="level" label="告警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlarmLevelType(row.level)">
              {{ getAlarmLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="监控对象" width="180" />
        <el-table-column prop="metric" label="监控指标" width="120" />
        <el-table-column prop="value" label="当前值" width="100" />
        <el-table-column prop="threshold" label="阈值" width="100" />
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="告警内容" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'pending'"
              link 
              type="primary" 
              @click="handleProcess(row)"
            >
              处理
            </el-button>
            <el-button 
              v-if="row.status === 'pending'"
              link 
              type="warning" 
              @click="handleIgnore(row)"
            >
              忽略
            </el-button>
            <el-button 
              link 
              type="primary" 
              @click="handleDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 处理弹窗 -->
    <el-dialog
      v-model="processDialogVisible"
      :title="processTitle"
      width="600px"
    >
      <el-form
        ref="processFormRef"
        :model="processForm"
        :rules="processRules"
        label-width="100px"
      >
        <el-form-item label="处理方式" prop="type">
          <el-radio-group v-model="processForm.type">
            <el-radio label="auto">自动处理</el-radio>
            <el-radio label="manual">手动处理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理意见" prop="comment">
          <el-input
            v-model="processForm.comment"
            type="textarea"
            rows="4"
            placeholder="请输入处理意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleProcessSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="告警详情"
      width="800px"
    >
      <template v-if="currentAlarm">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="告警时间">
            {{ currentAlarm.time }}
          </el-descriptions-item>
          <el-descriptions-item label="告警级别">
            <el-tag :type="getAlarmLevelType(currentAlarm.level)">
              {{ getAlarmLevelText(currentAlarm.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="监控对象">
            {{ currentAlarm.target }}
          </el-descriptions-item>
          <el-descriptions-item label="监控指标">
            {{ currentAlarm.metric }}
          </el-descriptions-item>
          <el-descriptions-item label="当前值">
            {{ currentAlarm.value }}
          </el-descriptions-item>
          <el-descriptions-item label="阈值">
            {{ currentAlarm.threshold }}
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusType(currentAlarm.status)">
              {{ getStatusText(currentAlarm.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理人">
            {{ currentAlarm.processor || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="告警内容" :span="2">
            {{ currentAlarm.content }}
          </el-descriptions-item>
          <el-descriptions-item label="处理意见" :span="2">
            {{ currentAlarm.comment || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 处理历史 -->
        <div class="history-title">处理历史</div>
        <el-timeline>
          <el-timeline-item
            v-for="(history, index) in currentAlarm.history"
            :key="index"
            :timestamp="history.time"
            :type="getTimelineItemType(history.action)"
          >
            {{ history.content }}
          </el-timeline-item>
        </el-timeline>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance } from 'element-plus'

// 模拟数据
const alarmList = [
  {
    id: 1,
    time: '2024-01-10 12:00:00',
    level: 'high',
    target: 'web-server-01',
    metric: 'CPU使用率',
    value: '95%',
    threshold: '90%',
    status: 'pending',
    content: 'CPU使用率超过阈值',
    processor: '',
    comment: '',
    history: [
      {
        time: '2024-01-10 12:00:00',
        action: 'create',
        content: '系统自动创建告警'
      }
    ]
  },
  {
    id: 2,
    time: '2024-01-10 11:30:00',
    level: 'medium',
    target: 'db-server-01',
    metric: '内存使用率',
    value: '85%',
    threshold: '80%',
    status: 'resolved',
    content: '内存使用率超过阈值',
    processor: '管理员',
    comment: '已重启服务释放内存',
    history: [
      {
        time: '2024-01-10 11:30:00',
        action: 'create',
        content: '系统自动创建告警'
      },
      {
        time: '2024-01-10 11:35:00',
        action: 'process',
        content: '管��员开始处理'
      },
      {
        time: '2024-01-10 11:40:00',
        action: 'resolve',
        content: '管理员处理完成：已重启服务释放内存'
      }
    ]
  }
]

// 表格数据
const tableData = ref(alarmList)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  level: '',
  status: '',
  timeRange: []
})

// 处理表单
const processForm = reactive({
  type: 'manual',
  comment: ''
})

const processRules = {
  comment: [{ required: true, message: '请输入处理意见', trigger: 'blur' }]
}

const processFormRef = ref<FormInstance>()
const processDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentAlarm = ref<any>(null)
const isProcessingBatch = ref(false)

// 处理弹窗标题
const processTitle = computed(() => {
  return isProcessingBatch.value ? '批量处理告警' : '处理告警'
})

// 获取告警级别标签类型
const getAlarmLevelType = (level: string) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[level] || 'info'
}

// 获取告警级别显示文本
const getAlarmLevelText = (level: string) => {
  const texts: Record<string, string> = {
    high: '严重',
    medium: '警告',
    low: '普通'
  }
  return texts[level] || level
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'danger',
    processing: 'warning',
    resolved: 'success',
    ignored: 'info'
  }
  return types[status] || 'info'
}

// 获取状态显示文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '未处理',
    processing: '处理中',
    resolved: '已处理',
    ignored: '已忽略'
  }
  return texts[status] || status
}

// 获取时间线项目类型
const getTimelineItemType = (action: string): '' | 'primary' | 'success' | 'warning' | 'danger' => {
  const types: Record<string, '' | 'primary' | 'success' | 'warning' | 'danger'> = {
    create: 'primary',
    process: 'warning',
    resolve: 'success',
    ignore: 'danger'
  }
  return types[action] || ''
}

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索逻辑
  console.log('search:', searchForm)
  currentPage.value = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.level = ''
  searchForm.status = ''
  searchForm.timeRange = []
  handleSearch()
}

// 处理告警
const handleProcess = (row: any) => {
  currentAlarm.value = row
  isProcessingBatch.value = false
  processDialogVisible.value = true
}

// 批量处理
const handleBatchProcess = () => {
  if (!selectedRows.value.length) return
  isProcessingBatch.value = true
  processDialogVisible.value = true
}

// 忽略告警
const handleIgnore = (row: any) => {
  // TODO: 实现忽略逻辑
  console.log('ignore:', row)
}

// 批量忽略
const handleBatchIgnore = () => {
  if (!selectedRows.value.length) return
  // TODO: 实现批量忽略逻辑
  console.log('batch ignore:', selectedRows.value)
}

// 查看详情
const handleDetail = (row: any) => {
  currentAlarm.value = row
  detailDialogVisible.value = true
}

// 提交处理
const handleProcessSubmit = async () => {
  if (!processFormRef.value) return
  await processFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交逻辑
      console.log('process form:', processForm)
      processDialogVisible.value = false
      fetchData()
    }
  })
}

// 表格选择变化
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

// 获取表格数据
const fetchData = () => {
  // TODO: 实现获取数据逻辑
  total.value = alarmList.length
  tableData.value = alarmList.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value
  )
}
</script>

<style scoped>
.alarm-manage .search-card {
  margin-bottom: 20px;
}

.alarm-manage .action-bar {
  margin-bottom: 20px;
}

.alarm-manage .pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.history-title {
  margin: 20px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
  font-size: 16px;
  font-weight: bold;
}
</style> 