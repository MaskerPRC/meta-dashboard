<template>
  <div class="admin-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">管理后台</h1>
          <p class="page-subtitle">AI项目看板管理中心</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateProject = true">
            <el-icon><Plus /></el-icon>
            新建项目
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card ai-card">
            <div class="stat-icon projects">
              <el-icon size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalProjects }}</div>
              <div class="stat-label">总项目数</div>
            </div>
          </div>
          
          <div class="stat-card ai-card">
            <div class="stat-icon users">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">注册用户</div>
            </div>
          </div>
          
          <div class="stat-card ai-card">
            <div class="stat-icon comments">
              <el-icon size="32"><ChatDotSquare /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalComments }}</div>
              <div class="stat-label">评论总数</div>
            </div>
          </div>
          
                     <div class="stat-card ai-card">
             <div class="stat-icon progress">
               <el-icon size="32"><ArrowUp /></el-icon>
             </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.avgProgress }}%</div>
              <div class="stat-label">平均进度</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-layout">
        <div class="main-content">
          <!-- 标签页 -->
          <el-tabs v-model="activeTab" class="admin-tabs">
            <!-- 项目管理 -->
            <el-tab-pane label="项目管理" name="projects">
              <div class="tab-content">
                <!-- 项目操作工具栏 -->
                <div class="projects-toolbar">
                  <div class="toolbar-left">
                    <el-input
                      v-model="projectSearch"
                      placeholder="搜索项目..."
                      style="width: 300px"
                      clearable
                      @input="handleProjectSearch"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                    
                    <el-select
                      v-model="projectStatusFilter"
                      placeholder="状态筛选"
                      clearable
                      style="width: 140px"
                      @change="handleProjectFilter"
                    >
                      <el-option label="构思中" value="idea" />
                      <el-option label="规划中" value="planning" />
                      <el-option label="开发中" value="development" />
                      <el-option label="测试中" value="testing" />
                      <el-option label="已部署" value="deployed" />
                      <el-option label="已完成" value="completed" />
                      <el-option label="暂停中" value="paused" />
                    </el-select>
                  </div>
                  
                  <div class="toolbar-right">
                    <el-button @click="exportProjects">
                      <el-icon><Download /></el-icon>
                      导出数据
                    </el-button>
                    <el-button type="danger" @click="handleBatchDelete">
                      <el-icon><Delete /></el-icon>
                      批量删除
                    </el-button>
                  </div>
                </div>

                <!-- 项目表格 -->
                <div class="projects-table-container">
                  <el-table
                    ref="projectsTableRef"
                    :data="filteredProjects"
                    style="width: 100%"
                    @selection-change="handleProjectSelectionChange"
                    v-loading="projectsLoading"
                    empty-text="暂无项目数据"
                  >
                    <el-table-column type="selection" width="55" />
                    
                    <el-table-column prop="id" label="ID" width="80" />
                    
                    <el-table-column prop="title" label="项目名称" min-width="200">
                      <template #default="scope">
                        <div class="project-title-cell">
                          <el-link @click="editProject(scope.row)" type="primary">
                            {{ scope.row.title }}
                          </el-link>
                          <p class="project-desc">{{ scope.row.description }}</p>
                        </div>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="status" label="状态" width="100">
                      <template #default="scope">
                        <el-tag :class="['status-tag', scope.row.status]" size="small">
                          {{ getStatusName(scope.row.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="priority" label="优先级" width="100">
                      <template #default="scope">
                        <el-tag :class="['priority-tag', scope.row.priority]" size="small">
                          {{ getPriorityName(scope.row.priority) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="progress" label="进度" width="120">
                      <template #default="scope">
                        <el-progress 
                          :percentage="scope.row.progress" 
                          :stroke-width="6"
                          :show-text="true"
                          :format="(percentage) => `${percentage}%`"
                        />
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="created_at" label="创建时间" width="120">
                      <template #default="scope">
                        {{ formatDate(scope.row.created_at) }}
                      </template>
                    </el-table-column>
                    
                    <el-table-column label="操作" width="200">
                      <template #default="scope">
                        <el-button size="small" @click="editProject(scope.row)">
                          编辑
                        </el-button>
                        <el-button size="small" @click="viewProject(scope.row.id)">
                          查看
                        </el-button>
                        <el-button 
                          size="small" 
                          type="danger" 
                          @click="deleteProject(scope.row)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-tab-pane>

            <!-- 用户管理 -->
            <el-tab-pane label="用户管理" name="users">
              <div class="tab-content">
                <div class="users-toolbar">
                  <el-input
                    v-model="userSearch"
                    placeholder="搜索用户..."
                    style="width: 300px"
                    clearable
                    @input="handleUserSearch"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>

                <div class="users-table-container">
                  <el-table
                    :data="filteredUsers"
                    style="width: 100%"
                    v-loading="usersLoading"
                    empty-text="暂无用户数据"
                  >
                    <el-table-column prop="id" label="ID" width="80" />
                    
                    <el-table-column prop="avatar_url" label="头像" width="80">
                      <template #default="scope">
                        <el-avatar :src="scope.row.avatar_url" :size="40">
                          <el-icon><User /></el-icon>
                        </el-avatar>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="username" label="用户名" min-width="150" />
                    
                    <el-table-column prop="display_name" label="显示名称" min-width="150" />
                    
                    <el-table-column prop="email" label="邮箱" min-width="200" />
                    
                    <el-table-column prop="provider" label="登录方式" width="100">
                      <template #default="scope">
                        <el-tag size="small">{{ scope.row.provider }}</el-tag>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="is_admin" label="管理员" width="80">
                      <template #default="scope">
                        <el-switch
                          v-model="scope.row.is_admin"
                          @change="updateUserAdmin(scope.row)"
                          :disabled="scope.row.id === authStore.user?.id"
                        />
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="created_at" label="注册时间" width="120">
                      <template #default="scope">
                        {{ formatDate(scope.row.created_at) }}
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-tab-pane>

            <!-- 评论管理 -->
            <el-tab-pane label="评论管理" name="comments">
              <div class="tab-content">
                <div class="comments-table-container">
                  <el-table
                    :data="comments"
                    style="width: 100%"
                    v-loading="commentsLoading"
                    empty-text="暂无评论数据"
                  >
                    <el-table-column prop="id" label="ID" width="80" />
                    
                    <el-table-column prop="project.title" label="项目" min-width="150">
                      <template #default="scope">
                        <el-link @click="viewProject(scope.row.project.id)" type="primary">
                          {{ scope.row.project.title }}
                        </el-link>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="user.username" label="用户" width="120" />
                    
                    <el-table-column prop="content" label="评论内容" min-width="300">
                      <template #default="scope">
                        <div class="comment-content">
                          {{ scope.row.content }}
                        </div>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="created_at" label="发布时间" width="120">
                      <template #default="scope">
                        {{ formatDateTime(scope.row.created_at) }}
                      </template>
                    </el-table-column>
                    
                    <el-table-column label="操作" width="100">
                      <template #default="scope">
                        <el-button 
                          size="small" 
                          type="danger" 
                          @click="deleteComment(scope.row)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 项目编辑/创建对话框 -->
    <ProjectEditDialog
      v-model="showCreateProject"
      :project="editingProject"
      @saved="handleProjectSaved"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectEditDialog from '../components/admin/ProjectEditDialog.vue'
import axios from '../utils/axios'
import dayjs from 'dayjs'
import {
  Plus, Document, User, ChatDotSquare, ArrowUp,
  Search, Download, Delete
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('projects')
const showCreateProject = ref(false)
const editingProject = ref(null)

// 统计数据
const stats = reactive({
  totalProjects: 0,
  totalUsers: 0,
  totalComments: 0,
  avgProgress: 0
})

// 项目管理
const projects = ref([])
const projectsLoading = ref(false)
const projectSearch = ref('')
const projectStatusFilter = ref('')
const selectedProjects = ref([])

// 用户管理
const users = ref([])
const usersLoading = ref(false)
const userSearch = ref('')
const isLoadingUsers = ref(false) // 标记是否正在加载用户数据

// 评论管理
const comments = ref([])
const commentsLoading = ref(false)

// 计算属性
const filteredProjects = computed(() => {
  let filtered = projects.value
  
  if (projectSearch.value) {
    const search = projectSearch.value.toLowerCase()
    filtered = filtered.filter(project => 
      project.title.toLowerCase().includes(search) ||
      project.description.toLowerCase().includes(search)
    )
  }
  
  if (projectStatusFilter.value) {
    filtered = filtered.filter(project => project.status === projectStatusFilter.value)
  }
  
  return filtered
})

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  
  const search = userSearch.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(search) ||
    user.display_name?.toLowerCase().includes(search) ||
    user.email?.toLowerCase().includes(search)
  )
})

// 方法
const fetchStats = async () => {
  try {
    const response = await axios.get('/api/admin/stats')
    Object.assign(stats, response.data)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchProjects = async () => {
  try {
    projectsLoading.value = true
    const response = await axios.get('/api/projects', {
      params: { limit: 1000 }
    })
    projects.value = response.data.projects
  } catch (error) {
    console.error('获取项目列表失败:', error)
    ElMessage.error('获取项目列表失败')
  } finally {
    projectsLoading.value = false
  }
}

const fetchUsers = async () => {
  try {
    usersLoading.value = true
    isLoadingUsers.value = true // 设置加载标记
    const response = await axios.get('/api/admin/users')
    
    // 确保is_admin字段为布尔值（兼容性处理）
    users.value = response.data.users.map(user => ({
      ...user,
      is_admin: Boolean(user.is_admin)
    }))
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    usersLoading.value = false
    // 延迟重置标记，确保数据已完全加载并渲染
    setTimeout(() => {
      isLoadingUsers.value = false
    }, 100)
  }
}

const fetchComments = async () => {
  try {
    commentsLoading.value = true
    const response = await axios.get('/api/admin/comments')
    comments.value = response.data.comments
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
  } finally {
    commentsLoading.value = false
  }
}

const handleProjectSearch = () => {
  // 搜索逻辑在计算属性中处理
}

const handleProjectFilter = () => {
  // 筛选逻辑在计算属性中处理
}

const handleUserSearch = () => {
  // 搜索逻辑在计算属性中处理
}

const handleProjectSelectionChange = (selection) => {
  selectedProjects.value = selection
}

const editProject = async (project = null) => {
  if (project) {
    try {
      // 获取完整的项目数据（包含详细内容）
      const response = await axios.get(`/api/projects/${project.id}`)
      editingProject.value = response.data
    } catch (error) {
      console.error('获取项目详情失败:', error)
      ElMessage.error('获取项目详情失败，请重试')
      return
    }
  } else {
    editingProject.value = null
  }
  showCreateProject.value = true
}

const viewProject = (id) => {
  router.push(`/project/${id}`)
}

const deleteProject = async (project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.title}" 吗？此操作不可恢复。`,
      '删除项目',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await axios.delete(`/api/projects/${project.id}`)
    
    // 从列表中移除项目
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value.splice(index, 1)
    }
    
    ElMessage.success('项目删除成功')
    await fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error)
      ElMessage.error(error.response?.data?.message || '删除项目失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedProjects.value.length === 0) {
    ElMessage.warning('请选择要删除的项目')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedProjects.value.length} 个项目吗？此操作不可恢复。`,
      '批量删除项目',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    const projectIds = selectedProjects.value.map(p => p.id)
    await axios.delete('/api/admin/projects/batch', { 
      data: { ids: projectIds }
    })
    
    // 从列表中移除已删除的项目
    projects.value = projects.value.filter(p => !projectIds.includes(p.id))
    selectedProjects.value = []
    
    ElMessage.success('批量删除成功')
    await fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }
}

const exportProjects = async () => {
  try {
    const response = await axios.get('/api/admin/export/projects', {
      responseType: 'blob'
    })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `projects_export_${dayjs().format('YYYY-MM-DD')}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败')
  }
}

const updateUserAdmin = async (user) => {
  // 如果正在加载用户数据，不执行更新操作
  if (isLoadingUsers.value) {
    return
  }
  
  try {
    await axios.put(`/api/admin/users/${user.id}/admin`, {
      is_admin: user.is_admin
    })
    
    ElMessage.success(`${user.is_admin ? '授予' : '取消'}管理员权限成功`)
  } catch (error) {
    console.error('更新用户权限失败:', error)
    ElMessage.error('更新用户权限失败')
    // 恢复原值
    user.is_admin = !user.is_admin
  }
}

const deleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？此操作不可恢复。',
      '删除评论',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await axios.delete(`/api/admin/comments/${comment.id}`)
    
    // 从列表中移除评论
    const index = comments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      comments.value.splice(index, 1)
    }
    
    ElMessage.success('评论删除成功')
    await fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error(error.response?.data?.message || '删除评论失败')
    }
  }
}

