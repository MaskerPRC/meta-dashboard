<template>
  <div class="project-detail-page">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-navigation">
        <el-button @click="$router.push('/projects')" text>
          <el-icon><ArrowLeft /></el-icon>
          {{ t('project.back_to_list') }}
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- 项目详情 -->
      <div v-else-if="project" class="project-detail">
        <!-- 项目头部信息 -->
        <ProjectHeader 
          :project="project"
          :is-admin="authStore.isAdmin"
          @edit-project="editProject"
          @delete-project="deleteProject"
        />

        <!-- 项目附件（展示在内容前面） -->
        <ProjectAttachments 
          v-if="hasAttachments" 
          :attachments="project.attachments"
          @preview-image="previewImage"
        />

        <!-- 项目内容 -->
        <div class="project-content ai-card">
          <h2>{{ t('project.project_details') }}</h2>
          <div v-if="project.content" class="markdown-content" v-html="renderedContent"></div>
          <div v-else class="empty-content">
            <el-empty description="暂无详细内容" />
          </div>
        </div>

        <!-- 评论区域 -->
        <CommentsSection :project-id="route.params.id" />
      </div>

      <!-- 项目不存在 -->
      <div v-else class="not-found">
        <el-result 
          icon="warning" 
          :title="t('project.not_found')" 
          :sub-title="t('project.check_link')"
        >
          <template #extra>
            <router-link to="/projects">
              <el-button type="primary">{{ t('project.back_to_list') }}</el-button>
            </router-link>
          </template>
        </el-result>
      </div>
    </div>

    <!-- 项目编辑对话框 -->
    <ProjectEditDialog
      v-model="showEditDialog"
      :project="project"
      @saved="handleProjectSaved"
    />

    <!-- 图片查看器 -->
    <ProjectImageViewer
      :show="showImageViewer"
      :images="project?.attachments?.images || []"
      :initial-index="currentImageIndex"
      @close="closeImageViewer"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { showNotification } from '../utils/notification'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import axios from '@/utils/axios'
import CommentsSection from '@/components/comment/CommentsSection.vue'
import ProjectEditDialog from '@/components/admin/ProjectEditDialog.vue'
import ProjectHeader from '@/components/project/ProjectHeader.vue'
import ProjectAttachments from '@/components/project/ProjectAttachments.vue'
import ProjectImageViewer from '@/components/project/ProjectImageViewer.vue'
import { renderEnhancedMarkdown } from '@/utils/markdownRenderer'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// 状态
const project = ref(null)
const loading = ref(false)
const showEditDialog = ref(false)
const currentImageIndex = ref(0)
const showImageViewer = ref(false)

// 计算属性
const renderedContent = computed(() => {
  if (!project.value?.content) return ''
  return renderEnhancedMarkdown(project.value.content)
})

const hasAttachments = computed(() => {
  return project.value?.attachments && 
         (project.value.attachments.images?.length > 0 || project.value.attachments.videos?.length > 0)
})

// 方法
const previewImage = (image, index) => {
  currentImageIndex.value = index
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
}





// API方法
const fetchProject = async () => {
  try {
    loading.value = true
    const response = await axios.get(`/api/projects/${route.params.id}`)
    project.value = response.data
    
    // 解析技术栈
    if (project.value.tech_stack && typeof project.value.tech_stack === 'string') {
      try {
        project.value.tech_stack = JSON.parse(project.value.tech_stack)
      } catch (e) {
        project.value.tech_stack = []
      }
    }
  } catch (error) {
    console.error('获取项目详情失败:', error)
    project.value = null
  } finally {
    loading.value = false
  }
}



const editProject = () => {
  // 直接在当前页面打开编辑对话框
  showEditDialog.value = true
}

// 处理项目保存
const handleProjectSaved = async (savedProject) => {
  // 更新当前页面的项目数据
  project.value = savedProject
  showEditDialog.value = false
  showNotification.success(t('admin.project_saved'))
}

const deleteProject = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目"${project.value.title}"吗？此操作不可恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await axios.delete(`/api/projects/${route.params.id}`)
    showNotification.success('项目删除成功')
    router.push('/projects')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error)
    }
  }
}

// 生命周期
onMounted(async () => {
  await fetchProject()
})
</script>

<style lang="scss" scoped>
.project-detail-page {
  min-height: calc(100vh - 60px);
  padding: 20px 0;
}

.back-navigation {
  margin-bottom: 20px;
}

.loading-container {
  padding: 40px;
}

.project-content {
  margin-bottom: 24px;
  padding: 32px;

  h2 {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .markdown-content {
    line-height: 1.7;
    color: var(--el-text-color-primary);

    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin: 20px 0 12px 0;
      font-weight: 600;
    }

    :deep(p) {
      margin: 12px 0;
    }

    :deep(ul), :deep(ol) {
      margin: 12px 0;
      padding-left: 24px;
    }

    :deep(code) {
      background: var(--el-bg-color-page);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
    }

    :deep(pre) {
      background: var(--el-bg-color-page);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;

      code {
        background: none;
        padding: 0;
      }
    }

    :deep(blockquote) {
      border-left: 4px solid var(--ai-primary);
      margin: 16px 0;
      padding: 8px 16px;
      background: var(--el-bg-color-page);
      border-radius: 0 8px 8px 0;
    }
  }

  .empty-content {
    text-align: center;
    padding: 40px;
  }
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

@media (max-width: 768px) {
  .project-content {
    padding: 20px;

    .markdown-content {
      :deep(pre) {
        font-size: 14px;
      }
    }
  }
}
</style> 