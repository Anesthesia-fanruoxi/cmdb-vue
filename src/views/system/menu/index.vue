<template>
  <div class="menu-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </template>

      <el-table
        :data="menuData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        v-loading="loading"
        :expand-row-keys="expandedKeys"
        @row-click="handleRowClick"
        style="width: 100%"
      >
        <el-table-column prop="name" label="菜单名称" min-width="180" />
        <el-table-column prop="path" label="路由路径" min-width="180" />
        <el-table-column prop="component" label="组件路径" min-width="180" />
        <el-table-column prop="permission" label="权限标识" min-width="180" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="显示状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_visible ? 'success' : 'info'">
              {{ row.is_visible ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_enabled ? 'success' : 'danger'">
              {{ row.is_enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                link
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                type="primary"
                link
                @click="handleAdd(row)"
              >
                添加子菜单
              </el-button>
              <el-button
                type="danger"
                link
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 菜单表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="showDialog"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parent_id"
            :data="menuData"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择上级菜单"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input
            v-model="form.path"
            placeholder="请输入路由路径"
            :readonly="dialogType.value === 'add' && !!form.parent_id"
          >
            <template #prepend v-if="parentMenu">
              {{ parentMenu.path }}
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <div class="component-input-wrapper">
            <el-input
              v-model="form.component"
              placeholder="请输入组件路径"
            />
            <el-button
              v-if="form.path || parentMenu"
              type="primary"
              link
              @click="handleAutoFillComponent"
            >
              自动填充
            </el-button>
          </div>
          <div class="form-help-text" v-if="form.path || parentMenu">
            建议路径：{{ form.suggestedComponent || getDefaultComponentPath(parentMenu) }}
          </div>
        </el-form-item>
        <el-form-item label="权限标识" prop="permission">
          <el-input
            v-model="form.permission"
            placeholder="根据路由路径自动生成"
            readonly
            :disabled="true"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <IconSelect v-model="form.icon" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="显示状态">
          <el-radio-group v-model="form.is_visible">
            <el-radio :label="true">显示</el-radio>
            <el-radio :label="false">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.is_enabled">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getMenuTree, createMenu, updateMenu, deleteMenu, type MenuItem } from '@/api/menu'
import IconSelect from '@/components/IconSelect/index.vue'

const loading = ref(false)
const menuData = ref<MenuItem[]>([])
const showDialog = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentRow = ref<MenuItem>()
const formRef = ref<FormInstance>()
const expandedKeys = ref<number[]>([])

const form = ref({
  parent_id: null as number | null,
  name: '',
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 0,
  is_visible: true,
  is_enabled: true,
  suggestedComponent: ''
})

const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
  component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }],
  permission: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
}

const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? '新增菜单' : '编辑菜单'
})

// 处理行点击
const handleRowClick = (row: MenuItem, column: any, event: Event) => {
  // 如果点击的是按钮，不触发展开/收起
  if ((event.target as HTMLElement).closest('.el-button')) return
}

// 获取所有菜单ID
const getAllMenuIds = (menus: MenuItem[]): number[] => {
  let ids: number[] = []
  menus.forEach(menu => {
    ids.push(menu.id)
    if (menu.children?.length) {
      ids = ids.concat(getAllMenuIds(menu.children))
    }
  })
  return ids
}

// 展开/收起所有
const expandAll = (expand: boolean) => {
  expandedKeys.value = expand ? getAllMenuIds(menuData.value) : []
}

