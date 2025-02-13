<template>
  <div class="personal-space">
    <el-container>
      <el-aside width="250px" class="sidebar">
        <!-- 顶部区域 -->
        <div class="top-section">
          <!-- 左侧标题 -->
          <div class="title-area">
            <h2 class="doc-title">个人文档</h2>
          </div>
          <!-- 右侧区域：上下布局 -->
          <div class="right-area">
            <div class="top-buttons">
              <el-switch
                v-model="isPersonal"
                inline-prompt
                style="--el-switch-on-color: #409EFF"
                active-text="个人"
                inactive-text="全部"
                @change="handleViewModeChange"
              />
            </div>
            <div class="bottom-buttons">
              <el-button 
                type="primary" 
                size="small"
                @click="handleCreateDoc"
              >
                + 新建文档
              </el-button>
            </div>
          </div>
        </div>

        <!-- 文档列表 -->
        <el-menu
          :default-active="activeDoc ? String(activeDoc.id) : ''"
          class="doc-list"
        >
          <el-menu-item
            v-for="doc in documents"
            :key="doc.id"
            :index="String(doc.id)"
            @click="handleDocSelect(doc)"
          >
            <div class="menu-item-content">
              <span class="doc-title">{{ doc.title }}</span>
            </div>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main class="main-content">
        <template v-if="isEditing">
          <div class="editor-container">
            <div class="editor-section">
              <el-input
                v-model="editingDoc.title"
                placeholder="请输入标题"
                class="title-input"
              />
              <el-input
                v-model="editingDoc.content"
                type="textarea"
                :rows="20"
                placeholder="请输入文档内容（支持 Markdown 格式）"
              />
              <div class="editor-actions">
                <el-button @click="cancelEdit">取消</el-button>
                <el-button type="primary" @click="saveDoc">保存</el-button>
              </div>
            </div>
            <div class="preview-section">
              <div class="preview-title">预览</div>
              <div class="markdown-body" v-html="parsedContent"></div>
            </div>
          </div>
        </template>
        <template v-else-if="activeDoc">
          <div class="doc-header">
            <div class="doc-info">
              <h2>{{ activeDoc.title }}</h2>
              <div class="doc-meta">
                <span>作者：{{ activeDoc.author }}</span>
                <span>更新时间：{{ formatDate(activeDoc.updated_at) }}</span>
              </div>
            </div>
            <div class="doc-actions">
              <el-button-group>
                <el-button type="primary" @click="startEdit(activeDoc)">
                  <el-icon><EditIcon /></el-icon>
                  编辑
                </el-button>
                <el-button type="danger" @click="deleteDoc(activeDoc)">
                  <el-icon><DeleteIcon /></el-icon>
                  删除
                </el-button>
              </el-button-group>
            </div>
          </div>
          <div class="markdown-body" v-html="parsedContent"></div>
        </template>
        <div v-else class="placeholder">
          请选择一个文档查看或点击新建文档
        </div>
      </el-main>
    </el-container>

    <!-- 新建文档对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建文档"
      width="30%"
    >
      <el-form :model="newDoc" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="newDoc.title" placeholder="请输入文档标题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createDoc">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
