<template>
  <div class="app-container">
    <div class="header-container">
      <h2 class="page-title">{{ pageTitle }}</h2>
    </div>

    <el-card class="table-wrapper">
      <template #header>
        <div class="card-header">
          <span>项目列表</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="projectList"
        row-key="id"
        border
        stripe
        ref="tableRef"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="project_name" label="项目名称" width="180" />
        <el-table-column prop="project" label="项目编码" width="120" />
      </el-table>

      <div class="table-footer">
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          保存配置
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from 'vue-router';
import { getProjectDict } from '@/api/project-dict'
import { getDepartmentProjects, updateDepartmentProjects } from '@/api/department'

// 加载状态
const loading = ref(false);
const submitLoading = ref(false);

// 项目列表
const projectList = ref<any[]>([]);
const tableRef = ref();

const route = useRoute();
const deptId = route.query.deptId as string;
const deptName = route.query.deptName as string;

// 修改标题显示
const pageTitle = `${deptName || ''} - 项目配置`;

// 获取项目列表
const getList = async () => {
  if (!deptId) return;
  
  try {
    loading.value = true;
    // 先获取部门的项目列表
    const deptProjectRes = await getDepartmentProjects(Number(deptId));
    let projects: string[] = [];
    if (deptProjectRes.code === 200) {
      projects = deptProjectRes.data;
    }
    
    // 获取所有项目
    const projectRes = await getProjectDict(projects);
    if (projectRes.code === 200) {
      projectList.value = projectRes.data;
      
      // 设置选中状态
      nextTick(() => {
        projectList.value.forEach(item => {
          if (projects.includes(item.project)) {
            tableRef.value?.toggleRowSelection(item, true);
          }
        });
      });
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取项目列表失败');
  } finally {
    loading.value = false;
  }
};

// 提交配置
const handleSubmit = async () => {
  try {
    submitLoading.value = true;
    const selectedRows = tableRef.value?.getSelectionRows();
    const projectCodes = selectedRows.map(row => row.project);

    await updateDepartmentProjects(Number(deptId), projectCodes);
    ElMessage.success('配置成功');
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  } finally {
    submitLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .header-container {
    margin-bottom: 20px;

    .page-title {
      font-size: 20px;
      font-weight: bold;
      margin: 0;
      color: #303133;
    }
  }

  .table-wrapper {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-footer {
      margin-top: 20px;
      text-align: center;
    }
  }
}
</style> 