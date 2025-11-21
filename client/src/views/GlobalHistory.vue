<template>
  <main class="flex-grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
    <!-- Header & Description -->
    <div class="text-center mb-12">
      <h1 class="font-display font-black text-5xl mb-4 bg-white border-4 border-black inline-block px-6 py-2 shadow-neo transform -rotate-1">
        {{ $t('global_history.title') }}
      </h1>
      <p class="text-gray-600 font-medium text-lg mt-4 max-w-2xl mx-auto bg-white/80 p-2 border-2 border-black border-dashed">
        <i class="fa-solid fa-terminal mr-2"></i>
        {{ $t('global_history.subtitle') }}
      </p>
    </div>

    <!-- Filter & Stats Console "Control Panel" -->
    <div class="neo-card p-4 mb-12 bg-white flex flex-col md:flex-row justify-between items-center gap-4 rounded-lg relative">
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

      <div class="flex items-center gap-4 w-full md:w-auto z-10">
        <span class="font-bold font-mono uppercase text-sm bg-black text-white px-2 py-1">Filter:</span>
        <div class="relative w-full md:w-64">
          <select 
            v-model="filterType"
            @change="handleFilterChange"
            class="w-full appearance-none bg-gray-100 border-2 border-black px-4 py-2 pr-8 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white cursor-pointer hover:shadow-neo-sm transition"
          >
            <option value="">{{ $t('global_history.all_types') }}</option>
            <option value="status_change">{{ $t('global_history.record_types.status_change') }}</option>
            <option value="progress_update">{{ $t('global_history.record_types.progress_update') }}</option>
            <option value="progress_log">{{ $t('global_history.record_types.progress_log') }}</option>
            <option value="manual_note">{{ $t('global_history.record_types.manual_record') }}</option>
            <option value="milestone">{{ $t('global_history.record_types.milestone') }}</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black border-l-2 border-black bg-neo-yellow">
            <i class="fa-solid fa-caret-down"></i>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 z-10">
        <div class="text-right">
          <div class="text-xs font-bold text-gray-500 uppercase">Total Records</div>
          <div class="font-mono font-black text-xl tabular-nums">{{ pagination.total || 0 }}</div>
        </div>
        <div class="w-10 h-10 bg-neo-green border-2 border-black flex items-center justify-center text-xl">
          <i class="fa-solid fa-database"></i>
        </div>
      </div>
    </div>

    <!-- Timeline Container -->
    <div class="relative pl-2 md:pl-4" v-loading="loading">
      <!-- The Thick Line -->
      <div class="timeline-line"></div>

      <!-- Timeline Items -->
      <div 
        v-for="history in histories" 
        :key="history.id" 
        class="relative mb-10 pl-12 md:pl-16 group"
        @click="navigateToProject(history.project_id)"
      >
        <!-- Icon Node -->
        <div 
          class="absolute left-0 top-0 w-14 h-14 border-4 border-black rounded-lg flex items-center justify-center z-10 shadow-[2px_2px_0_0_white] group-hover:scale-110 transition-transform"
          :class="getIconBgClass(history.type)"
        >
          <i :class="getTypeIcon(history.type)" class="text-2xl text-black"></i>
        </div>

        <!-- The Card -->
        <div class="neo-card p-0 rounded-lg bg-white hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <!-- Card Header -->
          <div 
            class="border-b-3 border-black px-5 py-3 flex flex-wrap justify-between items-center gap-2"
            :class="getHeaderBgClass(history.type)"
          >
            <div class="flex flex-wrap items-center gap-3">
              <div 
                class="neo-badge shadow-[2px_2px_0_0_black]"
                :class="getBadgeClass(history.type)"
              >
                {{ getTypeLabel(history.type) }}
              </div>
              <h3 class="text-xl font-black font-display">{{ history.project_name || history.project_title }}</h3>
            </div>
            <div class="font-mono text-sm font-bold text-gray-500 bg-white border-2 border-black px-2 py-0.5 shadow-neo-sm">
              {{ formatDate(history.created_at) }}
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-5">
            <p class="font-medium text-gray-600 mb-4">{{ history.title }}</p>

            <!-- Status Change Visual -->
            <div v-if="history.type === 'status_change'" class="flex items-center gap-4 bg-gray-100 border-2 border-black p-4 rounded max-w-md border-dashed">
              <div class="px-3 py-1 bg-purple-200 text-purple-800 border-2 border-purple-800 font-mono font-bold rounded">
                {{ history.status_before || 'idea' }}
              </div>
              <i class="fa-solid fa-arrow-right-long text-2xl text-black"></i>
              <div class="px-3 py-1 bg-neo-green text-black border-2 border-black font-mono font-bold rounded shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]">
                {{ history.status_after || 'development' }}
              </div>
            </div>

            <!-- Progress Update Visual -->
            <div v-else-if="history.type === 'progress_update'" class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-sm uppercase tracking-wider">Progress Leap</span>
                <span class="font-black text-neo-green text-xl bg-black px-2">
                  +{{ (history.progress_after || 0) - (history.progress_before || 0) }}%
                </span>
              </div>
              <div class="relative h-8 bg-gray-200 border-2 border-black rounded-full overflow-hidden mb-4">
                <div 
                  class="absolute h-full bg-neo-green opacity-30 border-r-2 border-black border-dashed" 
                  :style="{ width: `${history.progress_before || 0}%` }"
                ></div>
                <div class="absolute inset-0 flex items-center justify-between px-4 font-mono font-bold text-xs z-10">
                  <span>{{ history.progress_before || 0 }}%</span>
                  <span>{{ history.progress_after || 0 }}%</span>
                </div>
              </div>
            </div>

            <!-- Progress Log / Code Style -->
            <div v-else-if="history.type === 'progress_log'" class="font-mono text-sm bg-gray-900 text-green-400 p-4 border-2 border-gray-700 rounded-md shadow-inner">
              <div class="flex gap-2 mb-2 border-b border-gray-700 pb-2">
                <span class="text-red-400">●</span>
                <span class="text-yellow-400">●</span>
                <span class="text-green-400">●</span>
              </div>
              <div v-html="renderMarkdown(history.content)"></div>
            </div>

            <!-- Completed Event -->
            <div v-else-if="history.type === 'milestone'" class="relative overflow-hidden mb-4">
              <div class="absolute right-0 top-0 w-20 h-20 bg-neo-yellow opacity-20 rounded-full blur-xl"></div>
              <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-black text-white p-4 border-2 border-black shadow-neo-sm mb-4 relative z-10">
                <div class="text-4xl text-neo-yellow"><i class="fa-solid fa-check-double"></i></div>
                <div>
                  <div class="text-xs text-gray-400 font-mono mb-1">MILESTONE</div>
                  <div class="font-bold text-lg">Project Completed</div>
                </div>
              </div>
            </div>

            <!-- Generic Content -->
            <div v-else v-html="renderMarkdown(history.content)" class="text-sm text-gray-800 font-medium"></div>

            <!-- Footer -->
            <div class="mt-5 flex justify-between items-center pt-4 border-t-2 border-gray-100">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-black rounded-full border border-black"></div>
                <span class="font-bold text-sm">{{ history.creator_name || 'System' }}</span>
              </div>
              <a 
                href="#" 
                @click.stop="navigateToProject(history.project_id)"
                class="font-bold text-sm border-b-2 border-black hover:bg-neo-yellow transition-colors"
              >
                查看详情 <i class="fa-solid fa-eye"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && histories.length === 0" class="text-center py-12">
        <i class="fa-solid fa-inbox text-6xl text-gray-400 mb-4"></i>
        <p class="text-lg font-bold text-gray-600">{{ $t('message.no_data') }}</p>
      </div>

      <!-- Load More -->
      <div v-if="histories.length > 0 && pagination.pages > currentPage" class="pl-16 pb-12">
        <button 
          @click="loadMore"
          class="w-full bg-white border-2 border-black border-dashed py-4 text-gray-500 font-bold hover:bg-gray-50 hover:text-black hover:border-solid transition-all"
        >
          <i class="fa-solid fa-arrow-down mr-2"></i> 加载更早的历史记录
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showNotification } from '../utils/notification'
import { renderEnhancedMarkdown } from '@/utils/markdownRenderer'
import dayjs from 'dayjs'
import axios from '../utils/axios'

