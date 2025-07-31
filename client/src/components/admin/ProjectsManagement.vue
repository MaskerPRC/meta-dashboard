<template>
  <div class="tab-content">
    <!-- 项目操作工具栏 -->
    <div class="projects-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="projectSearch"
          :placeholder="t('admin.projects.search_placeholder')"
          style="width: 300px"
          clearable
          @input="handleProjectSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="projectStatusFilter"
          :placeholder="t('project.status_filter')"
          clearable
          style="width: 140px"
          @change="handleProjectFilter"
        >
          <el-option :label="t('project.status_options.brainstorming')" value="idea" />
          <el-option :label="t('project.status_options.planning')" value="planning" />
          <el-option :label="t('project.status_options.development')" value="development" />
          <el-option :label="t('project.status_options.testing')" value="testing" />
          <el-option :label="t('project.status_options.deployed')" value="deployed" />
          <el-option :label="t('project.status_options.completed')" value="completed" />
          <el-option :label="t('project.status_options.on_hold')" value="paused" />
        </el-select>
      </div>

      <div class="toolbar-right">
        <el-button @click="exportProjects">
          <el-icon><Download /></el-icon>
          {{ t('admin.projects.export_data') }}
        </el-button>
        <el-button type="danger" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          {{ t('admin.projects.batch_delete') }}
        </el-button>
      </div>
    </div>

    <!-- 项目表格 -->
    <div class="projects-table-container">
      <el-table
        ref="projectsTableRef"
        :data="filteredProjects"
        style="width: 100%"
        @selection-change="handleProjectSelectionChange"
        v-loading="projectsLoading"
        :empty-text="t('admin.projects.empty_text')"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" :label="t('admin.projects.table_headers.id')" width="80" />
        <el-table-column prop="title" :label="t('admin.projects.table_headers.project_name')" min-width="200">
          <template #default="scope">
            <div class="project-title-cell">
              <el-link @click="editProject(scope.row)" type="primary">
                {{ scope.row.title }}
              </el-link>
              <p class="project-desc">{{ scope.row.description }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('admin.projects.table_headers.status')" width="100">
          <template #default="scope">
            <el-tag :class="['status-tag', scope.row.status]" size="small">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" :label="t('admin.projects.table_headers.priority')" width="100">
          <template #default="scope">
            <el-tag :class="['priority-tag', scope.row.priority]" size="small">
              {{ getPriorityName(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" :label="t('admin.projects.table_headers.progress')" width="120">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :stroke-width="6"
              :show-text="true"
              :format="(percentage) => `${percentage}%`"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="t('project.created_at')" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('admin.projects.table_headers.actions')" width="200">
          <template #default="scope">
            <el-button size="small" @click="editProject(scope.row)">
              {{ t('admin.projects.actions.edit') }}
            </el-button>
            <el-button size="small" @click="viewProject(scope.row.id)">
              {{ t('admin.projects.actions.view') }}
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteProject(scope.row)"
            >
              {{ t('admin.projects.actions.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { showNotification } from '../../utils/notification'
import { Search, Download, Delete } from '@element-plus/icons-vue'
import axios from '../../utils/axios'
import dayjs from 'dayjs'

const router = useRouter()
const { t } = useI18n()

// 响应式数据
const projects = ref([])
const projectsLoading = ref(false)
const projectSearch = ref('')
const projectStatusFilter = ref('')
const selectedProjects = ref([])

// 事件定义
const emit = defineEmits(['edit-project', 'stats-updated'])

// 计算属性
const filteredProjects = computed(() => {
  let filtered = projects.value

  if (projectSearch.value) {
    const search = projectSearch.value.toLowerCase()
    filtered = filtered.filter(project =>
      project.title.toLowerCase().includes(search) ||
      project.description.toLowerCase().includes(search)
    )
  }

  if (projectStatusFilter.value) {
    filtered = filtered.filter(project => project.status === projectStatusFilter.value)
  }

  return filtered
})

// 方法
const fetchProjects = async () => {
  try {
    projectsLoading.value = true
    const response = await axios.get('/api/projects', {
      params: { limit: 1000 }
    })
    projects.value = response.data.projects
      } catch (error) {
      console.error('获取项目列表失败:', error)
      showNotification.error(t('admin.projects.messages.fetch_failed'))
    } finally {
    projectsLoading.value = false
  }
}

const handleProjectSearch = () => {
  // 搜索逻辑在计算属性中处理
}

const handleProjectFilter = () => {
  // 筛选逻辑在计算属性中处理
}

const handleProjectSelectionChange = (selection) => {
  selectedProjects.value = selection
}

const editProject = async (project = null) => {
  emit('edit-project', project)
}

const viewProject = (id) => {
  router.push(`/project/${id}`)
}

const deleteProject = async (project) => {
  try {
    await ElMessageBox.confirm(
      t('admin.projects.messages.delete_confirm', { title: project.title }),
      t('admin.projects.messages.delete_title'),
      {
        confirmButtonText: t('admin.projects.actions.delete'),
        cancelButtonText: t('form.cancel'),
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await axios.delete(`/api/projects/${project.id}`)

    // 从列表中移除项目
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value.splice(index, 1)
    }

    showNotification.success(t('admin.projects.messages.delete_success'))
    emit('stats-updated')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error)
      showNotification.error(error.response?.data?.message || t('admin.projects.messages.delete_failed'))
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedProjects.value.length === 0) {
    showNotification.warning(t('admin.projects.messages.batch_delete_warning'))
    return
  }

  try {
    await ElMessageBox.confirm(
      t('admin.projects.messages.batch_delete_confirm', { count: selectedProjects.value.length }),
      t('admin.projects.messages.batch_delete_title'),
      {
        confirmButtonText: t('admin.projects.actions.delete'),
        cancelButtonText: t('form.cancel'),
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    const projectIds = selectedProjects.value.map(p => p.id)
    await axios.delete('/api/admin/projects/batch', {
      data: { ids: projectIds }
    })

    // 从列表中移除已删除的项目
    projects.value = projects.value.filter(p => !projectIds.includes(p.id))
    selectedProjects.value = []

    showNotification.success(t('admin.projects.messages.batch_delete_success'))
    emit('stats-updated')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      showNotification.error(error.response?.data?.message || t('admin.projects.messages.batch_delete_failed'))
    }
  }
}

const exportProjects = async () => {
  try {
    const response = await axios.get('/api/admin/export/projects', {
      responseType: 'blob'
    })

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `projects_export_${dayjs().format('YYYY-MM-DD')}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    showNotification.success(t('admin.projects.messages.export_success'))
  } catch (error) {
    console.error('导出数据失败:', error)
    showNotification.error(t('admin.projects.messages.export_failed'))
  }
}

const handleProjectSaved = async (project) => {
  if (project.id) {
    // 更新现有项目
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = { ...project }
    }
  } else {
    // 添加新项目
    projects.value.unshift(project)
  }
  emit('stats-updated')
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
  return dayjs(date).format('YYYY-MM-DD')
}

// 暴露方法供父组件调用
defineExpose({
  fetchProjects,
  handleProjectSaved
})

// 生命周期
onMounted(fetchProjects)
</script>

<style lang="scss" scoped>
.projects-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .toolbar-left {
    display: flex;
    gap: 12px;
    align-items: center;
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
      justify-content: center;
    }
  }
}

.projects-table-container {
  background: var(--ai-bg-primary);
  border-radius: 8px;
  overflow: hidden;

  .project-title-cell {
    .project-desc {
      font-size: 0.875rem;
      color: var(--ai-text-secondary);
      margin: 4px 0 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}
</style> 