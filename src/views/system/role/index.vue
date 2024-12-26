<template>
  <div class="app-container">
    <!-- 头部标题和搜索区域 -->
    <div class="header-container">
      <h2 class="page-title">角色管理</h2>
      <div class="search-area">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入角色名称"
          clearable
          :prefix-icon="Search"
          @keyup.enter="handleQuery"
          style="width: 240px"
        />
        <el-button type="primary" :icon="Search" @click="handleQuery">
          搜索
        </el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-wrapper">
      <template #header>
        <div class="card-header">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增角色
          </el-button>
          <el-button :icon="Refresh" circle @click="getList" />
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="roleList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="code" label="角色编码" min-width="120" />
        <el-table-column
          prop="description"
          label="描述"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="created_at"
          label="创建时间"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="primary"
              :icon="Setting"
              @click="handlePermission(row)"
            >
              权限配置
            </el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item
          label="角色编码"
          prop="code"
          v-if="dialog.type === 'create'"
        >
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {
  Plus,
  Edit,
  Delete,
  Search,
  Refresh,
  Setting,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { getRoleList, createRole, updateRole, deleteRole } from "@/api/role";
import type { Role } from "@/types";

// 查询参数
const queryParams = reactive({
  keyword: "",
});

// 加载状态
const loading = ref(false);
const submitLoading = ref(false);

// 角色列表
const roleList = ref<Role[]>([]);
const total = ref(0);

// 对话框状态
const dialog = reactive({
  title: "",
  visible: false,
  type: "create", // 'create' | 'edit'
});

// 表单对象
const roleFormRef = ref<FormInstance>();
const roleForm = reactive({
  id: undefined as number | undefined,
  name: "",
  code: "",
  description: "",
});

// 表单校验规则
const rules = {
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
};

// 查询角色列表
const getList = async () => {
  try {
    loading.value = true;
    const res = await getRoleList(queryParams);
    if (res.code === 200) {
      roleList.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (error: any) {
    ElMessage.error(error.message || "获取角色列表失败");
  } finally {
    loading.value = false;
  }
};

// 查询按钮
const handleQuery = () => {
  getList();
};

// 重置按钮
const resetQuery = () => {
  queryParams.keyword = "";
  handleQuery();
};

// 新增按钮
const handleAdd = () => {
  dialog.type = "create";
  dialog.title = "新增角色";
  dialog.visible = true;
};

// 编辑按钮
const handleEdit = (row: Role) => {
  dialog.type = "edit";
  dialog.title = "编辑角色";
  dialog.visible = true;
  Object.assign(roleForm, row);
};

// 删除按钮
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm("确认要删除该角色吗？", "警告", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });

    const res = await deleteRole(row.id);
    if (res.code === 200) {
      ElMessage.success("删除成功");
      getList();
    }
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

// 重置表单
const resetForm = () => {
  roleForm.id = undefined;
  roleForm.name = "";
  roleForm.code = "";
  roleForm.description = "";
  roleFormRef.value?.resetFields();
};

// 提交表单
const submitForm = async () => {
  if (!roleFormRef.value) return;

  try {
    await roleFormRef.value.validate();

    if (dialog.type === "create") {
      const res = await createRole({
        name: roleForm.name,
        code: roleForm.code,
        description: roleForm.description,
      });
      if (res.code === 200) {
        ElMessage.success("创建成功");
        dialog.visible = false;
        getList();
      }
    } else {
      const res = await updateRole({
        id: roleForm.id!,
        name: roleForm.name,
        code: roleForm.code,
        description: roleForm.description,
      });
      if (res.code === 200) {
        ElMessage.success("更新成功");
        dialog.visible = false;
        getList();
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || "保存失败");
  }
};

// 权限配置按钮
const handlePermission = (row: Role) => {
  // TODO: 实现权限配置功能
  console.log("配置权限:", row);
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      font-size: 20px;
      font-weight: bold;
      margin: 0;
      color: #303133;
    }

    .search-area {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  }

  .table-wrapper {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

:deep(.el-card__header) {
  padding: 10px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

.el-form-item {
  margin-bottom: 18px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
