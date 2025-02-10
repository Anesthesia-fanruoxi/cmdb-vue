<template>
  <div class="search-bar">
    <el-form :inline="true" :model="queryParams">
      <el-form-item label="用户名">
        <el-input 
          v-model="queryParams.username" 
          placeholder="请输入用户名" 
          clearable 
          @input="handleSearch"
        />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input 
          v-model="queryParams.name" 
          placeholder="请输入昵称" 
          clearable 
          @input="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select 
          v-model="queryParams.status" 
          placeholder="请选择状态" 
          clearable 
          style="width: 160px"
          @change="handleSearch"
        >
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { UserQueryParams } from '@/api/user'

// 初始化查询参数
const queryParams = reactive<UserQueryParams>({
  username: '',
  name: '',
  phone: '',
  email: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const emit = defineEmits<{
  (e: 'search', params: UserQueryParams): void
  (e: 'reset'): void
}>()

// 搜索处理
const handleSearch = () => {
  emit('search', queryParams)
}

// 重置处理
const handleReset = () => {
  // 重置所有查询参数
  queryParams.username = ''
  queryParams.name = ''
  queryParams.phone = ''
  queryParams.email = ''
  queryParams.status = ''
  queryParams.pageNum = 1
  
  // 触发重置事件
  emit('reset')
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 20px;
}
</style> 