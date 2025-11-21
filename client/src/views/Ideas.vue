<template>
  <main class="flex-grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
    <!-- Page Header -->
    <div class="mb-12 flex justify-between items-end border-b-4 border-black pb-4">
      <div>
        <h1 class="text-4xl font-black uppercase tracking-tight mb-2">想法征集</h1>
        <p class="text-gray-600 font-medium">分享你的创意想法，参与投票，一起推动AI项目发展</p>
      </div>
      <button 
        v-if="authStore.isAuthenticated" 
        @click="showSubmitDialog = true"
        class="neo-btn bg-neo-green text-black px-6 py-3 hover:bg-green-400"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        提交想法
      </button>
      <router-link 
        v-else
        to="/login"
        class="neo-btn bg-white px-6 py-3 hover:bg-neo-purple hover:text-white"
      >
        <i class="fa-solid fa-user mr-2"></i>
        登录提交想法
      </router-link>
    </div>

    <!-- Filter Console -->
    <div class="neo-card p-4 mb-8 bg-white flex flex-col md:flex-row justify-between items-center gap-4 rounded-lg relative">
      <!-- Decorative Screw Heads -->
      <div class="absolute top-2 left-2 w-2 h-2 border border-black rounded-full flex items-center justify-center">
        <div class="w-full h-[1px] bg-black transform rotate-45"></div>
      </div>
      <div class="absolute top-2 right-2 w-2 h-2 border border-black rounded-full flex items-center justify-center">
        <div class="w-full h-[1px] bg-black transform rotate-45"></div>
      </div>
      <div class="absolute bottom-2 left-2 w-2 h-2 border border-black rounded-full flex items-center justify-center">
        <div class="w-full h-[1px] bg-black transform rotate-45"></div>
      </div>
      <div class="absolute bottom-2 right-2 w-2 h-2 border border-black rounded-full flex items-center justify-center">
        <div class="w-full h-[1px] bg-black transform rotate-45"></div>
      </div>

      <div class="flex flex-wrap items-center gap-4 w-full md:w-auto z-10">
        <!-- Status Filter -->
        <div class="relative">
          <select 
            v-model="filters.status"
            @change="handleFilterChange"
            class="appearance-none bg-gray-100 border-2 border-black px-4 py-2 pr-8 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white cursor-pointer hover:shadow-neo-sm transition text-sm"
          >
            <option value="">状态筛选</option>
            <option value="pending">待审核</option>
            <option value="adopted">已采纳</option>
            <option value="rejected">已拒绝</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black border-l-2 border-black bg-neo-yellow">
            <i class="fa-solid fa-caret-down text-xs"></i>
          </div>
        </div>

        <!-- Sort -->
        <div class="relative">
          <select 
            v-model="sortBy"
            @change="handleSortChange"
            class="appearance-none bg-gray-100 border-2 border-black px-4 py-2 pr-8 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white cursor-pointer hover:shadow-neo-sm transition text-sm"
          >
            <option value="vote_count">投票数</option>
            <option value="created_at">最新创建</option>
            <option value="title">标题</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black border-l-2 border-black bg-neo-yellow">
            <i class="fa-solid fa-caret-down text-xs"></i>
          </div>
        </div>

        <!-- Search -->
        <div class="relative flex-1 md:flex-initial md:w-64">
          <input
            v-model="searchText"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索想法标题或描述..."
            class="w-full bg-gray-100 border-2 border-black px-4 py-2 pr-10 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white hover:shadow-neo-sm transition text-sm"
          />
          <button 
            @click="handleSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neo-yellow border-2 border-black rounded flex items-center justify-center hover:bg-yellow-400 transition"
          >
            <i class="fa-solid fa-search text-xs"></i>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-4 z-10">
        <!-- Sort Order -->
        <button 
          @click="toggleSortOrder"
          class="w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center hover:bg-gray-100 transition shadow-neo-sm"
        >
          <i :class="sortOrder === 'desc' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up'" class="text-sm"></i>
        </button>

        <!-- Reset -->
        <button 
          @click="resetFilters"
          class="neo-btn bg-white px-4 py-2 text-black hover:bg-gray-100 text-sm"
        >
          <i class="fa-solid fa-rotate mr-1"></i>
          重置
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="neo-card p-5 bg-white text-center">
        <div class="text-4xl font-black mb-1">{{ totalIdeas }}</div>
        <div class="text-xs font-bold text-gray-500">总想法数</div>
      </div>
      <div class="neo-card p-5 bg-yellow-50 text-center">
        <div class="text-4xl font-black mb-1">{{ pendingIdeas }}</div>
        <div class="text-xs font-bold text-gray-500">待审核</div>
      </div>
      <div class="neo-card p-5 bg-green-50 text-center">
        <div class="text-4xl font-black mb-1">{{ adoptedIdeas }}</div>
        <div class="text-xs font-bold text-gray-500">已采纳</div>
      </div>
      <div class="neo-card p-5 bg-blue-50 text-center">
        <div class="text-4xl font-black mb-1">{{ userVotesToday }}</div>
        <div class="text-xs font-bold text-gray-500">我今日投票</div>
      </div>
    </div>

    <!-- Ideas Grid -->
    <div v-loading="loading" class="mb-8">
      <div v-if="ideas.length === 0 && !loading" class="text-center py-16">
        <i class="fa-solid fa-lightbulb text-6xl text-gray-400 mb-4"></i>
        <p class="text-lg font-bold text-gray-600 mb-4">暂无想法数据</p>
        <button 
          v-if="authStore.isAuthenticated" 
          @click="showSubmitDialog = true"
          class="neo-btn bg-neo-green text-black px-6 py-3 hover:bg-green-400"
        >
          提交第一个想法
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="idea in ideas"
          :key="idea.id"
          class="neo-card p-6 bg-white cursor-pointer hover:translate-x-1 transition-transform"
          @click="viewIdeaDetail(idea)"
        >
          <!-- Header -->
          <div class="flex justify-between items-center mb-4">
            <span 
              class="px-3 py-1 text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0_0_black]"
              :class="getStatusBadgeClass(idea.status)"
            >
              {{ getStatusName(idea.status) }}
            </span>
            <div class="flex items-center gap-1 text-gray-500">
              <i class="fa-solid fa-star text-sm"></i>
              <span class="font-bold text-sm">{{ idea.vote_count || 0 }}</span>
            </div>
          </div>

          <!-- Content -->
          <h3 class="text-xl font-black mb-2 leading-tight">{{ idea.title }}</h3>
          <p class="text-sm text-gray-600 mb-4 line-clamp-3">{{ idea.description }}</p>

          <!-- Footer -->
          <div class="flex justify-between items-center pt-4 border-t-2 border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-black rounded-full border border-black"></div>
              <span class="font-bold text-xs">{{ idea.author_name }}</span>
            </div>
            <span class="text-xs font-bold text-gray-500">{{ formatDate(idea.created_at) }}</span>
          </div>

          <!-- Actions -->
          <div class="mt-4 flex gap-2" @click.stop>
            <button 
              v-if="idea.status === 'pending' && authStore.isAuthenticated"
              @click.stop="voteForIdea(idea, 1)"
              :disabled="hasVoted(idea.id)"
              class="flex-1 neo-btn bg-neo-green text-black px-3 py-2 text-sm hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fa-solid fa-check mr-1"></i>
              投1票
            </button>
            <button 
              v-if="idea.status === 'pending' && authStore.isAuthenticated"
              @click.stop="voteForIdea(idea, 2)"
              :disabled="hasVoted(idea.id) || userVotesToday >= 10"
              class="flex-1 neo-btn bg-neo-blue text-white px-3 py-2 text-sm hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fa-solid fa-star mr-1"></i>
              投2票
            </button>
            <router-link 
              v-if="idea.project_id"
              :to="`/project/${idea.project_id}`"
              @click.stop
              class="neo-btn bg-neo-purple text-white px-3 py-2 text-sm hover:bg-purple-400"
            >
              <i class="fa-solid fa-link mr-1"></i>
              查看项目
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalCount > 0" class="flex justify-center mb-8">
      <div class="neo-card p-4 bg-white inline-flex items-center gap-4">
        <button 
          @click="handleCurrentChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span class="font-mono font-bold">
          第 {{ currentPage }} / {{ Math.ceil(totalCount / pageSize) }} 页
        </span>
        <button 
          @click="handleCurrentChange(currentPage + 1)"
          :disabled="currentPage >= Math.ceil(totalCount / pageSize)"
          class="w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Submit Dialog -->
    <el-dialog
      v-model="showSubmitDialog"
      title="提交想法"
      width="600px"
      :before-close="closeSubmitDialog"
      class="submit-idea-dialog"
    >
      <el-form
        ref="submitFormRef"
        :model="submitForm"
        :rules="submitRules"
        class="submit-form"
      >
        <div class="form-group mb-4">
          <label class="block text-sm font-bold mb-2">
            <span class="text-red-500">*</span>想法标题
          </label>
          <div class="relative">
            <input
              v-model="submitForm.title"
              type="text"
              placeholder="简明扼要地描述你的想法（最多200字符）"
              maxlength="200"
              class="w-full bg-gray-100 border-2 border-black px-4 py-3 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
            />
            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
              {{ submitForm.title.length }}/200
            </span>
          </div>
        </div>

        <div class="form-group mb-4">
          <label class="block text-sm font-bold mb-2">
            <span class="text-red-500">*</span>想法描述
          </label>
          <textarea
            v-model="submitForm.description"
            :rows="4"
            placeholder="详细描述你的想法（最多1000字符）"
            maxlength="1000"
            class="w-full bg-gray-100 border-2 border-black px-4 py-3 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white resize-none"
          ></textarea>
          <div class="text-right text-xs font-bold text-gray-500 mt-1">
            {{ submitForm.description.length }}/1000
          </div>
        </div>

        <div class="form-group mb-4">
          <label class="block text-sm font-bold mb-2">详细内容</label>
          <textarea
            v-model="submitForm.content"
            :rows="6"
            placeholder="可选：提供更详细的实现思路、技术方案等（支持Markdown格式，最多10000字符）"
            maxlength="10000"
            class="w-full bg-gray-100 border-2 border-black px-4 py-3 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white resize-none"
          ></textarea>
          <div class="text-right text-xs font-bold text-gray-500 mt-1">
            {{ submitForm.content.length }}/10000
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer flex gap-4 justify-end">
          <button 
            @click="closeSubmitDialog"
            class="neo-btn bg-white px-6 py-3 hover:bg-gray-100"
          >
            取消
          </button>
          <button 
            @click="submitIdea" 
            :disabled="submitting"
            class="neo-btn bg-neo-green text-black px-6 py-3 hover:bg-green-400 disabled:opacity-50"
          >
            <span v-if="!submitting">提交想法</span>
            <span v-else>提交中...</span>
          </button>
        </div>
      </template>
    </el-dialog>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { showNotification } from '../utils/notification'
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
    showNotification.error('获取想法列表失败')
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

