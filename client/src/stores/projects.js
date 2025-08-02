import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '../utils/axios'
import { showNotification } from '../utils/notification'

export const useProjectsStore = defineStore('projects', () => {
  // 状态
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const statsLoading = ref(false)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const filters = ref({
    status: '',
    priority: '',
    search: ''
  })
  
  // 统计数据状态（从后端获取的真实统计数据）
  const stats = ref({
    totalProjects: 0,
    avgProgress: 0,
    statusCounts: {
      idea: 0,
      planning: 0,
      development: 0,
      testing: 0,
      deployed: 0,
      completed: 0,
      paused: 0
    },
    priorityCounts: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    activeProjects: 0,
    completionRate: 0,
    updatedAt: null
  })
  
  // 计算属性（使用真实统计数据）
  const statusCounts = computed(() => stats.value.statusCounts)
  const totalProgress = computed(() => stats.value.avgProgress)
  
  // 获取项目列表
  const fetchProjects = async (params = {}) => {
    try {
      loading.value = true
      const query = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...filters.value,
        ...params
      }
      
      // 移除空值
      Object.keys(query).forEach(key => {
        if (!query[key]) delete query[key]
      })
      
      const response = await axios.get('/api/projects', { params: query })
      projects.value = response.data.projects
      pagination.value = response.data.pagination
      
      return response.data
    } catch (error) {
      console.error('获取项目列表失败:', error)
      showNotification.error('获取项目列表失败')
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 获取项目详情
  const fetchProject = async (id) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/projects/${id}`)
      currentProject.value = response.data
      return response.data
    } catch (error) {
      console.error('获取项目详情失败:', error)
      showNotification.error('获取项目详情失败')
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 创建项目
  const createProject = async (projectData) => {
    try {
      loading.value = true
      const response = await axios.post('/api/projects', projectData)
      showNotification.success('项目创建成功')
      await fetchProjects()
      return response.data.project
    } catch (error) {
      console.error('创建项目失败:', error)
      showNotification.error(error.response?.data?.message || '创建项目失败')
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 更新项目
  const updateProject = async (id, projectData) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/projects/${id}`, projectData)
      showNotification.success('项目更新成功')
      
      // 更新本地数据
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = response.data.project
      }
      if (currentProject.value?.id === id) {
        currentProject.value = response.data.project
      }
      
      return response.data.project
    } catch (error) {
      console.error('更新项目失败:', error)
      showNotification.error(error.response?.data?.message || '更新项目失败')
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 删除项目
  const deleteProject = async (id) => {
    try {
      loading.value = true
      await axios.delete(`/api/projects/${id}`)
      showNotification.success('项目删除成功')
      
      // 从本地数据中移除
      projects.value = projects.value.filter(p => p.id !== id)
      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
      
      return true
    } catch (error) {
      console.error('删除项目失败:', error)
      showNotification.error(error.response?.data?.message || '删除项目失败')
      return false
    } finally {
      loading.value = false
    }
  }
  
  // 更新项目排序
  const updateProjectsOrder = async (projectsOrder) => {
    try {
      await axios.put('/api/projects/reorder/batch', { projects: projectsOrder })
      showNotification.success('排序更新成功')
      await fetchProjects()
      return true
    } catch (error) {
      console.error('更新排序失败:', error)
      showNotification.error('更新排序失败')
      return false
    }
  }
  
  // 设置筛选条件
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
  }
  
  // 设置分页
  const setPagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }
  
  // 重置筛选条件
  const resetFilters = () => {
    filters.value = {
      status: '',
      priority: '',
      search: ''
    }
    pagination.value.page = 1
  }
  
  // 获取统计数据
  const fetchStats = async () => {
    try {
      statsLoading.value = true
      console.log('📊 获取项目统计数据...')
      
      const response = await axios.get('/api/projects/stats')
      stats.value = response.data
      
      console.log('✅ 统计数据获取成功:', {
        totalProjects: stats.value.totalProjects,
        avgProgress: stats.value.avgProgress,
        completed: stats.value.statusCounts.completed,
        development: stats.value.statusCounts.development
      })
      
      return response.data
    } catch (error) {
      console.error('获取统计数据失败:', error)
      showNotification.error('获取统计数据失败')
      return null
    } finally {
      statsLoading.value = false
    }
  }
  
  return {
    // 状态
    projects,
    currentProject,
    loading,
    statsLoading,
    pagination,
    filters,
    stats,
    
    // 计算属性
    statusCounts,
    totalProgress,
    
    // 方法
    fetchProjects,
    fetchProject,
    fetchStats,
    createProject,
    updateProject,
    deleteProject,
    updateProjectsOrder,
    setFilters,
    setPagination,
    resetFilters
  }
}) 