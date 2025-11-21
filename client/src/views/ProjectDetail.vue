<template>
  <main class="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
    <!-- Back Button & Breadcrumb -->
    <div class="mb-6 flex items-center gap-2">
      <router-link 
        to="/projects" 
        class="flex items-center gap-2 font-bold hover:underline bg-white border-2 border-black px-3 py-1 shadow-neo-hover"
      >
        <i class="fa-solid fa-arrow-left"></i> 返回列表
      </router-link>
      <span class="font-mono text-gray-500">/ Projects / {{ project?.id || 'loading' }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="neo-card p-8">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Project Detail -->
    <div v-else-if="project">
      <!-- 1. Main Info Card -->
      <div class="neo-card p-0 mb-8 relative overflow-hidden bg-white">
        <!-- Top Bar (Status) -->
        <div class="border-b-3 border-black bg-gray-100 p-4 flex flex-wrap justify-between items-center gap-4">
          <div class="flex gap-3">
            <div 
              class="border-2 border-black font-black px-3 py-1 uppercase text-sm shadow-[2px_2px_0_0_black]"
              :class="getStatusBadgeClass(project.status)"
            >
              <i :class="getStatusIcon(project.status)" class="mr-1"></i>
              {{ getStatusName(project.status) }}
            </div>
            <div 
              v-if="project.priority"
              class="bg-neo-yellow text-black border-2 border-black font-black px-3 py-1 uppercase text-sm shadow-[2px_2px_0_0_black]"
            >
              {{ getPriorityName(project.priority) }}
            </div>
          </div>
          <div class="flex gap-4 font-mono text-xs font-bold text-gray-500">
            <span><i class="fa-regular fa-clock"></i> Created: {{ formatDate(project.created_at) }}</span>
            <span><i class="fa-solid fa-rotate"></i> Updated: {{ formatDate(project.updated_at) }}</span>
          </div>
        </div>

        <div class="p-6 md:p-8">
          <!-- Title -->
          <h1 class="text-4xl md:text-5xl font-display font-black mb-4 leading-tight">
            {{ project.title }}
          </h1>
          <p class="text-lg font-medium text-gray-600 border-l-4 border-black pl-4 mb-8">
            {{ project.description }}
          </p>

          <!-- Action Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <!-- History Button -->
            <router-link 
              :to="`/project/${project.id}/history`"
              class="neo-btn-secondary p-4 flex items-center justify-between group"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-neo-purple border-2 border-black flex items-center justify-center rounded-full text-white text-lg">
                  <i class="fa-solid fa-history"></i>
                </div>
                <div class="text-left">
                  <div class="font-bold text-lg group-hover:text-neo-purple transition-colors">进展历史</div>
                  <div class="text-xs text-gray-500 font-mono">查看项目发展轨迹</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right"></i>
            </router-link>

            <!-- Demo Button -->
            <a 
              v-if="demoLinks.length > 0"
              :href="demoLinks[0].url" 
              target="_blank"
              class="neo-btn-primary p-4 flex items-center justify-between group"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-black border-2 border-white flex items-center justify-center rounded-full text-neo-green text-lg animate-pulse">
                  <i class="fa-solid fa-play"></i>
                </div>
                <div class="text-left">
                  <div class="font-black text-lg">在线演示</div>
                  <div class="text-xs text-black font-mono font-bold">体验项目效果</div>
                </div>
              </div>
              <i class="fa-solid fa-arrow-up-right-from-square font-bold text-xl"></i>
            </a>
            <div v-else class="neo-btn-secondary p-4 flex items-center justify-center opacity-50">
              <div class="text-center">
                <div class="font-bold text-lg text-gray-400">暂无演示</div>
                <div class="text-xs text-gray-500 font-mono">Demo链接未配置</div>
              </div>
            </div>
          </div>

          <!-- Tech Stack -->
          <div v-if="project.tech_stack && project.tech_stack.length" class="pt-6 border-t-2 border-dashed border-gray-300">
            <div class="text-xs font-black uppercase text-gray-400 mb-3 tracking-widest">Tech Stack</div>
            <div class="flex flex-wrap gap-3">
              <span 
                v-for="tech in project.tech_stack" 
                :key="tech"
                class="tech-tag"
              >
                {{ tech }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Detail Content (The "Readme") -->
      <div class="neo-card p-0 mb-8 bg-white">
        <!-- Fake Window Header -->
        <div class="bg-black text-white border-b-3 border-black px-4 py-2 flex justify-between items-center">
          <span class="font-mono font-bold text-sm"><i class="fa-solid fa-file-lines mr-2"></i>README.md</span>
          <div class="flex gap-2">
            <div class="w-3 h-3 bg-neo-red rounded-full border border-white"></div>
            <div class="w-3 h-3 bg-neo-yellow rounded-full border border-white"></div>
            <div class="w-3 h-3 bg-neo-green rounded-full border border-white"></div>
          </div>
        </div>

        <div class="p-6 md:p-10 prose max-w-none text-gray-800">
          <div v-if="renderedContent" v-html="renderedContent"></div>
          <div v-else class="text-center py-12 text-gray-400">
            <i class="fa-solid fa-file-lines text-4xl mb-4"></i>
            <p class="font-bold">暂无详细内容</p>
          </div>
        </div>
      </div>

      <!-- 3. Discussion Section -->
      <div class="neo-card p-0 bg-white relative">
        <div class="px-6 py-4 border-b-3 border-black bg-neo-purple/20 flex justify-between items-center">
          <h2 class="font-display font-bold text-xl flex items-center">
            <i class="fa-regular fa-comments mr-2"></i> 项目讨论 ({{ commentsCount || 0 }})
          </h2>
          <button 
            v-if="!authStore.isAuthenticated"
            class="bg-black text-white px-3 py-1 text-xs font-bold hover:bg-gray-800 transition"
            @click="$router.push('/login')"
          >
            LOGIN TO POST
          </button>
        </div>

        <div class="p-8 bg-gray-50 flex flex-col items-center justify-center text-center min-h-[200px] dashed-pattern">
          <!-- Comments Section -->
          <CommentsSection 
            :project-id="route.params.id" 
            @comments-updated="handleCommentsUpdated"
          />
        </div>
      </div>
    </div>

    <!-- Project Not Found -->
    <div v-else class="neo-card p-12 text-center">
      <i class="fa-solid fa-exclamation-triangle text-6xl text-gray-400 mb-4"></i>
      <h2 class="text-2xl font-black mb-2">项目不存在</h2>
      <p class="text-gray-600 mb-6">请检查链接是否正确</p>
      <router-link to="/projects" class="neo-btn bg-black text-white px-6 py-3 inline-block">
        返回项目列表
      </router-link>
    </div>

    <!-- Project Edit Dialog -->
    <ProjectEditDialog
      v-model="showEditDialog"
      :project="project"
      @saved="handleProjectSaved"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { showNotification } from '../utils/notification'
import { useAuthStore } from '@/stores/auth'
import axios from '@/utils/axios'
import CommentsSection from '@/components/comment/CommentsSection.vue'
import ProjectEditDialog from '@/components/admin/ProjectEditDialog.vue'
import { renderEnhancedMarkdown } from '@/utils/markdownRenderer'
import { parseDemoLinks, getDemoLinkTitle } from '@/utils/demoLinks'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// 状态
const project = ref(null)
const loading = ref(false)
const showEditDialog = ref(false)
const commentsCount = ref(0)

// 计算属性
const renderedContent = computed(() => {
  if (!project.value?.content) return ''
  return renderEnhancedMarkdown(project.value.content)
})

const demoLinks = computed(() => {
  if (!project.value?.demo_url) return []
  const links = parseDemoLinks(project.value.demo_url)
  return links.map(link => ({
    ...link,
    title: getDemoLinkTitle(link)
  }))
})

// 获取状态名称
const getStatusName = (status) => {
  const statusMap = {
    idea: '构思中',
    planning: '规划中',
    development: '开发中',
    testing: '测试中',
    completed: '已完成',
    deployed: '已部署',
    paused: '已暂停'
  }
  return statusMap[status] || '未知'
}

// 获取状态图标
const getStatusIcon = (status) => {
  const iconMap = {
    idea: 'fa-solid fa-lightbulb',
    planning: 'fa-solid fa-pen-ruler',
    development: 'fa-solid fa-code',
    testing: 'fa-solid fa-bug',
    completed: 'fa-solid fa-check',
    deployed: 'fa-solid fa-rocket',
    paused: 'fa-solid fa-pause'
  }
  return iconMap[status] || 'fa-solid fa-circle'
}

// 获取状态徽章类
const getStatusBadgeClass = (status) => {
  const classMap = {
    idea: 'bg-gray-200 text-gray-800',
    planning: 'bg-blue-200 text-blue-800',
    development: 'bg-neo-purple text-white',
    testing: 'bg-red-200 text-red-800',
    completed: 'bg-neo-green text-black',
    deployed: 'bg-neo-blue text-white',
    paused: 'bg-gray-300 text-gray-800'
  }
  return classMap[status] || 'bg-gray-200 text-gray-800'
}

// 获取优先级名称
const getPriorityName = (priority) => {
  const priorityMap = {
    low: '低',
    medium: '中等',
    high: '高',
    urgent: '紧急'
  }
  return priorityMap[priority] || '中等'
}

// 格式化日期
const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD')
}

// 处理评论更新
const handleCommentsUpdated = (count) => {
  commentsCount.value = count
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

// 处理项目保存
const handleProjectSaved = async (savedProject) => {
  project.value = savedProject
  showEditDialog.value = false
  showNotification.success(t('admin.project_saved'))
}

// 生命周期
onMounted(async () => {
  await fetchProject()
})
</script>

<style lang="scss" scoped>
.neo-btn-primary {
  background-color: #4ADE80;
  border: 2px solid black;
  box-shadow: 4px 4px 0px 0px #000000;
  transition: all 0.1s;
  text-decoration: none;
  color: black;
  font-weight: bold;
  
  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px #000000;
  }
  
  &:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px 0px #000000;
  }
}

