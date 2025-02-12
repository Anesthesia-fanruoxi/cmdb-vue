import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { getProjectDict } from '@/api/department'

export interface Project {
  project: string
  project_name: string
}

export function useProjectDict() {
  const projectList = ref<Project[]>([])
  const loading = ref(false)

  const fetchProjectList = async () => {
    try {
      loading.value = true
      const userStore = useUserStore()
      const deptId = userStore.userInfo.department?.id

      if (deptId) {
        const projectRes = await getProjectDict()
        if (projectRes.code === 200) {
          projectList.value = projectRes.data.map(item => ({
            project: item.project,
            project_name: item.project_name
          }))
        }
      }
    } catch (error) {
      console.error('获取项目字典失败:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchProjectList()
  })

  return {
    projectList,
    loading,
    fetchProjectList
  }
} 