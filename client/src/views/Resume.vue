<template>
  <div class="resume-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">我的简历</h1>
          <p class="page-subtitle">编辑和管理您的个人简历</p>
        </div>
        <div class="header-actions">
          <el-button @click="showVersionHistory = true" :disabled="!resumeData.id">
            <el-icon><Clock /></el-icon>
            版本历史
          </el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            <el-icon><DocumentAdd /></el-icon>
            保存简历
          </el-button>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-layout">
        <div class="main-content">
          <!-- 简历编辑卡片 -->
          <el-card class="resume-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-title">编辑简历</span>
                <div class="card-actions">
                  <el-tag 
                    :type="getStatusTagType(resumeData.status)" 
                    size="small"
                  >
                    {{ getStatusText(resumeData.status) }}
                  </el-tag>
                  <span class="version-info" v-if="resumeData.current_version">
                    v{{ resumeData.current_version }}
                  </span>
                </div>
              </div>
            </template>

            <div class="resume-form">
              <!-- 简历标题 -->
              <div class="form-group">
                <label class="form-label">简历标题</label>
                <el-input
                  v-model="resumeData.title"
                  placeholder="输入简历标题..."
                  maxlength="200"
                  show-word-limit
                  clearable
                />
              </div>

              <!-- 简历内容编辑器 -->
              <div class="form-group">
                <label class="form-label">简历内容</label>
                <MarkdownEditor
                  v-model="resumeData.content"
                  :height="'500px'"
                  placeholder="在这里编写您的简历内容，支持Markdown格式..."
                />
              </div>

              <!-- 简历设置 -->
              <div class="form-group">
                <label class="form-label">简历设置</label>
                <div class="settings-row">
                  <el-select v-model="resumeData.status" placeholder="选择状态">
                    <el-option label="草稿" value="draft" />
                    <el-option label="发布" value="published" />
                  </el-select>
                  
                  <el-checkbox v-model="resumeData.is_public" style="margin-left: 16px">
                    公开简历（其他用户可以查看）
                  </el-checkbox>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 简历预览卡片 -->
          <el-card class="preview-card" shadow="never" v-if="resumeData.content">
            <template #header>
              <div class="card-header">
                <span class="card-title">简历预览</span>
                <div class="card-actions">
                  <el-button size="small" @click="showFullPreview = true">
                    <el-icon><FullScreen /></el-icon>
                    全屏预览
                  </el-button>
                </div>
              </div>
            </template>

            <div class="resume-preview">
              <div class="preview-header">
                <h2>{{ resumeData.title || '简历标题' }}</h2>
                <div class="preview-meta">
                  <span class="last-updated">
                    最后更新: {{ formatDate(new Date()) }}
                  </span>
                </div>
              </div>
              <div class="preview-content">
                <div class="markdown-preview" v-html="renderedContent"></div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

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
                <span class="version-current" v-if="version.version === resumeData.current_version">
                  （当前版本）
                </span>
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

    <!-- 全屏预览对话框 -->
    <el-dialog
      v-model="showFullPreview"
      title="简历预览"
      width="90%"
      class="full-preview-dialog"
      :fullscreen="isFullscreen"
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="preview-dialog-header">
          <span :id="titleId" :class="titleClass">简历预览</span>
          <div class="preview-dialog-actions">
            <el-button @click="isFullscreen = !isFullscreen" text>
              <el-icon>
                <component :is="isFullscreen ? 'CopyDocument' : 'FullScreen'" />
              </el-icon>
            </el-button>
            <el-button @click="exportPDF" text>
              <el-icon><Download /></el-icon>
              导出PDF
            </el-button>
            <el-button @click="close" text>
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <div class="full-preview-content">
        <div class="preview-header">
          <h1>{{ resumeData.title || '简历标题' }}</h1>
          <div class="preview-meta">
            <span class="version">版本 v{{ resumeData.current_version }}</span>
            <span class="date">{{ formatDate(new Date()) }}</span>
          </div>
        </div>
        <div class="preview-content">
          <div class="markdown-preview" v-html="renderedContent"></div>
        </div>
      </div>
    </el-dialog>

    <!-- 版本内容查看对话框 -->
    <el-dialog
      v-model="showVersionContent"
      title="版本内容"
      width="80%"
      class="version-content-dialog"
    >
      <div v-if="selectedVersion" class="version-content">
        <div class="version-content-header">
          <h3>{{ selectedVersion.title }}</h3>
          <div class="version-content-meta">
            <span class="version">v{{ selectedVersion.version }}</span>
            <span class="date">{{ formatDate(selectedVersion.created_at) }}</span>
          </div>
        </div>
        <div class="version-content-body">
          <div class="markdown-preview" v-html="renderedVersionContent"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Clock, DocumentAdd, FullScreen, Download, Close, CopyDocument 
} from '@element-plus/icons-vue'
import MarkdownEditor from '../components/common/MarkdownEditor.vue'
import axios from '../utils/axios'
import dayjs from 'dayjs'
import { renderEnhancedMarkdown } from '../utils/markdownRenderer'

