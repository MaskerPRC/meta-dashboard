<template>
  <main class="flex-grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
    <div class="text-center">
      <!-- 404 Visual -->
      <div class="mb-12">
        <div class="flex justify-center items-center gap-4 mb-6">
          <span class="text-9xl font-black text-black">4</span>
          <div class="w-24 h-24 bg-neo-yellow border-4 border-black rounded-lg flex items-center justify-center transform rotate-12 shadow-neo">
            <i class="fa-solid fa-exclamation text-5xl text-black"></i>
          </div>
          <span class="text-9xl font-black text-black">4</span>
        </div>
        <div class="neo-card p-6 bg-white inline-block">
          <h1 class="text-4xl font-black mb-2">页面找不到了</h1>
          <p class="text-gray-600 font-medium">
            抱歉，您访问的页面可能已被删除、重命名或暂时不可用。
            <br>
            让我们帮您找到正确的路径吧！
          </p>
        </div>
      </div>

      <!-- Search -->
      <div class="neo-card p-6 bg-white mb-8 max-w-md mx-auto">
        <div class="relative">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索AI项目、标签或关键词..."
            class="w-full bg-gray-100 border-2 border-black px-4 py-3 pr-12 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
          />
          <button 
            @click="handleSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-neo-yellow border-2 border-black rounded flex items-center justify-center hover:bg-yellow-400 transition"
          >
            <i class="fa-solid fa-search"></i>
          </button>
        </div>
      </div>

      <!-- Navigation Suggestions -->
      <div class="mb-12">
        <h3 class="text-2xl font-black mb-6 bg-white border-2 border-black inline-block px-4 py-1 shadow-neo-sm transform -rotate-1">
          您可能想要访问：
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <router-link 
            to="/" 
            class="neo-card p-6 bg-white text-center hover:translate-x-1 transition-transform cursor-pointer"
          >
            <div class="w-16 h-16 bg-neo-blue border-4 border-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fa-solid fa-house text-3xl text-black"></i>
            </div>
            <h4 class="text-lg font-black mb-2">首页</h4>
            <p class="text-sm text-gray-600">查看AI挑战概览和最新项目</p>
          </router-link>

          <router-link 
            to="/projects" 
            class="neo-card p-6 bg-white text-center hover:translate-x-1 transition-transform cursor-pointer"
          >
            <div class="w-16 h-16 bg-neo-green border-4 border-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fa-solid fa-list text-3xl text-black"></i>
            </div>
            <h4 class="text-lg font-black mb-2">项目列表</h4>
            <p class="text-sm text-gray-600">浏览所有AI项目的完整列表</p>
          </router-link>

          <router-link 
            to="/about" 
            class="neo-card p-6 bg-white text-center hover:translate-x-1 transition-transform cursor-pointer"
          >
            <div class="w-16 h-16 bg-neo-purple border-4 border-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fa-solid fa-info text-3xl text-black"></i>
            </div>
            <h4 class="text-lg font-black mb-2">关于挑战</h4>
            <p class="text-sm text-gray-600">了解100个AI产品挑战的详情</p>
          </router-link>

          <div 
            v-if="randomProject" 
            @click="goToRandomProject"
            class="neo-card p-6 bg-white text-center hover:translate-x-1 transition-transform cursor-pointer"
          >
            <div class="w-16 h-16 bg-neo-yellow border-4 border-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <i class="fa-solid fa-wand-magic-sparkles text-3xl text-black"></i>
            </div>
            <h4 class="text-lg font-black mb-2">随机项目</h4>
            <p class="text-sm text-gray-600">{{ randomProject.title }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Projects -->
      <div v-if="recentProjects.length > 0" class="mb-12">
        <h3 class="text-2xl font-black mb-6 bg-white border-2 border-black inline-block px-4 py-1 shadow-neo-sm transform rotate-1">
          最新AI项目
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="project in recentProjects.slice(0, 3)" 
            :key="project.id"
            class="neo-card p-6 bg-white cursor-pointer hover:translate-x-1 transition-transform"
            @click="goToProject(project.id)"
          >
            <div class="flex items-center gap-3 mb-3">
              <span 
                class="px-2 py-1 text-xs font-bold border-2 border-black rounded"
                :class="getStatusBadgeClass(project.status)"
              >
                {{ getStatusName(project.status) }}
              </span>
            </div>
            <h4 class="text-lg font-black mb-2">{{ project.title }}</h4>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ project.description }}</p>
            <div class="flex justify-between items-center text-xs font-bold text-gray-500">
              <span>进度: {{ project.progress }}%</span>
              <span>{{ formatDate(project.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Back Actions -->
      <div class="flex justify-center gap-4">
        <button 
          @click="goBack"
          class="neo-btn bg-white px-6 py-3 hover:bg-gray-100"
        >
          <i class="fa-solid fa-arrow-left mr-2"></i>
          返回上一页
        </button>
        <router-link to="/" class="neo-btn bg-black text-white px-6 py-3 hover:bg-gray-800">
          <i class="fa-solid fa-house mr-2"></i>
          回到首页
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '../stores/projects'
import { showNotification } from '../utils/notification'
import dayjs from 'dayjs'

const router = useRouter()
const projectsStore = useProjectsStore()

const searchQuery = ref('')

// 计算属性
const recentProjects = computed(() => projectsStore.projects.slice(0, 6))
const randomProject = computed(() => {
  const projects = projectsStore.projects
  if (projects.length === 0) return null
  return projects[Math.floor(Math.random() * projects.length)]
})

// 方法
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    showNotification.warning('请输入搜索关键词')
    return
  }
  
  router.push({
    path: '/projects',
    query: {
      search: searchQuery.value.trim()
    }
  })
}

const goToProject = (id) => {
  router.push(`/project/${id}`)
}

const goToRandomProject = () => {
  if (randomProject.value) {
    goToProject(randomProject.value.id)
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
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

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

// 生命周期
onMounted(() => {
  if (projectsStore.projects.length === 0) {
    projectsStore.fetchProjects({ limit: 10 })
  }
})
</script>

<style lang="scss" scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
