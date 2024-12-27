<template>
  <div class="department-manage">
    <div class="header">
      <h2 class="title">部门管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd()">
        新增部门
      </el-button>
    </div>

    <el-card class="content-card">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <div class="search-wrapper">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入部门名称或代码"
            clearable
            class="search-input"
            :prefix-icon="Search"
            @keyup.enter="handleQuery"
          >
            <template #append>
              <el-button :icon="Search" @click="handleQuery">
                搜索
              </el-button>
            </template>
          </el-input>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="filteredDepartmentList"
        border
        stripe
        highlight-current-row
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="部门名称" width="180" />
        <el-table-column prop="code" label="部门代码" width="120" />
        <el-table-column prop="description" label="描述" min-width="10%" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="created_at" label="创建时间" min-width="5%" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                type="primary"
                link
                :icon="Edit"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                type="primary"
                link
                :icon="Setting"
                @click="handleProjectConfig(row)"
              >
                项目配置
              </el-button>
              <el-button
                type="danger"
                link
                :icon="Delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 部门表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新增部门' : '编辑部门'"
      width="580px"
      :close-on-click-modal="false"
      destroy-on-close
      @closed="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="department-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门代码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入部门代码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="上级部门" prop="parent_id">
          <el-tree-select
            v-model="formData.parent_id"
            :data="departmentList"
            :props="{
              label: 'name',
              value: 'id',
              children: 'children',
              checkStrictly: true
            }"
            placeholder="请选择上级部门"
            class="w-full"
            clearable
            check-strictly
            node-key="id"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入部门描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number 
            v-model="formData.sort" 
            :min="0" 
            :max="999"
            controls-position="right"
            class="w-full"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 项目配置对话框 -->
    <el-dialog
      v-model="projectDialogVisible"
      :title="`${currentDept?.name || ''} - 项目配置`"
      width="800px"
      destroy-on-close
    >
      <el-table
        ref="projectTableRef"
        v-loading="projectLoading"
        :data="projectList"
        border
        stripe
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="project_name" label="项目名称" width="180" />
        <el-table-column prop="project" label="项目编码" width="120" />
      </el-table>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="projectSubmitLoading" @click="handleProjectSubmit">
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { Search, Edit, Delete, Setting, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getDepartmentList, createDepartment, updateDepartment, deleteDepartment, 
  getProjectDict, updateDepartmentProjects, getDepartmentProjects 
} from '@/api/department'
import type { Department } from '@/api/department'
import { useRouter } from 'vue-router'

const router = useRouter()

// 查询参数
const queryParams = reactive({
  keyword: ''
})

// 数据相关
const loading = ref(false)
const departmentList = ref<Department[]>([])

// 过滤后的部门列表
const filteredDepartmentList = computed(() => {
  if (!queryParams.keyword) {
    return departmentList.value
  }
  const keyword = queryParams.keyword.toLowerCase()
  return departmentList.value.filter(dept => 
    dept.name.toLowerCase().includes(keyword) || 
    dept.code.toLowerCase().includes(keyword) || 
    dept.description?.toLowerCase().includes(keyword)
  )
})

// 获取部门列表
const getList = async () => {
  try {
    loading.value = true
    const res = await getDepartmentList()
    if (res.data?.list) {
      departmentList.value = buildDepartmentTree(res.data.list)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取部门列表失败')
  } finally {
    loading.value = false
  }
}

// 构建部门树
const buildDepartmentTree = (departments: Department[]): Department[] => {
  const departmentMap = new Map<number, Department>()
  const result: Department[] = []

  // 先把所有部门放入 Map
  departments.forEach(dept => {
    const clonedDept = { ...dept }
    if (!clonedDept.children) {
      clonedDept.children = []
    }
    departmentMap.set(dept.id, clonedDept)
  })

  // 构建树形结构
  departments.forEach(dept => {
    const department = departmentMap.get(dept.id)!
    if (dept.parent_id === null) {
      // 顶级部门
      result.push(department)
    } else {
      // 子部门
      const parent = departmentMap.get(dept.parent_id)
      if (parent) {
        parent.children.push(department)
      }
    }
  })

  // 按照 sort 字段排序
  const sortDepartments = (depts: Department[]) => {
    depts.sort((a, b) => a.sort - b.sort)
    depts.forEach(dept => {
      if (dept.children && dept.children.length > 0) {
        sortDepartments(dept.children)
      }
    })
  }

  sortDepartments(result)

  return result
}

// 搜索
const handleQuery = () => {
  // 前端搜索，不需要重新请求
}

// 重置
const resetQuery = () => {
  queryParams.keyword = ''
}

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 表单数据
const formData = reactive({
  id: 0,
  name: '',
  code: '',
  parent_id: null as number | null,
  description: '',
  sort: 0
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入部门代码', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '部门代码只能包含大写字母和数字', trigger: 'blur' }
  ]
}

// 新增部门
const handleAdd = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
  formData.id = 0
  formData.name = ''
  formData.code = ''
  formData.parent_id = null
  formData.description = ''
  formData.sort = 0
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

// 监听父部门变化，自动设置排序值
watch(() => formData.parent_id, (newParentId) => {
  if (dialogType.value === 'create') {
    if (newParentId === null) {
      // 如果没有选择父部门，重置排序值
      formData.sort = 0
    } else {
      // 获取同级部门中的最大排序值
      const parent = findDepartmentById(departmentList.value, newParentId)
      if (parent && parent.children) {
        const maxSort = Math.max(0, ...parent.children.map(dept => dept.sort))
        formData.sort = maxSort + 1
      } else {
        formData.sort = 0
      }
    }
  }
})

// 根据ID查找部门
const findDepartmentById = (departments: Department[], id: number): Department | null => {
  for (const dept of departments) {
    if (dept.id === id) {
      return dept
    }
    if (dept.children) {
      const found = findDepartmentById(dept.children, id)
      if (found) {
        return found
      }
    }
  }
  return null
}

// 编辑部门
const handleEdit = (row: Department) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    parent_id: row.parent_id,
    description: row.description || '',
    sort: row.sort
  })
}

