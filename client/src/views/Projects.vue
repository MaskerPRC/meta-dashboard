<template>
  <div class="projects-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">{{ $t('projects.title') }}</h1>
          <p class="page-subtitle">{{ $t('projects.subtitle') }}</p>
        </div>
        
        <!-- 管理员按钮 -->
        <div v-if="authStore.isAdmin" class="header-actions">
          <router-link to="/admin">
            <el-button type="primary">
              <el-icon><Setting /></el-icon>
              {{ $t('admin.title') }}
            </el-button>
          </router-link>
        </div>
      </div>

      <!-- 筛选和搜索工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <!-- 状态筛选 -->
          <el-select
            v-model="filters.status"
            :placeholder="$t('projects.filter_by_status')"
            clearable
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option :label="$t('project.status_options.brainstorming')" value="idea" />
            <el-option :label="$t('project.status_options.planning')" value="planning" />
            <el-option :label="$t('project.status_options.development')" value="development" />
            <el-option :label="$t('project.status_options.testing')" value="testing" />
            <el-option :label="$t('project.status_options.deployed')" value="deployed" />
            <el-option :label="$t('project.status_options.completed')" value="completed" />
            <el-option :label="$t('project.status_options.on_hold')" value="paused" />
          </el-select>

          <!-- 优先级筛选 -->
          <el-select
            v-model="filters.priority"
            :placeholder="$t('projects.filter_by_priority')"
            clearable
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option :label="$t('project.priority_options.low')" value="low" />
            <el-option :label="$t('project.priority_options.medium')" value="medium" />
            <el-option :label="$t('project.priority_options.high')" value="high" />
            <el-option :label="$t('project.priority_options.urgent')" value="critical" />
          </el-select>

          <!-- 搜索框 -->
          <el-input
            v-model="searchText"
            :placeholder="$t('projects.search_placeholder')"
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
            {{ $t('form.search') }}
          </el-button>
        </div>

        <div class="toolbar-right">
          <!-- 视图切换 -->
          <el-button-group>
            <el-button
              :type="viewMode === 'grid' ? 'primary' : 'default'"
              @click="viewMode = 'grid'"
            >
              <el-icon><Grid /></el-icon>
            </el-button>
            <el-button
              :type="viewMode === 'list' ? 'primary' : 'default'"
              @click="viewMode = 'list'"
            >
              <el-icon><List /></el-icon>
            </el-button>
          </el-button-group>

          <!-- 重置筛选 -->
          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            {{ $t('form.reset') }}
          </el-button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-bar">
        <div class="stats-item">
          <span class="stats-label">{{ $t('projects.total_projects') }}：</span>
          <span class="stats-value">{{ projectsStore.stats.totalProjects || projectsStore.pagination.total }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">{{ $t('projects.average_progress') }}：</span>
          <span class="stats-value">{{ projectsStore.totalProgress }}%</span>
        </div>
      </div>

      <!-- 项目列表 -->
      <div v-if="!projectsStore.loading" class="projects-container">
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="projects-grid">
          <ProjectCard
            v-for="project in projectsStore.projects"
            :key="project.id"
            :project="project"
            @click="goToProject(project.id)"
          />
        </div>

        <!-- 列表视图 -->
        <div v-else class="projects-list">
          <el-table
            :data="projectsStore.projects"
            style="width: 100%"
            @row-click="handleRowClick"
            class="projects-table"
          >
            <el-table-column prop="title" :label="$t('project.title')" min-width="200">
              <template #default="scope">
                <div class="project-title-cell">
                  <h4>{{ scope.row.title }}</h4>
                  <p class="description">{{ scope.row.description }}</p>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" :label="$t('project.status')" width="100">
              <template #default="scope">
                <el-tag :class="['status-tag', scope.row.status]" size="small">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="priority" :label="$t('project.priority')" width="100">
              <template #default="scope">
                <el-tag :class="['priority-tag', scope.row.priority]" size="small">
                  {{ getPriorityName(scope.row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="progress" :label="$t('home.progress')" width="120">
              <template #default="scope">
                <el-progress 
                  :percentage="scope.row.progress" 
                  :stroke-width="6"
                  :show-text="true"
                  :format="(percentage) => `${percentage}%`"
                />
              </template>
            </el-table-column>
            
            <el-table-column prop="tech_stack" label="技术栈" min-width="200">
              <template #default="scope">
                <div class="tech-stack-cell">
                  <el-tag
                    v-for="tech in scope.row.tech_stack.slice(0, 3)"
                    :key="tech"
                    size="small"
                    type="info"
                    class="tech-tag"
                  >
                    {{ tech }}
                  </el-tag>
                  <span v-if="scope.row.tech_stack.length > 3" class="more-tech">
                    +{{ scope.row.tech_stack.length - 3 }}
                  </span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="created_at" :label="$t('project.created_at')" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 空状态 -->
        <div v-if="projectsStore.projects.length === 0" class="empty-state">
          <el-empty :description="$t('message.no_data')">
            <el-button type="primary" @click="resetFilters">{{ $t('form.reset') }}</el-button>
          </el-empty>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 分页 -->
      <div v-if="projectsStore.pagination.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="projectsStore.pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 微信交流群 -->
      <div class="wechat-group-wrapper">
        <WechatGroup :is-compact="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '../stores/projects'
import { useAuthStore } from '../stores/auth'
import ProjectCard from '../components/project/ProjectCard.vue'
import WechatGroup from '../components/common/WechatGroup.vue'
import dayjs from 'dayjs'
import {
  Setting, Search, Grid, List, Refresh
} from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

// 响应式数据
const viewMode = ref('grid')
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

const filters = ref({
  status: '',
  priority: '',
  search: ''
})

// 计算属性
const searchPlaceholder = computed(() => {
  return `${t('form.search')}${projectsStore.pagination.total}${t('projects.total_projects')}...`
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
  currentPage.value = 1
  fetchProjects()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchProjects()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchProjects()
}

const fetchProjects = () => {
  projectsStore.setFilters(filters.value)
  projectsStore.setPagination({
    page: currentPage.value,
    limit: pageSize.value
  })
  projectsStore.fetchProjects()
}

const goToProject = (id) => {
  router.push(`/project/${id}`)
}

const handleRowClick = (row) => {
  goToProject(row.id)
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

const getPriorityName = (priority) => {
  const priorityMap = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'urgent'
  }
  const translationKey = priorityMap[priority] || 'medium'
  return t(`project.priority_options.${translationKey}`)
}

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

// 生命周期
onMounted(async () => {
  // 获取统计数据
  await projectsStore.fetchStats()
  
  // 获取项目列表
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
.projects-page {
  min-height: calc(100vh - 70px);
  background: var(--ai-bg-secondary);
  
  .container {
    padding: 40px 20px;
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
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
    background: var(--ai-bg-primary);
    border-radius: 12px;
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
      align-items: center;
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
      
      .toolbar-left,
      .toolbar-right {
        width: 100%;
        justify-content: center;
      }
    }
  }
  
  .stats-bar {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    
    .stats-item {
      .stats-label {
        color: var(--ai-text-secondary);
        font-size: 0.875rem;
      }
      
      .stats-value {
        color: var(--ai-primary);
        font-weight: 600;
        font-size: 0.875rem;
      }
    }
  }
  
  .projects-container {
    margin-bottom: 32px;
    
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    
    .projects-list {
      .projects-table {
        background: var(--ai-bg-primary);
        border-radius: 12px;
        overflow: hidden;
        
        .project-title-cell {
          h4 {
            margin: 0 0 4px;
            font-size: 1rem;
            color: var(--ai-text-primary);
          }
          
          .description {
            margin: 0;
            font-size: 0.875rem;
            color: var(--ai-text-secondary);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
        
        .tech-stack-cell {
          display: flex;
          gap: 4px;
          align-items: center;
          flex-wrap: wrap;
          
          .tech-tag {
            font-size: 12px;
          }
          
          .more-tech {
            font-size: 12px;
            color: var(--ai-text-secondary);
          }
        }
      }
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }
  }
  
  .loading-container {
    padding: 40px;
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }

  .wechat-group-wrapper {
    margin-top: 40px;
    padding-top: 40px;
    border-top: 1px solid var(--ai-border);
  }
}
</style> 