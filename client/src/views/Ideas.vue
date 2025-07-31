<template>
  <div class="ideas-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">想法征集</h1>
          <p class="page-subtitle">分享你的创意想法，参与投票，一起推动AI项目发展</p>
        </div>
        
        <!-- 操作按钮 -->
        <div class="header-actions">
          <el-button 
            v-if="authStore.isAuthenticated" 
            type="primary" 
            @click="showSubmitDialog = true"
          >
            <el-icon><Plus /></el-icon>
            提交想法
          </el-button>
          <el-button v-else @click="$router.push('/login')">
            <el-icon><User /></el-icon>
            登录提交想法
          </el-button>
        </div>
      </div>

      <!-- 筛选和搜索工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <!-- 状态筛选 -->
          <el-select
            v-model="filters.status"
            placeholder="状态筛选"
            clearable
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option label="待审核" value="pending" />
            <el-option label="已采纳" value="adopted" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>

          <!-- 排序方式 -->
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            style="width: 140px"
            @change="handleSortChange"
          >
            <el-option label="投票数" value="vote_count" />
            <el-option label="最新创建" value="created_at" />
            <el-option label="标题" value="title" />
          </el-select>

          <!-- 搜索框 -->
          <el-input
            v-model="searchText"
            placeholder="搜索想法标题或描述..."
            style="width: 300px"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
        </div>

        <div class="toolbar-right">
          <!-- 升序降序切换 -->
          <el-button @click="toggleSortOrder">
            <el-icon v-if="sortOrder === 'desc'"><ArrowDown /></el-icon>
            <el-icon v-else><ArrowUp /></el-icon>
            {{ sortOrder === 'desc' ? '降序' : '升序' }}
          </el-button>

          <!-- 重置筛选 -->
          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ totalIdeas }}</div>
          <div class="stat-label">总想法数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pendingIdeas }}</div>
          <div class="stat-label">待审核</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ adoptedIdeas }}</div>
          <div class="stat-label">已采纳</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ userVotesToday }}</div>
          <div class="stat-label">我今日投票</div>
        </div>
      </div>

      <!-- 想法列表 -->
      <div class="ideas-content" v-loading="loading">
        <div v-if="ideas.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无想法数据">
            <el-button 
              v-if="authStore.isAuthenticated" 
              type="primary" 
              @click="showSubmitDialog = true"
            >
              提交第一个想法
            </el-button>
          </el-empty>
        </div>

        <div v-else class="ideas-grid">
          <div
            v-for="idea in ideas"
            :key="idea.id"
            class="idea-card"
            @click="viewIdeaDetail(idea)"
          >
            <!-- 想法状态标签 -->
            <div class="idea-header">
              <el-tag :class="['status-tag', idea.status]" size="small">
                {{ getStatusName(idea.status) }}
              </el-tag>
              <div class="vote-info">
                <el-icon><Star /></el-icon>
                <span>{{ idea.vote_count || 0 }}</span>
              </div>
            </div>

            <!-- 想法内容 -->
            <div class="idea-content">
              <h3 class="idea-title">{{ idea.title }}</h3>
              <p class="idea-description">{{ idea.description }}</p>
            </div>

            <!-- 作者信息 -->
            <div class="idea-footer">
              <div class="author-info">
                <el-avatar :size="24" :src="idea.author_avatar" />
                <span class="author-name">{{ idea.author_name }}</span>
              </div>
              <div class="idea-meta">
                <span class="create-time">{{ formatDate(idea.created_at) }}</span>
                <span class="voters-count">{{ idea.voters_count || 0 }}人投票</span>
              </div>
            </div>

            <!-- 投票按钮 -->
            <div v-if="idea.status === 'pending' && authStore.isAuthenticated" class="vote-actions">
              <el-button 
                size="small" 
                type="success" 
                @click.stop="voteForIdea(idea, 1)"
                :disabled="hasVoted(idea.id)"
              >
                <el-icon><Check /></el-icon>
                投1票
              </el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click.stop="voteForIdea(idea, 2)"
                :disabled="hasVoted(idea.id) || userVotesToday >= 10"
              >
                <el-icon><Star /></el-icon>
                投2票
              </el-button>
            </div>

            <!-- 项目关联信息 -->
            <div v-if="idea.project_id" class="project-link">
              <el-button 
                size="small" 
                type="info" 
                @click.stop="viewProject(idea.project_id)"
              >
                <el-icon><Link /></el-icon>
                查看项目
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 48]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 提交想法对话框 -->
    <el-dialog
      v-model="showSubmitDialog"
      title="提交想法"
      width="600px"
      :before-close="closeSubmitDialog"
    >
      <el-form
        ref="submitFormRef"
        :model="submitForm"
        :rules="submitRules"
        label-width="80px"
      >
        <el-form-item label="想法标题" prop="title">
          <el-input
            v-model="submitForm.title"
            placeholder="简明扼要地描述你的想法（最多200字符）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="想法描述" prop="description">
          <el-input
            v-model="submitForm.description"
            type="textarea"
            :rows="4"
            placeholder="详细描述你的想法（最多1000字符）"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="详细内容" prop="content">
          <el-input
            v-model="submitForm.content"
            type="textarea"
            :rows="6"
            placeholder="可选：提供更详细的实现思路、技术方案等（支持Markdown格式，最多10000字符）"
            maxlength="10000"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeSubmitDialog">取消</el-button>
          <el-button type="primary" @click="submitIdea" :loading="submitting">
            提交想法
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, User, Search, ArrowDown, ArrowUp, Refresh, Star,
  Check, Link
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import axios from '../utils/axios'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const ideas = ref([])
const loading = ref(false)
const submitting = ref(false)
const showSubmitDialog = ref(false)