const handleProjectSaved = async (project) => {
  if (editingProject.value) {
    // 更新现有项目
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = { ...project }
    }
  } else {
    // 添加新项目
    projects.value.unshift(project)
  }
  
  showCreateProject.value = false
  editingProject.value = null
  await fetchStats()
}

const getStatusName = (status) => {
  const names = {
    idea: '构思中',
    planning: '规划中',
    development: '开发中',
    testing: '测试中',
    deployed: '已部署',
    completed: '已完成',
    paused: '暂停中'
  }
  return names[status] || '未知'
}

const getPriorityName = (priority) => {
  const names = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急'
  }
  return names[priority] || '中'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 生命周期
onMounted(async () => {
  // 获取数据
  await Promise.all([
    fetchStats(),
    fetchProjects(),
    fetchUsers(),
    fetchComments()
  ])
  
  // 检查是否有编辑项目的查询参数
  if (route.query.edit) {
    const projectId = parseInt(route.query.edit)
    await nextTick()
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      await editProject(project)
    }
  }
})
</script>

<style lang="scss" scoped>
.admin-page {
  min-height: calc(100vh - 70px);
  background: var(--ai-bg-secondary);
  
  .container {
    padding: 40px 20px;
    max-width: 1400px;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    
    .header-content {
      .page-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 8px;
        color: var(--ai-text-primary);
      }
      
      .page-subtitle {
        font-size: 1.125rem;
        color: var(--ai-text-secondary);
        margin: 0;
      }
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      
      .page-title {
        font-size: 2rem !important;
      }
    }
  }
  
  .stats-section {
    margin-bottom: 32px;
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      
      .stat-card {
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.projects {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
          }
          
          &.users {
            background: linear-gradient(135deg, #f093fb, #f5576c);
            color: white;
          }
          
          &.comments {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            color: white;
          }
          
          &.progress {
            background: linear-gradient(135deg, #43e97b, #38f9d7);
            color: white;
          }
        }
        
        .stat-info {
          .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--ai-text-primary);
            line-height: 1;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 0.875rem;
            color: var(--ai-text-secondary);
          }
        }
      }
    }
  }
  
  .content-layout {
    .main-content {
      .admin-tabs {
        background: var(--ai-bg-primary);
        border-radius: 12px;
        padding: 24px;
        border: 1px solid var(--ai-border);
        
        .tab-content {
          margin-top: 20px;
        }
      }
    }
  }
  
  .projects-toolbar,
  .users-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .toolbar-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .toolbar-right {
      display: flex;
      gap: 12px;
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 12px;
      
      .toolbar-left,
      .toolbar-right {
        width: 100%;
        justify-content: center;
      }
    }
  }
  
  .projects-table-container,
  .users-table-container,
  .comments-table-container {
    background: var(--ai-bg-primary);
    border-radius: 8px;
    overflow: hidden;
    
    .project-title-cell {
      .project-desc {
        font-size: 0.875rem;
        color: var(--ai-text-secondary);
        margin: 4px 0 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
    
    .comment-content {
      max-width: 300px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
    }
  }
}
</style> 