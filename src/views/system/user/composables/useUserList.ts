import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserList } from '@/api/user'
import type { UserQueryParams } from '@/api/user'
import type { TableUser } from '../types'

export function useUserList() {
  const tableData = ref<TableUser[]>([])
  const total = ref(0)
  const loading = ref(false)

  const queryParams = reactive<UserQueryParams>({
    username: '',
    name: '',
    phone: '',
    email: '',
    status: '',
    pageNum: 1,
    pageSize: 10
  })

  const getList = async () => {
    try {
      loading.value = true
      const res = await getUserList(queryParams)
      if (res.data) {
        tableData.value = res.data.list.map(user => ({
          ...user,
          name: user.nickname,
          status: user.is_enabled ? 'enabled' : 'disabled'
        }))
        total.value = res.data.total
      }
    } catch (error: any) {
      ElMessage.error(error.message || '获取用户列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (val: number) => {
    queryParams.pageSize = val
    getList()
  }

  const handleCurrentChange = (val: number) => {
    queryParams.pageNum = val
    getList()
  }

  return {
    tableData,
    total,
    loading,
    queryParams,
    getList,
    handleSizeChange,
    handleCurrentChange
  }
} 