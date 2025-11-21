<template>
  <main class="flex-grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
    <!-- Page Header -->
    <div class="mb-12 flex justify-between items-end border-b-4 border-black pb-4">
      <div>
        <h1 class="text-4xl font-black uppercase tracking-tight mb-2">{{ $t('projects.title') }}</h1>
        <p class="text-gray-600 font-medium">{{ $t('projects.subtitle') }}</p>
      </div>
      <router-link 
        v-if="authStore.isAdmin"
        to="/admin"
        class="neo-btn bg-black text-white px-4 py-2 hover:bg-gray-800"
      >
        <i class="fa-solid fa-cog mr-2"></i>
        {{ $t('admin.title') }}
      </router-link>
    </div>

    <!-- Filter & Search Console -->
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
            <option value="">{{ $t('projects.filter_by_status') }}</option>
            <option value="idea">{{ $t('project.status_options.brainstorming') }}</option>
            <option value="planning">{{ $t('project.status_options.planning') }}</option>
            <option value="development">{{ $t('project.status_options.development') }}</option>
            <option value="testing">{{ $t('project.status_options.testing') }}</option>
            <option value="deployed">{{ $t('project.status_options.deployed') }}</option>
            <option value="completed">{{ $t('project.status_options.completed') }}</option>
            <option value="paused">{{ $t('project.status_options.on_hold') }}</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black border-l-2 border-black bg-neo-yellow">
            <i class="fa-solid fa-caret-down text-xs"></i>
          </div>
        </div>

        <!-- Priority Filter -->
        <div class="relative">
          <select 
            v-model="filters.priority"
            @change="handleFilterChange"
            class="appearance-none bg-gray-100 border-2 border-black px-4 py-2 pr-8 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white cursor-pointer hover:shadow-neo-sm transition text-sm"
          >
            <option value="">{{ $t('projects.filter_by_priority') }}</option>
            <option value="low">{{ $t('project.priority_options.low') }}</option>
            <option value="medium">{{ $t('project.priority_options.medium') }}</option>
            <option value="high">{{ $t('project.priority_options.high') }}</option>
            <option value="critical">{{ $t('project.priority_options.urgent') }}</option>
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
            :placeholder="$t('projects.search_placeholder')"
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
        <!-- Sort -->
        <div class="relative">
          <select 
            v-model="sortBy"
            @change="handleSortChange"
            class="appearance-none bg-gray-100 border-2 border-black px-4 py-2 pr-8 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white cursor-pointer hover:shadow-neo-sm transition text-sm"
          >
            <option value="created_at">创建时间</option>
            <option value="updated_at">最近更新</option>
            <option value="title">项目名称</option>
            <option value="progress">进度排序</option>
            <option value="likes_count">点赞数量</option>
            <option value="priority">优先级</option>
            <option value="status">状态</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black border-l-2 border-black bg-neo-yellow">
            <i class="fa-solid fa-caret-down text-xs"></i>
          </div>
        </div>

        <!-- Sort Order -->
        <button 
          @click="toggleSortOrder"
          class="w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center hover:bg-gray-100 transition shadow-neo-sm"
        >
          <i :class="sortOrder === 'desc' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up'" class="text-sm"></i>
        </button>

        <!-- View Toggle -->
        <div class="flex border-2 border-black rounded overflow-hidden">
          <button 
            @click="viewMode = 'grid'"
            :class="viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-black'"
            class="px-3 py-2 font-bold text-sm transition"
          >
            <i class="fa-solid fa-grid-2"></i>
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-black'"
            class="px-3 py-2 font-bold text-sm border-l-2 border-black transition"
          >
            <i class="fa-solid fa-list"></i>
          </button>
        </div>

        <!-- Reset -->
        <button 
          @click="resetFilters"
          class="neo-btn bg-white px-4 py-2 text-black hover:bg-gray-100 text-sm"
        >
          <i class="fa-solid fa-rotate mr-1"></i>
          {{ $t('form.reset') }}
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="flex gap-6 mb-8">
      <div class="neo-card px-6 py-3 bg-white flex items-center gap-3">
        <div class="w-10 h-10 bg-neo-blue border-2 border-black flex items-center justify-center text-xl">
          <i class="fa-solid fa-folder"></i>
        </div>
        <div>
          <div class="text-xs font-bold text-gray-500 uppercase">Total</div>
          <div class="font-mono font-black text-xl">{{ projectsStore.stats.totalProjects || projectsStore.pagination.total || 0 }}</div>
        </div>
      </div>
      <div class="neo-card px-6 py-3 bg-white flex items-center gap-3">
        <div class="w-10 h-10 bg-neo-green border-2 border-black flex items-center justify-center text-xl">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <div>
          <div class="text-xs font-bold text-gray-500 uppercase">Progress</div>
          <div class="font-mono font-black text-xl">{{ projectsStore.totalProgress || 0 }}%</div>
        </div>
      </div>
    </div>

    <!-- Projects Grid/List -->
    <div v-if="!projectsStore.loading" class="mb-8">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProjectCard
          v-for="project in projectsStore.projects"
          :key="project.id"
          :project="project"
          @click="goToProject(project.id)"
        />
      </div>

      <!-- List View -->
      <div v-else class="space-y-4">
        <div
          v-for="project in projectsStore.projects"
          :key="project.id"
          class="neo-card p-6 bg-white cursor-pointer hover:translate-x-1 transition-transform"
          @click="goToProject(project.id)"
        >
          <div class="flex flex-col md:flex-row md:items-center gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-black">{{ project.title }}</h3>
                <span 
                  class="px-2 py-1 text-xs font-bold border-2 border-black rounded"
                  :class="getStatusBadgeClass(project.status)"
                >
                  {{ getStatusName(project.status) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ project.description }}</p>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tech in (project.tech_stack || []).slice(0, 3)"
                  :key="tech"
                  class="text-xs font-bold border border-black px-2 py-1 rounded bg-gray-100"
                >
                  {{ tech }}
                </span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <div class="text-right">
                <div class="text-xs font-bold text-gray-500 mb-1">进度</div>
                <div class="font-mono font-black text-2xl">{{ project.progress || 0 }}%</div>
              </div>
              <div class="h-4 w-32 border-2 border-black rounded-full bg-white overflow-hidden p-[1px]">
                <div 
                  class="h-full rounded-full stripe-progress"
                  :class="getProgressColorClass(project.progress)"
                  :style="{ width: `${project.progress || 0}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="projectsStore.projects.length === 0" class="text-center py-16">
        <i class="fa-solid fa-inbox text-6xl text-gray-400 mb-4"></i>
        <p class="text-lg font-bold text-gray-600 mb-4">{{ $t('message.no_data') }}</p>
        <button 
          v-if="authStore.isAdmin"
          @click="$router.push('/admin')"
          class="neo-btn bg-black text-white px-6 py-3"
        >
          创建新项目
        </button>
        <button 
          v-else
          @click="resetFilters"
          class="neo-btn bg-white px-6 py-3"
        >
          {{ $t('form.reset') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="neo-card p-12">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="projectsStore.pagination.total > 0" class="flex justify-center mb-8">
      <div class="neo-card p-4 bg-white inline-flex items-center gap-4">
        <button 
          @click="handleCurrentChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span class="font-mono font-bold">
          第 {{ currentPage }} / {{ Math.ceil(projectsStore.pagination.total / pageSize) }} 页
        </span>
        <button 
          @click="handleCurrentChange(currentPage + 1)"
          :disabled="currentPage >= Math.ceil(projectsStore.pagination.total / pageSize)"
          class="w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '../stores/projects'
import { useAuthStore } from '../stores/auth'
import ProjectCard from '../components/project/ProjectCard.vue'

const router = useRouter()
const { t } = useI18n()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

// 响应式数据
const viewMode = ref('grid')
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const sortBy = ref('updated_at')
const sortOrder = ref('desc')

const filters = ref({
  status: '',
  priority: '',
  search: ''
})

// 方法
const handleFilterChange = () => {
  currentPage.value = 1
  fetchProjects()
}

const handleSearch = () => {
  filters.value.search = searchText.value
  currentPage.value = 1
  fetchProjects()
}

const resetFilters = () => {
  filters.value = {
    status: '',
    priority: '',
    search: ''
  }
  searchText.value = ''
  sortBy.value = 'updated_at'
  sortOrder.value = 'desc'
  currentPage.value = 1
  fetchProjects()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchProjects()
}

const handleCurrentChange = (page) => {
  if (page < 1 || page > Math.ceil(projectsStore.pagination.total / pageSize.value)) return
  currentPage.value = page
  fetchProjects()
}

const handleSortChange = () => {
  currentPage.value = 1
  fetchProjects()
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  currentPage.value = 1
  fetchProjects()
}

const fetchProjects = () => {
  projectsStore.setFilters({
    ...filters.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value
  })
  projectsStore.setPagination({
    page: currentPage.value,
    limit: pageSize.value
  })
  projectsStore.fetchProjects()
}

const goToProject = (id) => {
  router.push(`/project/${id}`)
}

const getStatusName = (status) => {
  const statusMap = {
    idea: 'brainstorming',
    planning: 'planning',
    development: 'development',
    testing: 'testing',
    deployed: 'deployed',
    completed: 'completed',
    paused: 'on_hold'
  }
  const translationKey = statusMap[status] || 'brainstorming'
  return t(`project.status_options.${translationKey}`)
}

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

const getProgressColorClass = (progress) => {
  if (progress >= 100) return 'bg-neo-green'
  if (progress >= 70) return 'bg-neo-blue'
  if (progress >= 30) return 'bg-neo-purple'
  return 'bg-neo-red'
}

// 生命周期
onMounted(async () => {
  await projectsStore.fetchStats()
  fetchProjects()
})

// 监听路由变化
watch(() => router.currentRoute.value.query, (newQuery) => {
  if (newQuery.status) {
    filters.value.status = newQuery.status
  }
  if (newQuery.search) {
    filters.value.search = newQuery.search
    searchText.value = newQuery.search
  }
  fetchProjects()
}, { immediate: true })
</script>

<style lang="scss" scoped>
// 响应式
@media (max-width: 768px) {
  main {
    padding-top: 6rem;
  }
}
</style>
