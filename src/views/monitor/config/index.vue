<template>
  <div class="monitor-config">
    <el-tabs v-model="activeTab">
      <!-- 监控项配置 -->
      <el-tab-pane label="监控项配置" name="monitor">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>监控项配置</span>
              <el-button type="primary" @click="handleAddMonitor">
                新增监控项
              </el-button>
            </div>
          </template>
          
          <el-table :data="monitorList" style="width: 100%">
            <el-table-column prop="name" label="监控项名称" />
            <el-table-column prop="target" label="监控对象" />
            <el-table-column prop="metric" label="监控指标" />
            <el-table-column prop="interval" label="采集间隔" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
                  {{ row.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditMonitor(row)">
                  编辑
                </el-button>
                <el-button 
                  link 
                  :type="row.status === 'enabled' ? 'warning' : 'success'"
                  @click="handleToggleMonitor(row)"
                >
                  {{ row.status === 'enabled' ? '禁用' : '启用' }}
                </el-button>
                <el-button link type="danger" @click="handleDeleteMonitor(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 告警规则配置 -->
      <el-tab-pane label="告警规则配置" name="alarm">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>告警规则配置</span>
              <el-button type="primary" @click="handleAddRule">
                新增规则
              </el-button>
            </div>
          </template>
          
          <el-table :data="ruleList" style="width: 100%">
            <el-table-column prop="name" label="规则名称" />
            <el-table-column prop="metric" label="监控指标" />
            <el-table-column prop="operator" label="判断条件" />
            <el-table-column prop="threshold" label="阈值" />
            <el-table-column prop="duration" label="持续时间" />
            <el-table-column prop="level" label="告警级别">
              <template #default="{ row }">
                <el-tag :type="getAlarmLevelType(row.level)">
                  {{ getAlarmLevelText(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
                  {{ row.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditRule(row)">
                  编辑
                </el-button>
                <el-button 
                  link 
                  :type="row.status === 'enabled' ? 'warning' : 'success'"
                  @click="handleToggleRule(row)"
                >
                  {{ row.status === 'enabled' ? '禁用' : '启用' }}
                </el-button>
                <el-button link type="danger" @click="handleDeleteRule(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 通知策略配置 -->
      <el-tab-pane label="通知策略配置" name="notify">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>通知策略配置</span>
              <el-button type="primary" @click="handleAddNotify">
                新增策略
              </el-button>
            </div>
          </template>
          
          <el-table :data="notifyList" style="width: 100%">
            <el-table-column prop="name" label="策略名称" />
            <el-table-column prop="type" label="通知方式">
              <template #default="{ row }">
                <el-tag>{{ getNotifyTypeText(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="通知对象" />
            <el-table-column prop="level" label="告警级别">
              <template #default="{ row }">
                <el-tag :type="getAlarmLevelType(row.level)">
                  {{ getAlarmLevelText(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
                  {{ row.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditNotify(row)">
                  编辑
                </el-button>
                <el-button 
                  link 
                  :type="row.status === 'enabled' ? 'warning' : 'success'"
                  @click="handleToggleNotify(row)"
                >
                  {{ row.status === 'enabled' ? '禁用' : '启用' }}
                </el-button>
                <el-button link type="danger" @click="handleDeleteNotify(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 添加模板配置 tab -->
      <el-tab-pane label="通知模板" name="template">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>通知模板</span>
              <el-button type="primary" @click="handleAddTemplate">
                新增模板
              </el-button>
            </div>
          </template>
          
          <el-table :data="templateList" style="width: 100%">
            <el-table-column prop="name" label="模板名称" />
            <el-table-column prop="type" label="通知方式">
              <template #default="{ row }">
                <el-tag>{{ getNotifyTypeText(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="titleTemplate" label="标题模板" show-overflow-tooltip />
            <el-table-column prop="contentTemplate" label="内容模板" show-overflow-tooltip />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditTemplate(row)">
                  编辑
                </el-button>
                <el-button link type="danger" @click="handleDeleteTemplate(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加监控项表单弹窗 -->
    <monitor-form
      v-model:visible="monitorFormVisible"
      :is-edit="isEdit"
      :data="currentMonitor"
      @submit="handleMonitorSubmit"
    />

    <!-- 添加告警规则表单弹窗 -->
    <rule-form
      v-model:visible="ruleFormVisible"
      :is-edit="isEdit"
      :data="currentRule"
      @submit="handleRuleSubmit"
    />

    <!-- 添加通知策略表单弹窗 -->
    <notify-form
      v-model:visible="notifyFormVisible"
      :is-edit="isEdit"
      :data="currentNotify"
      @submit="handleNotifySubmit"
    />

    <!-- 添加模板表单弹窗 -->
    <notify-template
      v-model:visible="templateFormVisible"
      :is-edit="isEdit"
      :data="currentTemplate"
      @submit="handleTemplateSubmit"
    />

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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import MonitorForm from './components/MonitorForm.vue'
import RuleForm from './components/RuleForm.vue'
import NotifyForm from './components/NotifyForm.vue'
import NotifyTemplate from './components/NotifyTemplate.vue'

const activeTab = ref('monitor')

// 监控项列表
const monitorList = ref([
  {
    id: 1,
    name: 'CPU监控',
    target: 'web-server-01',
    metric: 'CPU使用率',
    interval: '30s',
    status: 'enabled'
  },
  {
    id: 2,
    name: '内存监控',
    target: 'web-server-01',
    metric: '内存使用率',
    interval: '30s',
    status: 'enabled'
  }
])

// 告警规则列表
const ruleList = ref([
  {
    id: 1,
    name: 'CPU告警',
    metric: 'CPU使用率',
    operator: '>',
    threshold: '90%',
    duration: '5m',
    level: 'high',
    status: 'enabled'
  },
  {
    id: 2,
    name: '内存告警',
    metric: '内存使用率',
    operator: '>',
    threshold: '80%',
    duration: '5m',
    level: 'medium',
    status: 'enabled'
  }
])

// 通知策略列表
const notifyList = ref([
  {
    id: 1,
    name: '邮件通知',
    type: 'email',
    target: 'admin@example.com',
    level: 'high',
    status: 'enabled'
  },
  {
    id: 2,
    name: '钉钉通知',
    type: 'dingtalk',
    target: '运维组',
    level: 'medium',
    status: 'enabled'
  }
])

// 模板列表
const templateList = ref([
  {
    id: 1,
    name: '默认邮件模板',
    type: 'email',
    titleTemplate: '[{level}] {target} - {metric}告警',
    contentTemplate: '监控对象：{target}\n监控指标：{metric}\n当前值：{value}\n阈值：{threshold}\n告警时间：{time}\n\n{description}'
  },
  {
    id: 2,
    name: '默认钉钉模板',
    type: 'dingtalk',
    titleTemplate: '【{level}】{target}告警通知',
    contentTemplate: '### {target} - {metric}告警\n\n- 当前值：{value}\n- 阈值：{threshold}\n- 时间：{time}\n\n> {description}'
  }
])

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

// 获取通知方式显示文本
const getNotifyTypeText = (type: string) => {
  const texts: Record<string, string> = {
    email: '邮件',
    dingtalk: '钉钉',
    webhook: 'Webhook'
  }
  return texts[type] || type
}

// 监控项相关操作
const handleAddMonitor = () => {
  isEdit.value = false
  currentMonitor.value = null
  monitorFormVisible.value = true
}

const handleEditMonitor = (row: any) => {
  isEdit.value = true
  currentMonitor.value = row
  monitorFormVisible.value = true
}

const handleToggleMonitor = (row: any) => {
  // TODO: 实现启用/禁用监控项
}

const handleDeleteMonitor = (row: any) => {
  // TODO: 实现删除监��项
}

// 告警规则相关操作
const handleAddRule = () => {
  isEdit.value = false
  currentRule.value = null
  ruleFormVisible.value = true
}

const handleEditRule = (row: any) => {
  isEdit.value = true
  currentRule.value = row
  ruleFormVisible.value = true
}

const handleToggleRule = (row: any) => {
  // TODO: 实现启用/禁用规则
}

const handleDeleteRule = (row: any) => {
  // TODO: 实现删除规则
}

// 通知策略相关操作
const handleAddNotify = () => {
  isEdit.value = false
  currentNotify.value = null
  notifyFormVisible.value = true
}

const handleEditNotify = (row: any) => {
  isEdit.value = true
  currentNotify.value = row
  notifyFormVisible.value = true
}

const handleToggleNotify = (row: any) => {
  // TODO: 实现启用/禁用策略
}

const handleDeleteNotify = (row: any) => {
  // TODO: 实现删除策略
}

// 模板表单相关
const templateFormVisible = ref(false)
const currentTemplate = ref<any>(null)

// 添加模板
const handleAddTemplate = () => {
  isEdit.value = false
  currentTemplate.value = null
  templateFormVisible.value = true
}

// 编辑模板
const handleEditTemplate = (row: any) => {
  isEdit.value = true
  currentTemplate.value = row
  templateFormVisible.value = true
}

// 删除模板
const handleDeleteTemplate = (row: any) => {
  ElMessageBox.confirm('确认删除该模板？', '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 实现删除逻辑
    ElMessage.success('删除成功')
  })
}

// 提交模板表单
const handleTemplateSubmit = (data: any) => {
  console.log('submit template:', data)
  // TODO: 实现提交逻辑
  ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
}

// 监控表单相关
const monitorFormVisible = ref(false)
const isEdit = ref(false)
const currentMonitor = ref<any>(null)

// 提交监控表单
const handleMonitorSubmit = (data: any) => {
  console.log('submit monitor:', data)
  // TODO: 实现提交逻辑
  ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
}

// 告警规则表单相关
const ruleFormVisible = ref(false)
const currentRule = ref<any>(null)

// 添加规则
const handleAddRule = () => {
  isEdit.value = false
  currentRule.value = null
  ruleFormVisible.value = true
}

// 编辑规则
const handleEditRule = (row: any) => {
  isEdit.value = true
  currentRule.value = row
  ruleFormVisible.value = true
}

// 提交规则表单
const handleRuleSubmit = (data: any) => {
  console.log('submit rule:', data)
  // TODO: 实现提交逻辑
  ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
}

// 通知策略表单相关
const notifyFormVisible = ref(false)
const currentNotify = ref<any>(null)

// 添加策略
const handleAddNotify = () => {
  isEdit.value = false
  currentNotify.value = null
  notifyFormVisible.value = true
}

// 编辑策略
const handleEditNotify = (row: any) => {
  isEdit.value = true
  currentNotify.value = row
  notifyFormVisible.value = true
}

// 提交策略表单
const handleNotifySubmit = (data: any) => {
  console.log('submit notify:', data)
  // TODO: 实现提交逻辑
  ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
}
</script>

<style scoped>
.monitor-config {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 