const router = useRouter()
const { t } = useI18n()

// 响应式数据
const histories = ref([])
const loading = ref(false)
const filterType = ref('')

// 分页数据
const currentPage = ref(1)
const pageSize = ref(20)
const pagination = reactive({
  total: 0,
  pages: 0
})

// 获取全局历史数据
const fetchGlobalHistory = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    if (filterType.value) {
      params.type = filterType.value
    }
    
    const response = await axios.get('/api/project-history/global/all', { params })
    if (currentPage.value === 1) {
      histories.value = response.data.histories
    } else {
      histories.value.push(...response.data.histories)
    }
    Object.assign(pagination, response.data.pagination)
  } catch (error) {
    console.error('获取全局历史失败:', error)
    showNotification.error(t('message.error'))
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  currentPage.value++
  fetchGlobalHistory()
}

// 处理筛选变更
const handleFilterChange = () => {
  currentPage.value = 1
  fetchGlobalHistory()
}

// 跳转到项目详情
const navigateToProject = (projectId) => {
  router.push(`/project/${projectId}`)
}

// 获取图标背景类
const getIconBgClass = (type) => {
  const classMap = {
    'progress_update': 'bg-neo-green',
    'status_change': 'bg-neo-orange',
    'progress_log': 'bg-neo-purple',
    'manual_note': 'bg-neo-blue',
    'milestone': 'bg-neo-yellow'
  }
  return classMap[type] || 'bg-gray-400'
}