const authStore = useAuthStore()
const router = useRouter()

// 响应式数据
const resumeData = ref({
  id: null,
  title: '我的简历',
  content: '',
  status: 'draft',
  current_version: 1,
  is_public: false
})

const saving = ref(false)
const loading = ref(false)
const showVersionHistory = ref(false)
const showFullPreview = ref(false)
const showVersionContent = ref(false)
const isFullscreen = ref(false)
const versions = ref([])
const selectedVersion = ref(null)

// 计算属性
const renderedContent = computed(() => {
  if (!resumeData.value.content) return ''
  return renderEnhancedMarkdown(resumeData.value.content)
})

const renderedVersionContent = computed(() => {
  if (!selectedVersion.value?.content) return ''
  return renderEnhancedMarkdown(selectedVersion.value.content)
})

// 方法
const fetchResume = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/resumes/my-resume')
    
    if (response.data.resume && response.data.resume.id) {
      resumeData.value = { ...response.data.resume }
    }
  } catch (error) {
    console.error('获取简历失败:', error)
    ElMessage.error('获取简历失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!resumeData.value.title.trim()) {
    ElMessage.error('请输入简历标题')
    return
  }

  try {
    saving.value = true
    const response = await axios.post('/api/resumes/my-resume', {
      title: resumeData.value.title,
      content: resumeData.value.content,
      status: resumeData.value.status,
      is_public: resumeData.value.is_public
    })

    resumeData.value = { ...response.data.resume }
    ElMessage.success('简历保存成功')
  } catch (error) {
    console.error('保存简历失败:', error)
    ElMessage.error(error.response?.data?.message || '保存简历失败')
  } finally {
    saving.value = false
  }
}

const fetchVersions = async () => {
  try {
    const response = await axios.get('/api/resumes/my-resume/versions')
    versions.value = response.data.versions
  } catch (error) {
    console.error('获取版本历史失败:', error)
    ElMessage.error('获取版本历史失败')
  }
}

const viewVersionContent = async (version) => {
  selectedVersion.value = version
  showVersionHistory.value = false
  showVersionContent.value = true
}

const exportPDF = () => {
  ElMessage.info('PDF导出功能开发中...')
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
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

// 生命周期
onMounted(async () => {
  // 检查登录状态
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  await fetchResume()

  // 监听版本历史对话框打开
  const unwatchVersionDialog = computed(() => showVersionHistory.value)
  watch(unwatchVersionDialog, (newVal) => {
    if (newVal && resumeData.value.id) {
      fetchVersions()
    }
  })
})
</script>

<style scoped>
.resume-page {
  min-height: 100vh;
  background: var(--ai-bg-primary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  border-bottom: 1px solid var(--ai-border);
  margin-bottom: 30px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--ai-text-primary);
}

.header-content p {
  margin: 0;
  color: var(--ai-text-secondary);
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.content-layout {
  display: grid;
  gap: 24px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.resume-card, .preview-card {
  border: 1px solid var(--ai-border);
  border-radius: 12px;
  background: var(--ai-bg-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ai-text-primary);
}

.card-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.version-info {
  background: var(--ai-bg-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--ai-text-secondary);
}

.resume-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: var(--ai-text-primary);
  font-size: 14px;
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.resume-preview {
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  padding: 20px;
  background: var(--ai-bg-secondary);
  border-bottom: 1px solid var(--ai-border);
}

.preview-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: var(--ai-text-primary);
}

.preview-meta {
  color: var(--ai-text-secondary);
  font-size: 14px;
}

.preview-content {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.markdown-preview {
  line-height: 1.6;
  color: var(--ai-text-primary);
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
  color: var(--ai-text-primary);
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
  background: var(--ai-bg-secondary);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Consolas', monospace;
}

.markdown-preview pre {
  background: var(--ai-bg-secondary);
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-preview blockquote {
  border-left: 4px solid var(--ai-primary);
  padding-left: 16px;
  margin: 16px 0;
  color: var(--ai-text-secondary);
}

.version-item {
  background: var(--ai-bg-secondary);
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
  background: var(--ai-primary);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.version-title {
  font-weight: 500;
  color: var(--ai-text-primary);
}

.version-current {
  color: var(--ai-success);
  font-size: 13px;
}

.version-actions {
  display: flex;
  gap: 8px;
}

.preview-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.preview-dialog-actions {
  display: flex;
  gap: 8px;
}

.full-preview-content {
  padding: 20px;
}

.full-preview-content .preview-header h1 {
  font-size: 32px;
  margin-bottom: 12px;
}

.full-preview-content .preview-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ai-border);
}

.version-content-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--ai-border);
}

.version-content-header h3 {
  margin: 0 0 10px 0;
  color: var(--ai-text-primary);
}

.version-content-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.version-content-meta .version {
  background: var(--ai-bg-secondary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.version-content-meta .date {
  color: var(--ai-text-secondary);
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .settings-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .preview-content {
    max-height: 300px;
  }
}
</style> 