// 获取菜单树数据
const fetchMenuTree = async () => {
  try {
    loading.value = true
    const res = await getMenuTree()
    if (res.code === 200) {
      menuData.value = res.data
      // 默认展开所有节点
      expandAll(true)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取菜单失败')
  } finally {
    loading.value = false
  }
}

// 新增菜单
const handleAdd = (row?: MenuItem) => {
  dialogType.value = 'add'
  form.value = {
    parent_id: row?.id ?? null,
    name: '',
    path: row ? '' : '/',
    component: row ? '' : 'Layout',
    permission: row ? '' : '',
    icon: '',
    sort: 0,
    is_visible: true,
    is_enabled: true,
    suggestedComponent: ''
  }
  if (row) {
    parentMenu.value = row
  }
  showDialog.value = true
}

// 编辑菜单
const handleEdit = async (row: MenuItem) => {
  dialogType.value = 'edit'
  currentRow.value = row
  
  // 重置父菜单信息
  parentMenu.value = null
  
  // 如果有父菜单ID，先查找父菜单信息
  if (row.parent_id) {
    const findParent = (menus: MenuItem[], id: number): MenuItem | null => {
      for (const menu of menus) {
        if (menu.id === id) return menu
        if (menu.children) {
          const found = findParent(menu.children, id)
          if (found) return found
        }
      }
      return null
    }
    parentMenu.value = findParent(menuData.value, row.parent_id)
  }

  // 等待父菜单信息设置完成后再设置表单数据
  await nextTick()
  form.value = {
    parent_id: row.parent_id,
    name: row.name,
    path: parentMenu.value ? row.path.replace(parentMenu.value.path + '/', '') : row.path,
    component: row.component,
    permission: generatePermission(row.path),
    icon: row.icon,
    sort: row.sort,
    is_visible: row.is_visible,
    is_enabled: row.is_enabled,
    suggestedComponent: ''
  }
  showDialog.value = true
}

// 删除菜单
const handleDelete = async (row: MenuItem) => {
  try {
    await ElMessageBox.confirm('确认删除该菜单吗？', '提示', {
      type: 'warning'
    })
    const res = await deleteMenu(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchMenuTree()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 获取父菜单信息
const parentMenu = ref<MenuItem | null>(null)

// 获取默认组件路径
const getDefaultComponentPath = (parent: MenuItem, currentPath: string = '') => {
  // 如果当前有输入路径，使用当前路径
  if (currentPath) {
    return currentPath.replace(/^\//, '') + '/index'
  }
  // 否则使用父菜单路径
  return parent.path.replace(/^\//, '') + '/index'
}

// 根据路由路径生成权限标识
const generatePermission = (path: string) => {
  // 移除开头和结尾的斜杠，然后用冒号替换斜杠
  return path.replace(/^\/+|\/+$/g, '').replace(/\//g, ':')
}

// 监听路由路径变化，更新建议组件路径和权限标识
watch(() => form.value.path, (newPath) => {
  if (newPath) {
    // 更新建议组件路径
    const suggestedPath = parentMenu.value 
      ? parentMenu.value.path + '/' + newPath.replace(/^\//, '')
      : newPath
    form.value.suggestedComponent = getDefaultComponentPath(parentMenu.value || {} as MenuItem, suggestedPath)

    // 更新权限标识
    const fullPath = parentMenu.value
      ? parentMenu.value.path + '/' + newPath.replace(/^\//, '')
      : newPath
    form.value.permission = generatePermission(fullPath)
  }
})

// 监听父菜单ID变化
watch(() => form.value.parent_id, async (newVal) => {
  if (newVal) {
    // 查找父菜单信息
    const findParent = (menus: MenuItem[], id: number): MenuItem | null => {
      for (const menu of menus) {
        if (menu.id === id) return menu
        if (menu.children) {
          const found = findParent(menu.children, id)
          if (found) return found
        }
      }
      return null
    }
    parentMenu.value = findParent(menuData.value, newVal)
  
    if (parentMenu.value) {
      form.value.path = ''
      form.value.component = ''
    }
  } else {
    parentMenu.value = null
    form.value.path = '/'
    form.value.permission = ''
    form.value.component = 'Layout'
  }
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 处理路径和权限标识
    const formData = { ...form.value }
    if (parentMenu.value) {
      formData.path = parentMenu.value.path + '/' + formData.path
    }
    
    if (dialogType.value === 'add') {
      const res = await createMenu(formData)
      if (res.code === 200) {
        ElMessage.success('添加成功')
        showDialog.value = false
        fetchMenuTree()
      }
    } else {
      const res = await updateMenu({
        id: currentRow.value!.id,
        ...formData
      })
      if (res.code === 200) {
        ElMessage.success('更新成功')
        showDialog.value = false
        fetchMenuTree()
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 自动填充组件路径
const handleAutoFillComponent = () => {
  if (form.value.path) {
    // 使用当前路由路径生成组件路径
    const suggestedPath = parentMenu.value 
      ? parentMenu.value.path + '/' + form.value.path.replace(/^\//, '')
      : form.value.path
    form.value.component = getDefaultComponentPath(parentMenu.value || {} as MenuItem, suggestedPath)
  } else if (parentMenu.value) {
    // 如果没有路由路径，使用父菜单路径
    form.value.component = getDefaultComponentPath(parentMenu.value)
  }
}

onMounted(() => {
  fetchMenuTree()
})
</script>

<style scoped>
.menu-container {
  padding: 16px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-card__body) {
  padding: 0;
}

:deep(.el-table .el-table__row) {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

:deep(.el-table .el-table__row:hover) {
  background-color: var(--el-table-row-hover-bg-color);
}

:deep(.el-table__expand-icon) {
  transition: transform 0.3s ease-in-out;
}

:deep(.el-table__indent) {
  padding-left: 8px;
}

.component-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-button--link) {
  height: 32px;
  padding: 0 8px;
}

.form-help-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}
</style> 