<template>
  <div class="menu-manage">
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd(null)">
        <el-icon><Plus /></el-icon>新增菜单
      </el-button>
    </div>

    <!-- 菜单列表 -->
    <el-card>
      <el-table
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        style="width: 100%"
      >
        <el-table-column prop="title" label="菜单名称" min-width="200">
          <template #default="{ row }">
            <el-icon v-if="row.icon" class="menu-icon">
              <component :is="row.icon" />
            </el-icon>
            {{ row.title }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="200" />
        <el-table-column prop="component" label="组件路径" min-width="200" />
        <el-table-column prop="permission" label="权限标识" min-width="150" />
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'menu' ? '' : 'info'">
              {{ row.type === 'menu' ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleAdd(row)">新增</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              link 
              :type="row.status === 'enabled' ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              link 
              type="danger" 
              @click="handleDelete(row)"
              :disabled="!!row.children?.length"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 菜单编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="formData.parentId"
            :data="menuTree"
            :props="{ label: 'title', value: 'id' }"
            placeholder="请选择上级菜单"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入菜单名称" />
        </el-form-item>
        
        <template v-if="formData.type === 'menu'">
          <el-form-item label="图标" prop="icon">
            <el-input v-model="formData.icon" placeholder="请输入图标名称">
              <template #append>
                <el-popover
                  placement="bottom"
                  :width="400"
                  trigger="click"
                >
                  <template #reference>
                    <el-button>选择图标</el-button>
                  </template>
                  <div class="icon-list">
                    <div 
                      v-for="icon in iconList"
                      :key="icon"
                      class="icon-item"
                      @click="selectIcon(icon)"
                    >
                      <el-icon>
                        <component :is="icon" />
                      </el-icon>
                      <span>{{ icon }}</span>
                    </div>
                  </div>
                </el-popover>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="路由路径" prop="path">
            <el-input v-model="formData.path" placeholder="请输入路由路径" />
          </el-form-item>
          
          <el-form-item label="组件路径" prop="component">
            <el-input v-model="formData.component" placeholder="请输入组件路径" />
          </el-form-item>
        </template>
        
        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="formData.permission" placeholder="请输入权限标识" />
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as ElementPlusIcons from '@element-plus/icons-vue'

// 定义菜单项接口
interface MenuItem {
  id: number
  title: string
  icon?: string
  path?: string
  component?: string
  permission: string
  sort: number
  type: 'menu' | 'button'
  status: 'enabled' | 'disabled'
  children?: MenuItem[]
}

// 表格数据
const tableData = ref<MenuItem[]>([
  {
    id: 1,
    title: '资产管理',
    icon: 'Monitor',
    path: '/assets',
    component: 'Layout',
    permission: 'assets',
    sort: 1,
    type: 'menu',
    status: 'enabled',
    children: [
      {
        id: 11,
        title: '服务器管理',
        icon: 'Server',
        path: 'server',
        component: 'assets/server/index',
        permission: 'assets:server',
        sort: 1,
        type: 'menu',
        status: 'enabled',
        children: [
          {
            id: 111,
            title: '新增服务器',
            permission: 'assets:server:add',
            sort: 1,
            type: 'button',
            status: 'enabled'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: '系统管理',
    icon: 'Setting',
    path: '/system',
    component: 'Layout',
    permission: 'system',
    sort: 2,
    type: 'menu',
    status: 'enabled',
    children: [
      {
        id: 21,
        title: '字典管理',
        icon: 'Document',
        path: 'dict',
        component: 'system/dict/index',
        permission: 'system:dict',
        sort: 1,
        type: 'menu',
        status: 'enabled',
        children: [
          {
            id: 211,
            title: '项目字典',
            icon: 'List',
            path: 'project',
            component: 'system/dict/project/index',
            permission: 'system:dict:project',
            sort: 1,
            type: 'menu',
            status: 'enabled'
          }
        ]
      }
    ]
  }
])

// 菜单树数据（用于选择上级菜单）
const menuTree = computed(() => {
  const filterMenus = (menus: MenuItem[]): MenuItem[] => {
    return menus.filter(item => item.type === 'menu').map(item => ({
      ...item,
      children: item.children ? filterMenus(item.children) : undefined
    }))
  }
  return filterMenus(tableData.value)
})

// 表单数据接口
interface MenuForm {
  parentId: number | null
  type: 'menu' | 'button'
  title: string
  icon: string
  path: string
  component: string
  permission: string
  sort: number
  status: 'enabled' | 'disabled'
}

// 编辑相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive<MenuForm>({
  parentId: null,
  type: 'menu',
  title: '',
  icon: '',
  path: '',
  component: '',
  permission: '',
  sort: 1,
  status: 'enabled'
})

// 表单校验规则
const rules = {
  type: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  path: [
    { 
      required: true, 
      message: '请输入路由路径', 
      trigger: 'blur',
      validator: (_: any, value: string, callback: (error?: Error) => void) => {
        if (formData.type === 'menu' && !value) {
          callback(new Error('请输入路由路径'))
        } else {
          callback()
        }
      }
    }
  ],
  component: [
    {
      required: true,
      message: '请输入组件路径',
      trigger: 'blur',
      validator: (_: any, value: string, callback: (error?: Error) => void) => {
        if (formData.type === 'menu' && !value) {
          callback(new Error('请输入组件路径'))
        } else {
          callback()
        }
      }
    }
  ],
  permission: [
    { required: true, message: '请输入权限标识', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9:]*$/, message: '只能包含小写字母、数字和冒号，且必须以字母开头', trigger: 'blur' }
  ]
}

// 图标列表
const iconList = Object.keys(ElementPlusIcons)

// 选择图标
const selectIcon = (icon: string) => {
  formData.icon = icon
}

// 新增菜单
const handleAdd = (parent: MenuItem | null) => {
  isEdit.value = false
  formData.parentId = parent?.id || null
  formData.type = 'menu'
  formData.title = ''
  formData.icon = ''
  formData.path = ''
  formData.component = ''
  formData.permission = parent ? `${parent.permission}:` : ''
  formData.sort = 1
  formData.status = 'enabled'
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (row: MenuItem) => {
  isEdit.value = true
  // 查找父节点
  const findParent = (menus: MenuItem[], targetId: number): MenuItem | null => {
    for (const menu of menus) {
      if (menu.children?.some(child => child.id === targetId)) {
        return menu
      }
      if (menu.children) {
        const parent = findParent(menu.children, targetId)
        if (parent) return parent
      }
    }
    return null
  }
  const parent = findParent(tableData.value, row.id)
  
  Object.assign(formData, row)
  formData.parentId = parent?.id || null
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = (row: MenuItem) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确认${action}该菜单？`, '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 实现状态切换逻辑
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  })
}

// 删除菜单
const handleDelete = (row: MenuItem) => {
  if (row.children?.length) return
  ElMessageBox.confirm('确认删除该菜单？', '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 实现删除逻辑
    ElMessage.success('删除成功')
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交逻辑
      console.log('submit:', formData)
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.menu-manage .action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.menu-icon {
  margin-right: 4px;
  vertical-align: middle;
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  padding: 10px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.icon-item:hover {
  background-color: #f5f7fa;
}

.icon-item span {
  font-size: 12px;
  color: #909399;
}
</style> 