<template>
  <div class="idea-detail-page">
    <div class="container">
      <div v-if="loading" v-loading="loading" class="loading-container">
        <div style="height: 400px;"></div>
      </div>

      <div v-else-if="idea" class="idea-detail">
        <!-- 返回按钮 -->
        <div class="back-button">
          <el-button @click="$router.go(-1)">
            <el-icon><ArrowLeft /></el-icon>
            返回想法列表
          </el-button>
        </div>

        <!-- 想法头部信息 -->
        <div class="idea-header">
          <div class="idea-title-section">
            <h1 class="idea-title">{{ idea.title }}</h1>
            <div class="idea-meta">
              <el-tag :class="['status-tag', idea.status]">
                {{ getStatusName(idea.status) }}
              </el-tag>
              <div class="vote-info">
                <el-icon><Star /></el-icon>
                <span>{{ idea.vote_count || 0 }} 票 ({{ idea.voters_count || 0 }} 人投票)</span>
              </div>
            </div>
          </div>

          <!-- 投票操作 -->
          <div v-if="idea.status === 'pending' && authStore.isAuthenticated" class="vote-section">
            <div class="vote-buttons">
              <el-button 
                type="success" 
                size="large"
                @click="voteForIdea(1)"
                :disabled="hasVoted || userVotesToday >= 10"
              >
                <el-icon><Check /></el-icon>
                投1票
              </el-button>
              <el-button 
                type="primary" 
                size="large"
                @click="voteForIdea(2)"
                :disabled="hasVoted || userVotesToday + 1 >= 10"
              >
                <el-icon><Star /></el-icon>
                投2票
              </el-button>
            </div>
            <div class="vote-tips">
              <p v-if="hasVoted" class="voted-tip">您已为此想法投票</p>
              <p v-else-if="userVotesToday >= 10" class="limit-tip">今日投票已达上限</p>
              <p v-else class="normal-tip">今日剩余投票：{{ 10 - userVotesToday }} 票</p>
            </div>
          </div>
        </div>

        <!-- 想法内容 -->
        <div class="idea-content">
          <div class="description-section">
            <h3>想法描述</h3>
            <p class="description">{{ idea.description }}</p>
          </div>

          <div v-if="idea.content" class="content-section">
            <h3>详细内容</h3>
            <div class="markdown-content" v-html="renderMarkdown(idea.content)"></div>
          </div>
        </div>

        <!-- 作者和时间信息 -->
        <div class="idea-info">
          <div class="author-section">
            <h3>提交者信息</h3>
            <div class="author-card">
              <el-avatar :size="50" :src="idea.author_avatar" />
              <div class="author-details">
                <div class="author-name">{{ idea.author_name }}</div>
                <div class="submit-time">{{ formatDate(idea.created_at) }} 提交</div>
              </div>
            </div>
          </div>

          <!-- 采纳信息 -->
          <div v-if="idea.adopted_by" class="adoption-section">
            <h3>采纳信息</h3>
            <div class="adoption-info">
              <p>采纳人：{{ idea.adopter_name }}</p>
              <p>采纳时间：{{ formatDate(idea.adopted_at) }}</p>
            </div>
          </div>

          <!-- 项目关联 -->
          <div v-if="idea.project_id" class="project-section">
            <h3>关联项目</h3>
            <div class="project-link">
              <p>已转化为项目：{{ idea.project_title }}</p>
              <el-button type="primary" @click="viewProject(idea.project_id)">
                <el-icon><Link /></el-icon>
                查看项目详情
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error-state">
        <el-result
          icon="warning"
          title="想法不存在"
          sub-title="该想法可能已被删除或您没有访问权限"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/ideas')">
              返回想法列表
            </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showNotification } from '../utils/notification'
import { ArrowLeft, Star, Check, Link } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import axios from '../utils/axios'
import { renderMarkdown } from '../utils/markdownRenderer'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const idea = ref(null)
const loading = ref(false)
const hasVoted = ref(false)
const userVotesToday = ref(0)

// 方法
const fetchIdeaDetail = async () => {
  loading.value = true
  try {
    const response = await axios.get(`/api/ideas/${route.params.id}`)
    idea.value = response.data.idea
  } catch (error) {
    console.error('获取想法详情失败:', error)
    showNotification.error('获取想法详情失败')
  } finally {
    loading.value = false
  }
}

