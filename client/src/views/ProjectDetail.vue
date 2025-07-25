<template>
  <div class="project-detail-page">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-navigation">
        <el-button @click="$router.back()" text>
          <el-icon><ArrowLeft /></el-icon>
          返回项目列表
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- 项目详情 -->
      <div v-else-if="project" class="project-detail">
        <!-- 项目头部信息 -->
        <div class="project-header ai-card">
          <div class="header-main">
            <div class="title-section">
              <h1 class="project-title">{{ project.title }}</h1>
              <p class="project-description">{{ project.description }}</p>
            </div>
            
            <div class="status-section">
              <el-tag :class="['status-tag', project.status]" size="large">
                {{ getStatusName(project.status) }}
              </el-tag>
              <el-tag :class="['priority-tag', project.priority]" size="large">
                {{ getPriorityName(project.priority) }}
              </el-tag>
            </div>
          </div>

          <!-- 项目元信息 -->
          <div class="project-meta">
            <div class="meta-item">
              <span class="meta-label">创建时间：</span>
              <span class="meta-value">{{ formatDate(project.created_at) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">更新时间：</span>
              <span class="meta-value">{{ formatDate(project.updated_at) }}</span>
            </div>
            <div v-if="project.github_url" class="meta-item">
              <span class="meta-label">GitHub：</span>
              <el-link :href="project.github_url" target="_blank" type="primary">
                查看源码
              </el-link>
            </div>
            <div v-if="project.demo_url" class="meta-item">
              <span class="meta-label">演示地址：</span>
              <el-link :href="project.demo_url" target="_blank" type="primary">
                在线体验
              </el-link>
            </div>
          </div>

          <!-- 技术栈 -->
          <div v-if="project.tech_stack && project.tech_stack.length" class="tech-stack">
            <h3>技术栈</h3>
            <div class="tech-tags">
              <el-tag 
                v-for="tech in project.tech_stack" 
                :key="tech" 
                class="tech-tag"
              >
                {{ tech }}
              </el-tag>
            </div>
          </div>

          <!-- 管理员操作 -->
          <div v-if="authStore.isAdmin" class="admin-actions">
            <el-button type="primary" @click="editProject">
              <el-icon><Edit /></el-icon>
              编辑项目
            </el-button>
            <el-button type="danger" @click="deleteProject">
              <el-icon><Delete /></el-icon>
              删除项目
            </el-button>
          </div>
        </div>

        <!-- 项目内容 -->
        <div class="project-content ai-card">
          <h2>项目详情</h2>
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
          title="项目不存在" 
          sub-title="请检查链接是否正确"
        >
          <template #extra>
            <router-link to="/projects">
              <el-button type="primary">返回项目列表</el-button>
            </router-link>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Delete } from '@element-plus/icons-vue'
import { marked } from 'marked'
import { useAuthStore } from '@/stores/auth'
import axios from '@/utils/axios'
import dayjs from 'dayjs'
import CommentsSection from '@/components/comment/CommentsSection.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 状态
const project = ref(null)
const loading = ref(false)

// 计算属性
const renderedContent = computed(() => {
  if (!project.value?.content) return ''
  return marked(project.value.content)
})

// 方法
const getStatusName = (status) => {
  const statusMap = {
    idea: '想法',
    planning: '规划中',
    development: '开发中',
    testing: '测试中',
    completed: '已完成',
    deployed: '已上线',
    maintenance: '维护中'
  }
  return statusMap[status] || status
}

const getPriorityName = (priority) => {
  const priorityMap = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return priorityMap[priority] || priority
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
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
  // TODO: 实现项目编辑功能
  ElMessage.info('项目编辑功能正在开发中...')
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
    ElMessage.success('项目删除成功')
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

.project-detail {
  .project-header {
    margin-bottom: 24px;
    padding: 32px;

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      .title-section {
        flex: 1;

        .project-title {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: var(--el-text-color-primary);
        }

        .project-description {
          font-size: 16px;
          color: var(--el-text-color-regular);
          margin: 0;
          line-height: 1.6;
        }
      }

      .status-section {
        display: flex;
        gap: 12px;
        flex-shrink: 0;
      }
    }

    .project-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
      padding: 20px;
      background: var(--el-bg-color-page);
      border-radius: 8px;

      .meta-item {
        display: flex;
        align-items: center;

        .meta-label {
          font-weight: 500;
          color: var(--el-text-color-regular);
          margin-right: 8px;
        }

        .meta-value {
          color: var(--el-text-color-primary);
        }
      }
    }

    .tech-stack {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .tech-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .tech-tag {
          background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
          color: white;
          border: none;
        }
      }
    }

    .admin-actions {
      display: flex;
      gap: 12px;
    }
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

  .comments-section {
    padding: 32px;

    h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .add-comment {
      margin-bottom: 24px;

      .comment-actions {
        margin-top: 12px;
        display: flex;
        justify-content: flex-end;
      }
    }

    .login-prompt {
      text-align: center;
      padding: 20px;
      background: var(--el-bg-color-page);
      border-radius: 8px;
      margin-bottom: 24px;

      .login-link {
        color: var(--ai-primary);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .comments-list {
      .comments {
        .comment-item {
          border-bottom: 1px solid var(--el-border-color-lighter);
          padding: 20px 0;

          &:last-child {
            border-bottom: none;
          }

          .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .user-info {
              display: flex;
              align-items: center;
              gap: 12px;

              .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                object-fit: cover;
              }

              .user-name {
                font-weight: 500;
                color: var(--el-text-color-primary);
              }
            }

            .comment-meta {
              display: flex;
              align-items: center;
              gap: 12px;

              .comment-time {
                font-size: 12px;
                color: var(--el-text-color-secondary);
              }
            }
          }

          .comment-content {
            color: var(--el-text-color-regular);
            line-height: 1.6;
            margin-left: 44px;
          }
        }
      }

      .empty-comments {
        text-align: center;
        padding: 40px;
      }
    }
  }
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

@media (max-width: 768px) {
  .project-detail {
    .project-header {
      padding: 20px;

      .header-main {
        flex-direction: column;
        gap: 16px;

        .status-section {
          align-self: flex-start;
        }
      }

      .project-meta {
        grid-template-columns: 1fr;
      }

      .admin-actions {
        flex-direction: column;
      }
    }

    .project-content {
      padding: 20px;

      .markdown-content {
        :deep(pre) {
          font-size: 14px;
        }
      }
    }

    .comments-section {
      padding: 20px;

      .comments {
        .comment-item {
          .comment-content {
            margin-left: 0;
            margin-top: 12px;
          }
        }
      }
    }
  }
}
</style> 