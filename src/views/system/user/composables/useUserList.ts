import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserList } from '@/api/user'
import type { UserQueryParams, UserListItem } from '@/api/user'
import type { TableUser } from '../types'

export function useUserList() {
  const loading = ref(false)
  const total = ref(0)
  const allUserList = ref<UserListItem[]>([])
  
  // 查询参数
  const queryParams = reactive<UserQueryParams>({
    username: '',
    name: '',
    phone: '',
    email: '',
    status: '',
    dept_id: undefined
  })

  // 检查字符串是否匹配模糊搜索
  const fuzzyMatch = (source: string, search: string): boolean => {
    if (!search) return true
    
    // 将两个字符串都转为小写并移除空格
    const cleanSource = source.toLowerCase().replace(/\s/g, '')
    const cleanSearch = search.toLowerCase().replace(/\s/g, '')
    
    let sourceIndex = 0
    let searchIndex = 0
    
    // 逐个匹配搜索字符
    while (sourceIndex < cleanSource.length && searchIndex < cleanSearch.length) {
      if (cleanSource[sourceIndex] === cleanSearch[searchIndex]) {
        searchIndex++
      }
      sourceIndex++
    }
    
    // 如果所有搜索字符都匹配到了，返回true
    return searchIndex === cleanSearch.length
  }

  // 将 tableData 改为计算属性，实现实时搜索
  const tableData = computed(() => {
    return allUserList.value
      .filter(user => {
        // 使用新的模糊匹配函数
        const usernameMatch = fuzzyMatch(user.username, queryParams.username)

        // 部门筛选
        const deptMatch = !queryParams.dept_id || 
          user.department?.id === queryParams.dept_id

        // 状态筛选
        const statusMatch = !queryParams.status || 
          (queryParams.status === 'enabled' ? user.is_enabled : !user.is_enabled)

        return usernameMatch && deptMatch && statusMatch
      })
      .map(user => ({
        ...user,
        name: user.nickname,
        status: user.is_enabled ? 'enabled' : 'disabled'
      }))
      .sort((a, b) => {
        // 首先按角色排序：管理员 > 主管 > 普通用户
        const roleOrder = {
          admin: 1,
          supervisor: 2,
          normal: 3
        }
        const roleCompare = (roleOrder[a.role.code] || 999) - (roleOrder[b.role.code] || 999)
        if (roleCompare !== 0) return roleCompare

        // 然后按部门排序
        if (a.department?.code !== b.department?.code) {
          return (a.department?.code || '').localeCompare(b.department?.code || '')
        }

        // 最后按创建时间降序
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  })

  // 获取用户列表
  const getList = async () => {
    try {
      loading.value = true
      const res = await getUserList({} as UserQueryParams) // 获取所有数据
      if (res.data) {
        allUserList.value = res.data.list
        total.value = allUserList.value.length
      }
    } catch (error: any) {
      ElMessage.error(error.message || '获取用户列表失败')
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    total,
    tableData,  // 现在是计算属性，会随着 queryParams 的变化自动更新
    queryParams,
    getList
  }
} 