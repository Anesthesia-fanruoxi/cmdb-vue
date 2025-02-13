<template>
  <div class="login-log">
    <el-card>
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :default-time="['00:00:00', '23:59:59']"
            :shortcuts="dateShortcuts"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入用户名"
            clearable
            @input="handleUserSearch"
          />
        </el-form-item>
        <el-form-item label="状态" style="width: 200px">
          <el-select 
            v-model="queryParams.status" 
            placeholder="请选择状态"
            style="width: 100%"
            @change="handleQuery"
          >
            <el-option label="全部" :value="null" />
            <el-option label="登录成功" :value="1" />
            <el-option label="登录失败" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 日志表格 -->
      <el-table :data="filteredLogList" v-loading="loading" style="width: 100%">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="user.Nickname" label="昵称" width="120" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="large">
              {{ row.status === 1 ? '登录成功' : '登录失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="消息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="user.Email" label="邮箱" width="180" show-overflow-tooltip />
        <el-table-column prop="user.Phone" label="手机号" width="120" />
        <el-table-column prop="created_at" label="登录时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :pager-count="7"
          layout="sizes, prev, pager, next, jumper, ->, total"
          prev-text="上一页"
          next-text="下一页"
        >
          <template #sizes>
            <span>每页</span>
            <el-select
              v-model="queryParams.size"
              style="width: 100px; margin: 0 8px"
            >
              <el-option
                v-for="size in [10, 20, 50, 100]"
                :key="size"
                :label="`${size}条`"
                :value="size"
              />
            </el-select>
          </template>
          <template #jumper>
            <span>前往</span>
            <el-input
              v-model.number="queryParams.page"
              style="width: 50px; margin: 0 8px"
            />
            <span>页</span>
          </template>
          <template #total>
            <span>共 {{ total }} 条</span>
          </template>
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'LoginLog',
  data() {
    // 获取一周前的日期
    const endDate = new Date()
    const startDate = new Date()
    startDate.setTime(startDate.getTime() - 3600 * 1000 * 24 * 7)
    
    return {
      loading: false,
      dateRange: [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ],
      dateShortcuts: [
        {
          text: '最近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
          }
        },
        {
          text: '最近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          }
        },
        {
          text: '最近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
          }
        }
      ],
      queryParams: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: null,
        username: '',
        page: 1,
        size: 20
      },
      logList: [],
      total: 0,
      searchTimer: null
    }
  },
  computed: {
    filteredLogList() {
      if (!this.queryParams.username) {
        return this.logList
      }
      
      return this.logList.filter(item => {
        if (!item.username) return false
        const searchValue = this.queryParams.username.toLowerCase()
        const username = item.username.toLowerCase()
        
        // 1. 直接包含匹配
        if (username.includes(searchValue)) return true
        
        // 2. 字符顺序匹配（如 'zs' 匹配 'zhangsan'）
        const chars = searchValue.split('')
        let currentIndex = 0
        
        for (const char of chars) {
          const index = username.indexOf(char, currentIndex)
          if (index === -1) return false
          currentIndex = index + 1
        }
        return true
      })
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const token = localStorage.getItem('token') || ''
        
        const response = await fetch('/api/system/loginlog/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.queryParams)
        })
        
        if (!response.ok) {
          throw new Error('请求失败')
        }
        
        const data = await response.json()
        if (data.code === 200) {
          this.logList = data.data.list
          this.total = data.data.total
        } else {
          this.$message.error(data.msg || '获取日志列表失败')
        }
      } catch (error) {
        console.error('获取日志列表失败:', error)
        this.$message.error('获取日志列表失败')
      } finally {
        this.loading = false
      }
    },
    handleDateChange(dates) {
      if (dates) {
        this.queryParams.start_date = dates[0]
        this.queryParams.end_date = dates[1]
      } else {
        // 重置为默认一周
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        this.queryParams.start_date = start.toISOString().split('T')[0]
        this.queryParams.end_date = end.toISOString().split('T')[0]
        this.dateRange = [this.queryParams.start_date, this.queryParams.end_date]
      }
      this.handleQuery()
    },
    handleUserSearch(value) {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.queryParams.username = value
      }, 300)
    },
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    resetQuery() {
      // 重置为默认一周
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      
      this.dateRange = [
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      ]
      this.queryParams = {
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        status: null,
        username: '',
        page: 1,
        size: 20
      }
      this.getList()
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    }
  }
}
</script>

<style scoped>
.login-log {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.pagination :deep(.el-pagination) {
  font-size: 14px;
  display: flex;
  align-items: center;
}
.pagination :deep(.el-select .el-input) {
  margin: 0;
}
.pagination :deep(.el-input__inner) {
  text-align: center;
}
.pagination :deep(.el-pagination button) {
  min-width: 80px;
  font-size: 14px;
}
.pagination :deep(.el-pager li) {
  font-size: 14px;
}
.el-tag {
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
}
</style> 