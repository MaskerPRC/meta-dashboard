<template>
  <div class="admin-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">{{ $t('admin.title') }}</h1>
          <p class="page-subtitle">{{ $t('admin.subtitle') }}</p>
        </div>
        <div class="header-actions">
          <el-button type="success" @click="showAIGenerate = true" style="margin-right: 12px">
            <el-icon><Document /></el-icon>
            {{ $t('admin.ai_generator.title') }}
          </el-button>
          <el-button type="primary" @click="showCreateProject = true">
            <el-icon><Plus /></el-icon>
            {{ $t('admin.new_project') }}
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <AdminStats ref="adminStatsRef" />

      <!-- 主要内容区域 -->
      <div class="content-layout">
        <div class="main-content">
          <!-- 标签页 -->
          <el-tabs v-model="activeTab" class="admin-tabs">
            <!-- 项目管理 -->
            <el-tab-pane :label="$t('admin.project_management')" name="projects">
              <ProjectsManagement 
                ref="projectsManagementRef"
                @edit-project="editProject"
                @stats-updated="handleStatsUpdated"
              />
            </el-tab-pane>

            <!-- 用户管理 -->
            <el-tab-pane :label="$t('admin.user_management')" name="users">
              <UsersManagement 
                ref="usersManagementRef"
                @stats-updated="handleStatsUpdated"
              />
            </el-tab-pane>

            <!-- 想法管理 -->
            <el-tab-pane label="想法管理" name="ideas">
              <IdeasManagement 
                ref="ideasManagementRef"
                @stats-updated="handleStatsUpdated"
              />
            </el-tab-pane>

            <!-- 评论管理 -->
            <el-tab-pane :label="$t('admin.comment_management')" name="comments">
              <div class="comments-management-header">
                <div class="batch-actions">
                  <el-button 
                    type="primary" 
                    @click="batchValidateComments"
                    :loading="batchValidating"
                  >
                    <el-icon><MagicStick /></el-icon>
                    批量检测评论
                  </el-button>
                  <el-input-number
                    v-model="batchValidateLimit"
                    :min="1"
                    :max="50"
                    style="width: 120px; margin-left: 10px"
                    placeholder="检测数量"
                  />
                  <span style="margin-left: 10px; color: var(--el-text-color-secondary)">
                    每次最多检测{{ batchValidateLimit }}条待检测评论
                  </span>
                </div>
              </div>
              <CommentsManagement 
                ref="commentsManagementRef"
                @stats-updated="handleStatsUpdated"
              />
            </el-tab-pane>

            <!-- 简历管理 -->
            <el-tab-pane label="简历管理" name="resumes">
              <ResumesManagement 
                ref="resumesManagementRef"
                @stats-updated="handleStatsUpdated"
              />
            </el-tab-pane>

            <!-- 站点配置 -->
            <el-tab-pane :label="$t('admin.config_management')" name="config">
              <SiteConfigManagement ref="siteConfigManagementRef" />
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

    <!-- AI项目生成对话框 -->
    <AIProjectGenerator
      v-model="showAIGenerate"
      @project-created="handleAIProjectCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Document, MagicStick } from '@element-plus/icons-vue'
import ProjectEditDialog from '../components/admin/ProjectEditDialog.vue'
import AdminStats from '../components/admin/AdminStats.vue'
import ProjectsManagement from '../components/admin/ProjectsManagement.vue'
import UsersManagement from '../components/admin/UsersManagement.vue'
import IdeasManagement from '../components/admin/IdeasManagement.vue'
import CommentsManagement from '../components/admin/CommentsManagement.vue'
import ResumesManagement from '../components/admin/ResumesManagement.vue'
import SiteConfigManagement from '../components/admin/SiteConfigManagement.vue'
import AIProjectGenerator from '../components/admin/AIProjectGenerator.vue'
import axios from '../utils/axios'
import { ElMessage } from 'element-plus'

const route = useRoute()

// 响应式数据
const activeTab = ref('projects')
const batchValidating = ref(false)
const batchValidateLimit = ref(10)
const showCreateProject = ref(false)
const showAIGenerate = ref(false)
const editingProject = ref(null)

// 组件引用
const adminStatsRef = ref(null)
const projectsManagementRef = ref(null)
const usersManagementRef = ref(null)
const ideasManagementRef = ref(null)
const commentsManagementRef = ref(null)
const resumesManagementRef = ref(null)
const siteConfigManagementRef = ref(null)

// 方法
// 批量检测评论
const batchValidateComments = async () => {
  try {
    batchValidating.value = true
    
    const response = await axios.post('/api/admin/comments/batch-validate', {
      status: 'pending',
      limit: batchValidateLimit.value
    })
    
    ElMessage.success(`批量检测完成：成功处理 ${response.data.processed} 条，失败 ${response.data.failed} 条`)
    
    // 刷新评论列表
    if (commentsManagementRef.value) {
      commentsManagementRef.value.fetchComments()
    }
    
    // 刷新统计信息
    handleStatsUpdated()
    
  } catch (error) {
    console.error('批量检测失败:', error)
    ElMessage.error('批量检测失败: ' + (error.response?.data?.message || error.message))
  } finally {
    batchValidating.value = false
  }
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

const handleProjectSaved = async (project) => {
  // 通知项目管理组件更新
  if (projectsManagementRef.value) {
    projectsManagementRef.value.handleProjectSaved(project)
  }
  
  showCreateProject.value = false
  editingProject.value = null
  handleStatsUpdated()
}

const handleAIProjectCreated = async (project) => {
  // 刷新项目列表
  if (projectsManagementRef.value) {
    await projectsManagementRef.value.fetchProjects()
  }
  handleStatsUpdated()
}

const handleStatsUpdated = () => {
  // 刷新统计数据
  if (adminStatsRef.value) {
    adminStatsRef.value.fetchStats()
  }
}

// 生命周期
onMounted(async () => {
  // 检查是否有编辑项目的查询参数
  if (route.query.edit) {
    const projectId = parseInt(route.query.edit)
    await nextTick()
    
    // 等待项目管理组件加载完成
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 从项目管理组件获取项目数据
    if (projectsManagementRef.value) {
      await projectsManagementRef.value.fetchProjects()
      const projects = projectsManagementRef.value.projects || []
      const project = projects.find(p => p.id === projectId)
      if (project) {
        await editProject(project)
      }
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

  .content-layout {
    .main-content {
      .admin-tabs {
        background: var(--ai-bg-primary);
        border-radius: 12px;
        padding: 24px;
        border: 1px solid var(--ai-border);
      }
    }
  }

  .comments-management-header {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--ai-bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--ai-border-color);

    .batch-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
}
</style>
