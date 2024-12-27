<template>
  <div class="hamburger-container" @click="toggleClick">
    <el-icon :class="{ 'is-active': isActive }">
      <Expand />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { Expand } from '@element-plus/icons-vue'

defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggleClick'])

const toggleClick = () => {
  emit('toggleClick')
}
</script>

<style scoped>
.hamburger-container {
  padding: 0 15px;
  height: 100%;
  float: left;
  cursor: pointer;
  transition: background .3s;
  -webkit-tap-highlight-color:transparent;
  
  &:hover {
    background: rgba(0, 0, 0, .025)
  }
}

.el-icon {
  vertical-align: middle;
  font-size: 20px;

  &.is-active {
    transform: rotate(180deg);
  }
}
</style> 