// 删除部门
const handleDelete = async (row: Department) => {
  try {
    await ElMessageBox.confirm('确定要删除该部门吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    const res = await deleteDepartment(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (dialogType.value === 'create') {
      const res = await createDepartment(formData)
      if (res.code === 200) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        getList()
      }
    } else {
      const res = await updateDepartment(formData)
      if (res.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        getList()
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 项目配置相关
const projectDialogVisible = ref(false)
const projectLoading = ref(false)
const projectSubmitLoading = ref(false)
const projectList = ref<any[]>([])
const projectTableRef = ref()
const currentDept = ref<Department | null>(null)

// 修改项目配置按钮的处理方法
const handleProjectConfig = async (row: Department) => {
  currentDept.value = row
  projectDialogVisible.value = true
  await Promise.all([
    getProjectList(),
    getDeptProjects(row.id)
  ])
}

// 获取部门的项目配置
const getDeptProjects = async (deptId: number) => {
  try {
    const res = await getDepartmentProjects(deptId)
    if (res.code === 200) {
      // 保存已配置的项目编码列表，用于设置选中状态
      const configuredProjects = new Set(res.data)
      nextTick(() => {
        projectList.value.forEach(item => {
          if (configuredProjects.has(item.project)) {
            projectTableRef.value?.toggleRowSelection(item, true)
          }
        })
      })
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取部门项目配置失败')
  }
}

// 获取项目列表
const getProjectList = async () => {
  try {
    projectLoading.value = true
    const res = await getProjectDict()
    if (res.code === 200) {
      projectList.value = res.data.map(item => ({
        id: item.id,
        project_name: item.project_name,
        project: item.project,
      }))
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取项目列表失败')
  } finally {
    projectLoading.value = false
  }
}

// 提交项目配置
const handleProjectSubmit = async () => {
  if (!currentDept.value) return
  
  try {
    projectSubmitLoading.value = true
    const selectedRows = projectTableRef.value?.getSelectionRows()
    const projectCodes = selectedRows.map(row => row.project)

    await updateDepartmentProjects(currentDept.value.id, projectCodes)
    
    ElMessage.success('配置成功')
    projectDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    projectSubmitLoading.value = false
  }
}

// 监听对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  // 重置所有表单数据
  formData.id = 0
  formData.name = ''
  formData.code = ''
  formData.parent_id = null
  formData.description = ''
  formData.sort = 0
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.department-manage {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .title {
      font-size: 20px;
      font-weight: bold;
      margin: 0;
      color: var(--el-text-color-primary);
    }
  }

  .content-card {
    margin-bottom: 20px;

    .search-bar {
      margin-bottom: 20px;

      .search-wrapper {
        display: flex;
        gap: 10px;
        align-items: center;

        .search-input {
          width: 300px;
        }
      }
    }

    // 添加操作按钮样式
    .operation-buttons {
      display: flex;
      align-items: center;
      white-space: nowrap;
      
      :deep(.el-button) {
        padding: 4px 12px;
        
        &:not(:last-child) {
          margin-right: 8px;
        }
        
        .el-icon {
          margin-right: 4px;
        }
      }
    }
  }
}

.department-form {
  padding: 20px 10px;

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  .w-full {
    width: 100%;
  }

  .el-input-number {
    width: 100%;
  }
}

:deep(.el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style> 