// 暂时移除 user store
// import { useUserStore } from '@/stores/user'
import { parseMarkdown } from '@/utils/markdown'
// 导入需要的图标
import {
  Plus,
  More,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@element-plus/icons-vue'

export default {
  name: 'PersonalSpace',
  // 注册图标组件
  components: {
    Plus,
    More,
    EditIcon,
    DeleteIcon
  },
  setup() {
    // const userStore = useUserStore()
    const documents = ref([])
    const activeDoc = ref(null)
    const isEditing = ref(false)
    const editingDoc = ref(null)
    const showCreateDialog = ref(false)
    const newDoc = ref({ title: '' })
    const viewMode = ref('personal')
    const isPersonal = ref(true)

    // 临时使用一个简单的判断
    const isAdmin = computed(() => {
      // 这里可以从 localStorage 或其他地方获取用户角色
      return true // 暂时都显示为管理员
    })

    const parsedContent = computed(() => {
      const content = isEditing.value ? editingDoc.value?.content : activeDoc.value?.content
      return parseMarkdown(content || '')
    })

    const handleViewModeChange = (val) => {
      viewMode.value = val ? 'personal' : 'all'
      fetchDocuments()
    }

    // 定义 fetchDocuments 函数
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/knowledge/personal/list?mode=${viewMode.value}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (!response.ok) throw new Error('获取文档失败')
        const data = await response.json()
        if (data.code === 200 && data.data) {
          documents.value = data.data.list.map(doc => ({
            id: doc.id,
            title: doc.title,
            content: doc.content,
            author: doc.user?.Nickname || doc.user?.Username || '未知用户',
            user_id: doc.user_id,
            created_at: doc.created_at,
            updated_at: doc.updated_at
          }))
        } else {
          throw new Error(data.msg || '获取文档失败')
        }
      } catch (error) {
        console.error('获取文档列表失败:', error)
        ElMessage.error('获取文档列表失败')
      }
    }

    return {
      documents,
      activeDoc,
      isEditing,
      editingDoc,
      showCreateDialog,
      newDoc,
      viewMode,
      isAdmin,
      parsedContent,
      isPersonal,
      handleViewModeChange,
      fetchDocuments
    }
  },
  created() {
    this.fetchDocuments()
  },
  methods: {
    handleDocSelect(doc) {
      this.activeDoc = doc
      this.isEditing = false
    },
    handleCreateDoc() {
      this.showCreateDialog = true
      this.newDoc = { title: '' }
    },
    async createDoc() {
      try {
        const response = await fetch('/api/knowledge/personal/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.newDoc)
        })
        if (!response.ok) throw new Error('创建文档失败')
        this.showCreateDialog = false
        this.fetchDocuments()
        this.$message.success('创建成功')
      } catch (error) {
        console.error('创建文档失败:', error)
        this.$message.error('创建文档失败')
      }
    },
    canEdit(doc) {
      // 从 localStorage 获取用户信息
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      // 如果是管理员(roleId === 1)或文档所有者，则可以编辑
      return userInfo.roleId === 1 || doc.user_id === userInfo.id
    },
    startEdit(doc) {
      this.editingDoc = { ...doc }
      this.isEditing = true
    },
    cancelEdit() {
      this.isEditing = false
      this.editingDoc = null
    },
    async saveDoc() {
      try {
        const updateData = {
          id: this.editingDoc.id,
          title: this.editingDoc.title,
          content: this.editingDoc.content
        }

        const response = await fetch(`/api/knowledge/personal/update`, {
          method: 'POST', // 后端使用 POST 方法
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(updateData)
        })

        const data = await response.json()
        if (data.code === 200) {
          this.isEditing = false
          this.fetchDocuments()
          this.$message.success('保存成功')
        } else {
          throw new Error(data.msg || '保存文档失败')
        }
      } catch (error) {
        console.error('保存文档失败:', error)
        this.$message.error(error.message || '保存文档失败')
      }
    },
    async deleteDoc(doc) {
      try {
        await this.$confirm('确认删除该文档吗？删除后可在回收站恢复', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/knowledge/personal/delete`, {
          method: 'POST', // 后端使用 POST 方法
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ id: doc.id })
        })

        const data = await response.json()
        if (data.code === 200) {
          this.fetchDocuments()
          if (this.activeDoc?.id === doc.id) {
            this.activeDoc = null
          }
          this.$message.success('删除成功')
        } else {
          throw new Error(data.msg || '删除文档失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除文档失败:', error)
          this.$message.error(error.message || '删除文档失败')
        }
      }
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.personal-space {
  height: 100%;
}

.el-container {
  height: 100%;
}

.sidebar {
  border-right: 1px solid #e6e6e6;
  background: #fff;
}

.top-section {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.title-area {
  flex: 1;
  display: flex;
  align-items: center;
}

.doc-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.right-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

.top-buttons,
.bottom-buttons {
  display: flex;
  justify-content: flex-end;
}

/* 调整 switch 组件的样式 */
:deep(.el-switch) {
  --el-switch-on-color: #409EFF;
  --el-switch-off-color: #409EFF;
}

:deep(.el-switch__label) {
  color: #fff;
}

.doc-list {
  border-right: none;
}

.doc-list .el-menu-item {
  padding: 0 16px;
  height: 40px;
}

.menu-item-content {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.doc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-actions {
  margin-left: 16px;
}

.doc-actions .el-button {
  display: inline-flex;
  align-items: center;
}

.doc-actions .el-icon {
  margin-right: 4px;
}

.main-content {
  padding: 20px;
  background: #fff;
}

.editor-container {
  display: flex;
  gap: 20px;
  height: 100%;
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-section {
  flex: 1;
  border-left: 1px solid #e6e6e6;
  padding-left: 20px;
}

.title-input {
  margin-bottom: 16px;
}

.editor-actions {
  margin-top: 16px;
  text-align: right;
}

.preview-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
}

.markdown-preview {
  padding: 16px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  min-height: 200px;
}

.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fff;
}

.doc-info {
  flex: 1;
}

.doc-info h2 {
  margin: 0 0 8px 0;
}

.doc-meta {
  color: #666;
  font-size: 14px;
}

.doc-meta span {
  margin-right: 16px;
}

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

/* 引入 GitHub Markdown 样式 */
@import 'highlight.js/styles/github.css';
</style> 