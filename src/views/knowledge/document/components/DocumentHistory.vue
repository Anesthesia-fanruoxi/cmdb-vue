<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="历史版本"
    width="800px"
    append-to-body
  >
    <el-timeline>
      <el-timeline-item
        v-for="version in versionList"
        :key="version.id"
        :timestamp="version.created_at"
      >
        <h4>版本 {{ version.version }}</h4>
        <p>修改人: {{ version.updater_name }}</p>
        <div class="version-actions">
          <el-button link type="primary" @click="handleView(version)">
            查看
          </el-button>
          <el-button link type="warning" @click="handleRestore(version)">
            恢复此版本
          </el-button>
        </div>
      </el-timeline-item>
    </el-timeline>
  </el-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  versionList: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'view', 'restore'])

const handleView = (version: any) => {
  emit('view', version)
}

const handleRestore = (version: any) => {
  emit('restore', version)
}
</script>

<style lang="scss" scoped>
.version-actions {
  margin-top: 8px;
}
</style> 