.neo-btn-secondary {
  background-color: white;
  border: 2px solid black;
  box-shadow: 4px 4px 0px 0px #000000;
  transition: all 0.1s;
  text-decoration: none;
  color: black;
  font-weight: bold;
  
  &:hover {
    background-color: #f3f4f6;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px #000000;
  }
}

.tech-tag {
  border: 2px solid black;
  padding: 4px 12px;
  font-weight: bold;
  font-size: 0.875rem;
  background: #BEA7FF;
  box-shadow: 2px 2px 0px 0px #000000;
}

.dashed-pattern {
  background-image: linear-gradient(to right, black 50%, transparent 50%);
  background-position: bottom;
  background-size: 16px 2px;
  background-repeat: repeat-x;
}

.prose {
  h3 {
    font-weight: 900;
    font-size: 1.25rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    display: inline-block;
    background: linear-gradient(120deg, #FFD600 0%, #FFD600 100%);
    background-repeat: no-repeat;
    background-size: 100% 40%;
    background-position: 0 88%;
  }
  
  ul {
    list-style-type: none;
    padding-left: 0;
  }
  
  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.6rem;
      width: 0.5rem;
      height: 0.5rem;
      background-color: black;
    }
  }
  
  :deep(p) {
    margin: 1em 0;
  }
  
  :deep(strong) {
    background: #fef3c7;
    padding: 2px 4px;
    border: 1px solid black;
  }
}
</style>
