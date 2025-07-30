<template>
  <div class="tab-content">
    <!-- 简历操作工具栏 -->
    <div class="resumes-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="resumeSearch"
          placeholder="搜索简历标题或用户名..."
          style="width: 300px"
          clearable
          @input="handleResumeSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="resumeStatusFilter"
          placeholder="筛选状态"
          clearable
          style="width: 140px"
          @change="handleStatusFilter"
        >
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </div>

      <div class="toolbar-right">
        <el-button @click="refreshResumes">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button @click="exportResumes">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 简历表格 -->
    <div class="resumes-table-container">
      <el-table
        :data="filteredResumes"
        style="width: 100%"
        v-loading="resumesLoading"
        empty-text="暂无简历数据"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="title" label="简历标题" min-width="200">
          <template #default="scope">
            <div class="resume-title">
              <span class="title-text">{{ scope.row.title }}</span>
              <el-tag v-if="scope.row.is_public" type="success" size="small" style="margin-left: 8px">
                公开
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="用户信息" min-width="180">
          <template #default="scope">
            <div class="user-info">
              <div class="user-name">{{ scope.row.username }}</div>
              <div class="user-display-name" v-if="scope.row.display_name">
                {{ scope.row.display_name }}
              </div>
              <div class="user-email">{{ scope.row.email }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.status)"
              size="small"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="current_version" label="版本" width="80">
          <template #default="scope">
            v{{ scope.row.current_version }}
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column prop="updated_at" label="更新时间" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.updated_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewResume(scope.row)">
              查看
            </el-button>
            <el-button size="small" @click="viewVersions(scope.row)">
              版本
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="archiveResume(scope.row)"
              v-if="scope.row.status !== 'archived'"
            >
              归档
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :small="false"
        :disabled="resumesLoading"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalResumes"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>

  <!-- 简历详情对话框 -->
  <el-dialog
    v-model="showResumeDetail"
    title="简历详情"
    width="80%"
    class="resume-detail-dialog"
  >
    <div v-if="selectedResume" class="resume-detail">
      <div class="resume-header">
        <h3>{{ selectedResume.title }}</h3>
        <div class="resume-meta">
          <el-tag :type="getStatusTagType(selectedResume.status)">
            {{ getStatusText(selectedResume.status) }}
          </el-tag>
          <span class="version">v{{ selectedResume.current_version }}</span>
          <span class="date">{{ formatDate(selectedResume.updated_at) }}</span>
        </div>
      </div>
      <div class="resume-content">
        <div class="markdown-preview" v-html="renderedContent"></div>
      </div>
    </div>
  </el-dialog>

  <!-- 版本历史对话框 -->
  <el-dialog
    v-model="showVersionHistory"
    title="版本历史"
    width="70%"
    class="version-history-dialog"
  >
    <div v-if="versions.length > 0">
      <el-timeline>
        <el-timeline-item
          v-for="version in versions"
          :key="version.id"
          :timestamp="formatDate(version.created_at)"
          placement="top"
        >
          <div class="version-item">
            <div class="version-header">
              <span class="version-number">v{{ version.version }}</span>
              <span class="version-title">{{ version.title }}</span>
              <span class="version-author" v-if="version.created_by_name">
                by {{ version.created_by_name }}
              </span>
            </div>
            <div class="version-description" v-if="version.change_description">
              {{ version.change_description }}
            </div>
            <div class="version-actions">
              <el-button size="small" @click="viewVersionContent(version)">
                查看内容
              </el-button>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
    <el-empty v-else description="暂无版本历史" />
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { marked } from 'marked'
import axios from '../../utils/axios'
import dayjs from 'dayjs'

const { t } = useI18n()

// 响应式数据
const resumes = ref([])
const resumesLoading = ref(false)
const resumeSearch = ref('')
const resumeStatusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalResumes = ref(0)

// 对话框相关
const showResumeDetail = ref(false)
const selectedResume = ref(null)
const showVersionHistory = ref(false)
const versions = ref([])

// 事件定义
const emit = defineEmits(['stats-updated'])

// 计算属性
const filteredResumes = computed(() => {
  let filtered = resumes.value

  if (resumeSearch.value) {
    const search = resumeSearch.value.toLowerCase()
    filtered = filtered.filter(resume =>
      resume.title.toLowerCase().includes(search) ||
      resume.username.toLowerCase().includes(search) ||
      (resume.display_name && resume.display_name.toLowerCase().includes(search))
    )
  }

  if (resumeStatusFilter.value) {
    filtered = filtered.filter(resume => resume.status === resumeStatusFilter.value)
  }

  return filtered
})