const fetchUserVotes = async () => {
  if (!authStore.isAuthenticated) return
  
  try {
    const response = await axios.get('/api/ideas/user/votes')
    const userVotes = response.data.votes
    
    // 检查是否已对当前想法投票
    hasVoted.value = userVotes.some(vote => vote.idea_id === parseInt(route.params.id))
    
    // 计算今日投票数
    const today = new Date().toDateString()
    userVotesToday.value = userVotes
      .filter(vote => new Date(vote.created_at).toDateString() === today)
      .reduce((total, vote) => total + vote.votes_count, 0)
  } catch (error) {
    console.error('获取用户投票记录失败:', error)
  }
}

const voteForIdea = async (votes) => {
  if (!authStore.isAuthenticated) {
    showNotification.warning('请先登录')
    return
  }

  if (hasVoted.value) {
    showNotification.warning('您已经为此想法投过票了')
    return
  }

  if (userVotesToday.value + votes > 10) {
    showNotification.warning(`您今日投票数已达上限，剩余${10 - userVotesToday.value}票`)
    return
  }

  try {
    await axios.post(`/api/ideas/${idea.value.id}/vote`, { votes })
    showNotification.success(`投票成功，您为此想法投了${votes}票`)
    
    // 刷新数据
    fetchIdeaDetail()
    fetchUserVotes()
  } catch (error) {
    console.error('投票失败:', error)
    showNotification.error('投票失败: ' + (error.response?.data?.message || error.message))
  }
}

const viewProject = (projectId) => {
  router.push(`/project/${projectId}`)
}

const getStatusName = (status) => {
  const statusMap = {
    pending: '待审核',
    adopted: '已采纳',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchIdeaDetail()
  if (authStore.isAuthenticated) {
    fetchUserVotes()
  }
})
</script>

<style lang="scss" scoped>
.idea-detail-page {
  min-height: calc(100vh - 70px);
  background: var(--ai-bg-secondary);

  .container {
    padding: 40px 20px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .back-button {
    margin-bottom: 24px;
  }

  .idea-detail {
    background: var(--ai-bg-primary);
    border-radius: 12px;
    padding: 32px;
    border: 1px solid var(--ai-border);

    .idea-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 24px;

      .idea-title-section {
        flex: 1;

        .idea-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 16px;
          color: var(--ai-text-primary);
          line-height: 1.3;
        }

        .idea-meta {
          display: flex;
          align-items: center;
          gap: 16px;

          .vote-info {
            display: flex;
            align-items: center;
            gap: 4px;
            color: var(--ai-text-secondary);
            font-size: 1.1rem;
          }
        }
      }

      .vote-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        .vote-buttons {
          display: flex;
          gap: 12px;
        }

        .vote-tips {
          font-size: 0.875rem;
          text-align: center;

          .voted-tip {
            color: var(--el-color-success);
            margin: 0;
          }

          .limit-tip {
            color: var(--el-color-warning);
            margin: 0;
          }

          .normal-tip {
            color: var(--ai-text-secondary);
            margin: 0;
          }
        }
      }

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;

        .vote-section {
          align-items: stretch;

          .vote-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }
      }
    }

    .idea-content {
      margin-bottom: 32px;

      .description-section,
      .content-section {
        margin-bottom: 24px;

        h3 {
          font-size: 1.25rem;
          margin: 0 0 12px;
          color: var(--ai-text-primary);
        }

        .description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--ai-text-secondary);
          margin: 0;
        }

        .markdown-content {
          padding: 16px;
          background: var(--ai-bg-secondary);
          border-radius: 8px;
          border-left: 4px solid var(--ai-primary);
          line-height: 1.6;
        }
      }
    }

    .idea-info {
      .author-section,
      .adoption-section,
      .project-section {
        margin-bottom: 24px;

        h3 {
          font-size: 1.25rem;
          margin: 0 0 12px;
          color: var(--ai-text-primary);
        }

        .author-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--ai-bg-secondary);
          border-radius: 8px;

          .author-details {
            .author-name {
              font-weight: 600;
              color: var(--ai-text-primary);
              margin-bottom: 4px;
            }

            .submit-time {
              color: var(--ai-text-secondary);
              font-size: 0.875rem;
            }
          }
        }

        .adoption-info,
        .project-link {
          padding: 16px;
          background: var(--ai-bg-secondary);
          border-radius: 8px;

          p {
            margin: 0 0 8px;
            color: var(--ai-text-secondary);

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }

  .status-tag {
    &.pending {
      background-color: #ffd04b;
      color: #ad6800;
      border-color: #ffd04b;
    }

    &.adopted {
      background-color: #67c23a;
      color: white;
      border-color: #67c23a;
    }

    &.rejected {
      background-color: #f56c6c;
      color: white;
      border-color: #f56c6c;
    }
  }
}
</style>