<template>
  <div class="online-database-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>线上数据库管理</span>
          <el-button type="primary">添加数据库</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="数据库名称" />
        <el-table-column prop="host" label="主机地址" />
        <el-table-column prop="port" label="端口" />
        <el-table-column prop="type" label="数据库类型" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tableData = ref([])

const handleEdit = (row: any) => {
  console.log('编辑', row)
}

const handleDelete = (row: any) => {
  console.log('删除', row)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 