const renderedContent = computed(() => {
  if (!selectedResume.value?.content) return ''
  return marked(selectedResume.value.content)
})

// 方法
const fetchResumes = async () => {
  try {
    resumesLoading.value = true
    const response = await axios.get('/api/resumes/admin/all', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        search: resumeSearch.value,
        status: resumeStatusFilter.value
      }
    })

    resumes.value = response.data.data.resumes
    totalResumes.value = response.data.data.pagination.total
  } catch (error) {
    console.error('获取简历列表失败:', error)
    ElMessage.error('获取简历列表失败')
  } finally {
    resumesLoading.value = false
  }
}

const handleResumeSearch = () => {
  currentPage.value = 1
  fetchResumes()
}

const handleStatusFilter = () => {
  currentPage.value = 1
  fetchResumes()
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchResumes()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchResumes()
}

const refreshResumes = () => {
  fetchResumes()
}

const viewResume = async (resume) => {
  try {
    const response = await axios.get(`/api/resumes/admin/user/${resume.user_id}`)
    selectedResume.value = response.data.resume
    showResumeDetail.value = true
  } catch (error) {
    console.error('获取简历详情失败:', error)
    ElMessage.error('获取简历详情失败')
  }
}

const viewVersions = async (resume) => {
  try {
    // 这里需要调用获取版本历史的API
    // 由于当前API只支持用户自己获取版本历史，这里先显示提示
    ElMessage.info('版本历史功能需要用户登录查看，请联系用户获取详情')
  } catch (error) {
    console.error('获取版本历史失败:', error)
    ElMessage.error('获取版本历史失败')
  }
}

const archiveResume = async (resume) => {
  try {
    await ElMessageBox.confirm(
      `确定要归档简历 "${resume.title}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里需要添加管理员归档简历的API
    ElMessage.info('管理员归档功能待开发')
  } catch (error) {
    // 用户取消操作
  }
}

const exportResumes = () => {
  const csvContent = generateCSV()
  downloadCSV(csvContent, `resumes-export-${dayjs().format('YYYY-MM-DD')}.csv`)
}

const generateCSV = () => {
  const headers = ['ID', '标题', '用户名', '显示名称', '邮箱', '状态', '版本', '是否公开', '创建时间', '更新时间']
  const rows = filteredResumes.value.map(resume => [
    resume.id,
    resume.title,
    resume.username,
    resume.display_name || '',
    resume.email,
    getStatusText(resume.status),
    resume.current_version,
    resume.is_public ? '是' : '否',
    formatDate(resume.created_at),
    formatDate(resume.updated_at)
  ])

  return [headers, ...rows].map(row => 
    row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
  ).join('\n')
}

const downloadCSV = (content, filename) => {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const getStatusTagType = (status) => {
  const statusTypes = {
    draft: '',
    published: 'success',
    archived: 'info'
  }
  return statusTypes[status] || ''
}

const getStatusText = (status) => {
  const statusTexts = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return statusTexts[status] || status
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('MM-DD HH:mm')
}

const viewVersionContent = (version) => {
  selectedResume.value = version
  showVersionHistory.value = false
  showResumeDetail.value = true
}

// 生命周期
onMounted(() => {
  fetchResumes()
})
</script>

<style scoped>
.tab-content {
  padding: 20px 0;
}

.resumes-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.resumes-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resume-title {
  display: flex;
  align-items: center;
}

.title-text {
  font-weight: 500;
}

.user-info {
  line-height: 1.4;
}

.user-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.user-display-name {
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.user-email {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.resume-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.resume-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.resume-header h3 {
  margin: 0 0 10px 0;
  color: var(--el-text-color-primary);
}

.resume-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.resume-meta .version {
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.resume-meta .date {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.resume-content {
  line-height: 1.6;
}

.markdown-preview {
  color: var(--el-text-color-primary);
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-preview p {
  margin-bottom: 16px;
}

.markdown-preview ul,
.markdown-preview ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

.markdown-preview code {
  background: var(--el-fill-color-light);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Consolas', monospace;
}

.markdown-preview pre {
  background: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-preview blockquote {
  border-left: 4px solid var(--el-color-primary);
  padding-left: 16px;
  margin: 16px 0;
  color: var(--el-text-color-secondary);
}

.version-item {
  background: var(--el-fill-color-lighter);
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.version-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.version-number {
  background: var(--el-color-primary);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.version-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.version-author {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.version-description {
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
  font-size: 13px;
}

.version-actions {
  display: flex;
  gap: 8px;
}
</style> 