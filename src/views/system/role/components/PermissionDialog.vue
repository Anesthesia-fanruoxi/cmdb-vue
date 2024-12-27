<template>
  <el-dialog
    title="权限配置"
    v-model="visible"
    width="600px"
    @close="handleClose"
  >
    <div class="dialog-top">
      <el-switch
        v-model="enableCascade"
        active-text="启用级联"
        inactive-text="禁用级联"
        @change="handleCascadeChange"
      />
    </div>
    <el-tree
      ref="treeRef"
      :data="treeData"
      show-checkbox
      node-key="id"
      :props="defaultProps"
      :default-checked-keys="checkedKeys"
      :check-strictly="!enableCascade"
      default-expand-all
      highlight-current
    />
    <template #footer>
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ElTree } from 'element-plus'
import { getAllPermissions, getRolePermissions, updateRolePermissions } from '@/api/role'
import { useUserStore } from '@/store/modules/user'
import router from '@/router'

interface TreeNode {
  id: number
  name: string
  children?: TreeNode[]
}

const props = defineProps<{
  modelValue: boolean
  roleId?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// 状态
const visible = ref(false)
const loading = ref(false)
const treeData = ref<TreeNode[]>([])
const checkedKeys = ref<number[]>([])
const treeRef = ref<InstanceType<typeof ElTree>>()

// 树的配置
const defaultProps = {
  children: 'children',
  label: 'name',
}

// 添加级联控制状态
const enableCascade = ref(false)

// 处理级联开关变化
const handleCascadeChange = (val: boolean) => {
  if (treeRef.value) {
    // 保存当前选中状态
    const currentChecked = treeRef.value.getCheckedKeys()
    // 切换模式后重新设置选中状态
    nextTick(() => {
      treeRef.value?.setCheckedKeys(currentChecked)
    })
  }
}

// 监听 visible 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  // 当对话框打开时，重新加载数据
  if (val && props.roleId) {
    loadData()
  }
})

watch(() => visible.value, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    resetState()
  }
})

// 加载权限数据
const loadData = async () => {
  if (!props.roleId) return
  
  try {
    // 重置之前的数据
    resetState()
    
    // 获取菜单树
    const menuTreeRes = await getAllPermissions()
    if (menuTreeRes.code === 200) {
      treeData.value = menuTreeRes.data
    }
    
    // 获取角色已有菜单权限
    const roleMenusRes = await getRolePermissions(props.roleId)
    if (roleMenusRes.code === 200) {
      checkedKeys.value = roleMenusRes.data || []
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取权限数据失败')
  }
}

// 获取节点的所有父节点 ID
const getParentIds = (data: TreeNode[], nodeId: number): number[] => {
  const parentIds: number[] = []
  const findParent = (nodes: TreeNode[], targetId: number) => {
    for (const node of nodes) {
      if (node.children?.some(child => child.id === targetId)) {
        parentIds.push(node.id)
        findParent(data, node.id) // 继续查找更上层的父节点
        break
      }
      if (node.children) {
        findParent(node.children, targetId)
      }
    }
  }
  findParent(data, nodeId)
  return parentIds
}

// 修改提交方法
const handleSubmit = async () => {
  if (!props.roleId || !treeRef.value) return
  
  try {
    submitLoading.value = true
    const checkedNodes = treeRef.value.getCheckedKeys()
    
    await updateRolePermissions(props.roleId, checkedNodes)
    ElMessage.success('权限配置已更新')
    visible.value = false
    
    const userStore = useUserStore()
    if (props.roleId === userStore.userInfo.role?.id) {
      await userStore.resetRoutes()
      router.push('/dashboard')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '更新权限失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置状态
const resetState = () => {
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([], false)
  }
  treeData.value = []
  checkedKeys.value = []
}

// 关闭对话框
const handleClose = () => {
  resetState()
}

// 添加 submitLoading 的定义
const submitLoading = ref(false)
</script>

<style scoped>
.dialog-top {
  margin-bottom: 15px;
}
</style> 