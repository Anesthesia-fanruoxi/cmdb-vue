<template>
  <div class="error-page">
    <div class="error-code">404</div>
    <div class="error-desc">抱歉，您访问的页面不存在</div>
    <el-button type="primary" @click="router.push('/')">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<style scoped>
.error-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #409eff;
}

.error-desc {
  font-size: 24px;
  color: #606266;
  margin: 20px 0 30px;
}
</style>