// 获取头部背景类
const getHeaderBgClass = (type) => {
  const classMap = {
    'progress_update': 'bg-green-50',
    'status_change': 'bg-orange-50',
    'progress_log': 'bg-purple-50',
    'manual_note': 'bg-blue-50',
    'milestone': 'bg-yellow-50/50'
  }
  return classMap[type] || 'bg-gray-50'
}

// 获取徽章类
const getBadgeClass = (type) => {
  const classMap = {
    'progress_update': 'bg-neo-green text-black',
    'status_change': 'bg-neo-orange text-black',
    'progress_log': 'bg-neo-purple text-white',
    'manual_note': 'bg-neo-blue text-white',
    'milestone': 'bg-neo-yellow text-black'
  }
  return classMap[type] || 'bg-gray-400 text-black'
}

// 获取类型图标
const getTypeIcon = (type) => {
  const iconMap = {
    'progress_update': 'fa-solid fa-chart-line',
    'status_change': 'fa-solid fa-arrows-spin',
    'progress_log': 'fa-solid fa-file-code',
    'manual_note': 'fa-solid fa-file-lines',
    'milestone': 'fa-solid fa-trophy'
  }
  return iconMap[type] || 'fa-solid fa-circle'
}

// 获取类型标签文本
const getTypeLabel = (type) => {
  const typeMap = {
    'progress_update': '进度更新',
    'status_change': '状态变更',
    'progress_log': '进度日志',
    'manual_note': '手动记录',
    'milestone': '项目完结'
  }
  return typeMap[type] || '记录'
}

// 格式化日期
const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

// 渲染Markdown
const renderMarkdown = (content) => {
  if (!content) return ''
  return renderEnhancedMarkdown(content)
}

// 生命周期
onMounted(() => {
  fetchGlobalHistory()
})
</script>

<style lang="scss" scoped>
.timeline-line {
  position: absolute;
  left: 28px;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #000;
  z-index: 0;
}

.neo-badge {
  border: 2px solid black;
  font-weight: bold;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 9999px;
}

// 响应式
@media (max-width: 768px) {
  .timeline-line {
    left: 20px;
  }
}
</style>