// 筛选和搜索
const filters = reactive({
  status: ''
})
const searchText = ref('')
const sortBy = ref('vote_count')
const sortOrder = ref('desc')

// 分页
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)

// 统计数据
const totalIdeas = ref(0)
const pendingIdeas = ref(0)
const adoptedIdeas = ref(0)
const userVotesToday = ref(0)
const userVotes = ref([])

// 提交表单
const submitFormRef = ref(null)
const submitForm = reactive({
  title: '',
  description: '',
  content: ''
})

const submitRules = {
  title: [
    { required: true, message: '请输入想法标题', trigger: 'blur' },
    { max: 200, message: '标题不能超过200字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入想法描述', trigger: 'blur' },
    { max: 1000, message: '描述不能超过1000字符', trigger: 'blur' }
  ],
  content: [
    { max: 10000, message: '详细内容不能超过10000字符', trigger: 'blur' }
  ]
}

// 计算属性
const filteredIdeas = computed(() => {
  // 这里可以添加客户端过滤逻辑
  return ideas.value
})

// 方法
const fetchIdeas = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/ideas', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        sortBy: sortBy.value,
        order: sortOrder.value,
        status: filters.status || 'all'
      }
    })

    ideas.value = response.data.ideas
    totalCount.value = response.data.pagination.count
    
    // 更新统计数据
    updateStats()
  } catch (error) {
    console.error('获取想法列表失败:', error)
    ElMessage.error('获取想法列表失败')
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  totalIdeas.value = ideas.value.length
  pendingIdeas.value = ideas.value.filter(idea => idea.status === 'pending').length
  adoptedIdeas.value = ideas.value.filter(idea => idea.status === 'adopted').length
}

const fetchUserVotes = async () => {
  if (!authStore.isAuthenticated) return
  
  try {
    const response = await axios.get('/api/ideas/user/votes')
    userVotes.value = response.data.votes
    
    // 计算今日投票数
    const today = new Date().toDateString()
    userVotesToday.value = userVotes.value
      .filter(vote => new Date(vote.created_at).toDateString() === today)
      .reduce((total, vote) => total + vote.votes_count, 0)
  } catch (error) {
    console.error('获取用户投票记录失败:', error)
  }
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchIdeas()
}

const handleSortChange = () => {
  currentPage.value = 1
  fetchIdeas()
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  currentPage.value = 1
  fetchIdeas()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchIdeas()
}