const handleCurrentChange = (page) => {
  if (page < 1 || page > Math.ceil(totalCount.value / pageSize.value)) return
  currentPage.value = page
  fetchIdeas()
}

const viewIdeaDetail = (idea) => {
  router.push(`/idea/${idea.id}`)
}

const hasVoted = (ideaId) => {
  return userVotes.value.some(vote => vote.idea_id === ideaId)
}

const voteForIdea = async (idea, votes) => {
  if (!authStore.isAuthenticated) {
    showNotification.warning('请先登录')
    return
  }

  if (hasVoted(idea.id)) {
    showNotification.warning('您已经为此想法投过票了')
    return
  }

  if (userVotesToday.value + votes > 10) {
    showNotification.warning(`您今日投票数已达上限，剩余${10 - userVotesToday.value}票`)
    return
  }

  try {
    await axios.post(`/api/ideas/${idea.id}/vote`, { votes })
    showNotification.success(`投票成功，您为此想法投了${votes}票`)
    
    // 刷新数据
    fetchIdeas()
    fetchUserVotes()
  } catch (error) {
    console.error('投票失败:', error)
    showNotification.error('投票失败: ' + (error.response?.data?.message || error.message))
  }
}

const submitIdea = async () => {
  if (!submitFormRef.value) return

  try {
    await submitFormRef.value.validate()
    
    submitting.value = true
    await axios.post('/api/ideas', submitForm)
    
    showNotification.success('想法提交成功，等待管理员审核')
    closeSubmitDialog()
    fetchIdeas()
  } catch (error) {
    if (error.response) {
      showNotification.error('提交失败: ' + error.response.data.message)
    } else {
      console.error('提交想法失败:', error)
      showNotification.error('提交失败，请重试')
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

const getStatusBadgeClass = (status) => {
  const classMap = {
    pending: 'bg-neo-yellow text-black',
    adopted: 'bg-neo-green text-black',
    rejected: 'bg-neo-red text-white'
  }
  return classMap[status] || 'bg-gray-200 text-gray-800'
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
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.submit-idea-dialog {
  :deep(.el-dialog) {
    border: 4px solid black;
    border-radius: 0;
    box-shadow: 8px 8px 0 0 black;
  }

  :deep(.el-dialog__header) {
    text-align: center;
    padding: 24px 24px 0;
    border-bottom: 3px solid black;

    .el-dialog__title {
      font-weight: 900;
      font-size: 1.5rem;
      color: black;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 20px 24px;
    border-top: 3px solid black;
  }
}

.submit-form {
  padding: 0;
  margin: 0;
}
</style>
