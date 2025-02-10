<template>
  <el-table :data="data" v-loading="loading" style="width: 100%">
    <el-table-column prop="username" label="用户名" />
    <el-table-column prop="name" label="昵称" />
    <el-table-column label="手机号">
      <template #default="{ row }">
        <el-tooltip 
          :content="row.phone" 
          placement="right"
          :show-after="0"
          :hide-after="0"
        >
          <span 
            @dblclick="copyToClipboard(row.phone)" 
            class="phone-number"
          >
            {{ maskPhoneNumber(row.phone) }}
          </span>
        </el-tooltip>
      </template>
    </el-table-column>
    <el-table-column prop="email" label="邮箱" show-overflow-tooltip />
    <el-table-column label="部门">
      <template #default="{ row }">
        <el-tag 
          v-if="row.department?.name" 
          size="small" 
          :type="getDepartmentTagType(row.department.code)"
          effect="plain"
        >
          {{ row.department.name }}
        </el-tag>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column label="角色">
      <template #default="{ row }">
        <el-tag 
          v-if="row.role?.name" 
          size="small" 
          :type="getRoleTagType(row.role.code)"
          effect="plain"
        >
          {{ row.role.name }}
        </el-tag>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态">
      <template #default="{ row }">
        <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'">
          {{ row.status === 'enabled' ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="250" fixed="right">
      <template #default="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">
          <el-icon><Edit /></el-icon>编辑
        </el-button>
        <el-button 
          link 
          :type="row.status === 'enabled' ? 'danger' : 'success'"
          @click="handleToggleStatus(row)"
        >
          {{ row.status === 'enabled' ? '禁用' : '启用' }}
        </el-button>
        <el-button link type="danger" @click="handleDelete(row)">
          <el-icon><Delete /></el-icon>删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import type { TableUser } from '../types'

const props = defineProps<{
  data: TableUser[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', row: TableUser): void
  (e: 'delete', row: TableUser): void
  (e: 'toggle-status', row: TableUser): void
}>()

// 手机号脱敏
const maskPhoneNumber = (phone: string) => {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 获取标签类型的通用函数
const getTagType = (code: string, isRole = false): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  if (!code) return 'info'
  const sum = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const types: Array<'success' | 'warning' | 'info' | 'primary' | 'danger'> = isRole
    ? ['success', 'warning', 'info', 'primary', 'danger']
    : ['primary', 'success', 'warning', 'danger', 'info']
  return types[sum % types.length]
}

// 获取角色标签类型
const getRoleTagType = (code: string) => getTagType(code, true)

// 获取部门标签类型
const getDepartmentTagType = (code: string) => getTagType(code, false)

// 操作处理函数
const handleEdit = (row: TableUser) => {
  emit('edit', row)
}

const handleDelete = (row: TableUser) => {
  emit('delete', row)
}

const handleToggleStatus = (row: TableUser) => {
  emit('toggle-status', row)
}
</script>

<style scoped>
.phone-number {
  cursor: pointer;
  color: #606266;
}

.phone-number:hover {
  color: #409EFF;
}
</style> 