const resetFilters = () => {
  filters.status = ''
  searchText.value = ''
  sortBy.value = 'vote_count'
  sortOrder.value = 'desc'
  currentPage.value = 1
  fetchIdeas()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchIdeas()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchIdeas()
}

const viewIdeaDetail = (idea) => {
  router.push(`/idea/${idea.id}`)
}

const viewProject = (projectId) => {
  router.push(`/project/${projectId}`)
}

const hasVoted = (ideaId) => {
  return userVotes.value.some(vote => vote.idea_id === ideaId)
}

const voteForIdea = async (idea, votes) => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }

  if (hasVoted(idea.id)) {
    ElMessage.warning('您已经为此想法投过票了')
    return
  }

  if (userVotesToday.value + votes > 10) {
    ElMessage.warning(`您今日投票数已达上限，剩余${10 - userVotesToday.value}票`)
    return
  }

  try {
    await axios.post(`/api/ideas/${idea.id}/vote`, { votes })
    ElMessage.success(`投票成功，您为此想法投了${votes}票`)
    
    // 刷新数据
    fetchIdeas()
    fetchUserVotes()
  } catch (error) {
    console.error('投票失败:', error)
    ElMessage.error('投票失败: ' + (error.response?.data?.message || error.message))
  }
}

const submitIdea = async () => {
  if (!submitFormRef.value) return

  try {
    await submitFormRef.value.validate()
    
    submitting.value = true
    await axios.post('/api/ideas', submitForm)
    
    ElMessage.success('想法提交成功，等待管理员审核')
    closeSubmitDialog()
    fetchIdeas()
  } catch (error) {
    if (error.response) {
      ElMessage.error('提交失败: ' + error.response.data.message)
    } else {
      console.error('提交想法失败:', error)
      ElMessage.error('提交失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

const closeSubmitDialog = () => {
  showSubmitDialog.value = false
  submitForm.title = ''
  submitForm.description = ''
  submitForm.content = ''
  if (submitFormRef.value) {
    submitFormRef.value.resetFields()
  }
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
  return new Date(dateString).toLocaleDateString()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchIdeas()
  if (authStore.isAuthenticated) {
    fetchUserVotes()
  }
})
</script>

<style lang="scss" scoped>
.ideas-page {
  min-height: calc(100vh - 70px);
  background: var(--ai-bg-secondary);

  .container {
    padding: 40px 20px;
    max-width: 1400px;
    margin: 0 auto;
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
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

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--ai-bg-primary);
    border-radius: 8px;
    border: 1px solid var(--ai-border);

    .toolbar-left {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
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
        justify-content: space-between;
      }
    }
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;

    .stat-card {
      background: var(--ai-bg-primary);
      border: 1px solid var(--ai-border);
      border-radius: 8px;
      padding: 24px;
      text-align: center;

      .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--ai-primary);
        margin-bottom: 8px;
      }

      .stat-label {
        color: var(--ai-text-secondary);
        font-size: 0.875rem;
      }
    }
  }

  .ideas-content {
    background: var(--ai-bg-primary);
    border-radius: 12px;
    padding: 24px;
    border: 1px solid var(--ai-border);

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .ideas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .idea-card {
      background: var(--ai-bg-secondary);
      border: 1px solid var(--ai-border);
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: var(--ai-primary);
      }

      .idea-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .vote-info {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--ai-text-secondary);
          font-size: 14px;
        }
      }

      .idea-content {
        margin-bottom: 16px;

        .idea-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 8px;
          color: var(--ai-text-primary);
          line-height: 1.4;
        }

        .idea-description {
          color: var(--ai-text-secondary);
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .idea-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 0.875rem;

        .author-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .author-name {
            color: var(--ai-text-secondary);
          }
        }

        .idea-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          color: var(--ai-text-secondary);
        }
      }

      .vote-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .project-link {
        margin-top: 8px;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 32px;
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

@media (max-width: 768px) {
  .ideas-grid {
    grid-template-columns: 1fr !important;
  }
  
  .idea-card {
    .vote-actions {
      flex-direction: column;
      
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>