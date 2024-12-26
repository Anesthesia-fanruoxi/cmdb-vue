<template>
  <div class="status-list">
    <div class="table-operations" v-if="selectedRows.length > 0">
      <el-button-group>
        <el-button 
          type="success" 
          :loading="batchLoading"
          @click="handleBatchOperation('scale_up')"
        >
          批量启动
        </el-button>
        <el-button 
          type="danger" 
          :loading="batchLoading"
          @click="handleBatchOperation('scale_down')"
        >
          批量停止
        </el-button>
      </el-button-group>
      <span class="selected-count">已选择 {{ selectedRows.length }} 项</span>
    </div>
    <el-table 
      :data="data" 
      style="width: 100%; margin-top: 20px;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="project_name" label="项目名称" />
      <el-table-column prop="namespace" label="命名空间" />
      <el-table-column prop="action_user_name" label="操作人" width="120">
        <template #default="{ row }">
          {{ row.action_user_name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="action_time" label="操作时间" width="180">
        <template #default="{ row }">
          {{ row.action_time || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="运行状态" width="100">
        <template #default="{ row }">
          <div class="status-switch">
            <el-switch
              v-model="row.has_pods"
              :active-value="true"
              :inactive-value="false"
              :loading="row.loading"
              :disabled="row.loading"
              inline-prompt
              :active-text="row.loading ? '操作中' : '运行中'"
              :inactive-text="row.loading ? '操作中' : '已停止'"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;"
              @change="(val) => handleStatusChange(val, row)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="release_user_name" label="发版人" width="120">
        <template #default="{ row }">
          {{ row.release_user_name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="release_time" label="发版时间" width="180">
        <template #default="{ row }">
          {{ row.release_time || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="域名地址" width="200">
        <template #default="{ row }">
          <el-link
            v-if="row.sub_domain"
            type="primary"
            :href="`http://${row.sub_domain}`"
            target="_blank"
          >
            {{ row.sub_domain }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="发版操作" width="100">
        <template #default="{ row }">
          <el-button
            v-if="!row.loading"
            type="primary"
            class="iteration-btn"
            @click="handleIteration(row)"
          >
            <el-icon class="custom-icon">
              <svg viewBox="0 0 1024 1024" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
                />
                <path
                  fill="currentColor"
                  d="M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.6-3.7 1.8-8.7-1.8-11.2z"
                />
              </svg>
            </el-icon>
            <span style="margin-left: 4px">迭代</span>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="距离上次操作时间" width="180">
        <template #default="{ row }">
          {{ getTimeDiff(row.action_timestamp, row.operation_timestamp) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ClusterStatus, ApiResponse } from '../types'
import { getTimeDiff } from '../utils/time'
import request from '../../../../../utils/request'

const props = defineProps<{
  data: ClusterStatus[]
}>()

const emit = defineEmits<{
  (e: 'iteration', row: ClusterStatus): void
  (e: 'status-change'): void
}>()

const selectedRows = ref<ClusterStatus[]>([])
const batchLoading = ref(false)

const handleSelectionChange = (rows: ClusterStatus[]) => {
  selectedRows.value = rows
}

const handleStatusChange = async (val: boolean, row: ClusterStatus) => {
  if (!val) {
    try {
      await ElMessageBox.confirm(
        `确认要停止 ${row.namespace} 环境`,
        '停止确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch (error) {
      return
    }
  }

  row.loading = true
  try {
    const response = await request.post<ApiResponse<any>>('/cluster/scale', {
      namespace: row.namespace,
      action: val ? 'scale_up' : 'scale_down'
    })
    if (response.data.code === 200) {
      row.has_pods = val
      row.action_time = new Date().toLocaleString()
      emit('status-change')
    }
  } catch (error) {
    console.error('修改状态失败:', error)
    ElMessage.error('修改状态失败')
  } finally {
    row.loading = false
  }
}

const handleBatchOperation = async (action: 'scale_up' | 'scale_down') => {
  const targetStatus = action === 'scale_up'
  const needOperateRows = selectedRows.value.filter(row => row.has_pods !== targetStatus)
  
  if (needOperateRows.length === 0) {
    ElMessage.warning('所选项目当前状态已是目标状态，无需操作')
    return
  }

  if (action === 'scale_down') {
    try {
      await ElMessageBox.confirm(
        `确认要停止选中的 ${needOperateRows.length} 个环境吗？`,
        '批量停止确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch (error) {
      return
    }
  }

  try {
    needOperateRows.forEach(row => {
      row.loading = true
    })

    batchLoading.value = true
    
    await request.post<ApiResponse<any>>('/asset/test/cluster/scale/batch', {
      namespaces: needOperateRows.map(row => row.namespace),
      action
    })

    // 显示操作已提交的提示
    ElMessage.success('操作已提交')

    // 异步操作已提交，立即结束加载状态
    needOperateRows.forEach(row => {
      row.loading = false
    })
    batchLoading.value = false

  } catch (error: any) {
    console.error('批量操作失败:', error)
    ElMessage.error('批量操作失败')
    // 发生错误时也要结束加载状态
    needOperateRows.forEach(row => {
      row.loading = false
    })
    batchLoading.value = false
  }
}

const handleIteration = (row: ClusterStatus) => {
  emit('iteration', row)
}
</script>

<script lang="ts">
export default {
  name: 'StatusTable'
}
</script>

<style scoped>
.status-list {
  flex: 1;
  overflow: hidden;
  position: relative;
  margin-top: 20px;
}

.status-list :deep(.el-table) {
  height: 100%;
}

.status-list :deep(.el-table__body-wrapper) {
  overflow-y: auto;
  height: calc(100% - 40px);
}

.table-operations {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.selected-count {
  font-size: 14px;
  color: #606266;
}

.status-switch {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-switch.is-checked .el-switch__core .el-switch__inner) {
  left: 23px !important;
  color: white;
}

:deep(.el-switch .el-switch__core .el-switch__inner) {
  left: 23px !important;
  color: white;
}

:deep(.el-switch__core) {
  width: 65px !important;
}

.iteration-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 15px;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #1677ff, #36cfc9);
  border: none;
  height: 28px;
  margin: 0;
  color: white;
}

.iteration-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.3);
}

.iteration-btn .custom-icon {
  font-size: 14px;
}
</style> 