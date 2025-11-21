<template>
  <main class="flex-grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
    <!-- Page Header -->
    <div class="mb-12 flex justify-between items-end border-b-4 border-black pb-4">
      <div>
        <h1 class="text-4xl font-black uppercase tracking-tight mb-2">我的简历</h1>
        <p class="text-gray-600 font-medium">编辑和管理您的个人简历</p>
      </div>
      <div class="flex gap-4">
        <button 
          @click="showVersionHistory = true" 
          :disabled="!resumeData.id"
          class="neo-btn bg-white px-6 py-3 hover:bg-gray-100 disabled:opacity-50"
        >
          <i class="fa-solid fa-clock mr-2"></i>
          版本历史
        </button>
        <button 
          @click="handleSave" 
          :disabled="saving"
          class="neo-btn bg-neo-green text-black px-6 py-3 hover:bg-green-400 disabled:opacity-50"
        >
          <i class="fa-solid fa-save mr-2"></i>
          {{ saving ? '保存中...' : '保存简历' }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Edit Card -->
      <div class="neo-card p-6 bg-white">
        <div class="flex justify-between items-center mb-6 pb-4 border-b-3 border-black">
          <h2 class="text-2xl font-black">编辑简历</h2>
          <div class="flex items-center gap-3">
            <span 
              class="px-3 py-1 text-xs font-bold border-2 border-black rounded"
              :class="getStatusBadgeClass(resumeData.status)"
            >
              {{ getStatusText(resumeData.status) }}
            </span>
            <span 
              v-if="resumeData.current_version"
              class="px-3 py-1 text-xs font-bold bg-black text-white rounded"
            >
              v{{ resumeData.current_version }}
            </span>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-bold mb-2">简历标题</label>
            <div class="relative">
              <input
                v-model="resumeData.title"
                type="text"
                placeholder="输入简历标题..."
                maxlength="200"
                class="w-full bg-gray-100 border-2 border-black px-4 py-3 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
              />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                {{ resumeData.title.length }}/200
              </span>
            </div>
          </div>

          <!-- Content Editor -->
          <div>
            <label class="block text-sm font-bold mb-2">简历内容</label>
            <MarkdownEditor
              v-model="resumeData.content"
              :height="'500px'"
              placeholder="在这里编写您的简历内容，支持Markdown格式..."
            />
          </div>

          <!-- Settings -->
          <div>
            <label class="block text-sm font-bold mb-2">简历设置</label>
            <div class="flex flex-col gap-4">
              <div class="relative">
                <select 
                  v-model="resumeData.status"
                  class="appearance-none bg-gray-100 border-2 border-black px-4 py-3 pr-8 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white cursor-pointer w-full"
                >
                  <option value="draft">草稿</option>
                  <option value="published">发布</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black border-l-2 border-black bg-neo-yellow">
                  <i class="fa-solid fa-caret-down text-xs"></i>
                </div>
              </div>
              
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="resumeData.is_public"
                  type="checkbox"
                  class="w-5 h-5 border-2 border-black rounded focus:ring-0 focus:ring-offset-0"
                />
                <span class="font-bold text-sm">公开简历（其他用户可以查看）</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Card -->
      <div v-if="resumeData.content" class="neo-card p-6 bg-white">
        <div class="flex justify-between items-center mb-6 pb-4 border-b-3 border-black">
          <h2 class="text-2xl font-black">简历预览</h2>
          <button 
            @click="showFullPreview = true"
            class="neo-btn bg-white px-4 py-2 text-sm hover:bg-gray-100"
          >
            <i class="fa-solid fa-expand mr-2"></i>
            全屏预览
          </button>
        </div>

        <div class="resume-preview">
          <div class="preview-header mb-4 pb-4 border-b-2 border-gray-200">
            <h2 class="text-2xl font-black mb-2">{{ resumeData.title || '简历标题' }}</h2>
            <div class="text-xs font-bold text-gray-500">
              最后更新: {{ formatDate(new Date()) }}
            </div>
          </div>
          <div class="preview-content max-h-[600px] overflow-y-auto custom-scrollbar">
            <div class="markdown-preview" v-html="renderedContent"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Version History Dialog -->
    <el-dialog
      v-model="showVersionHistory"
      title="版本历史"
      width="70%"
      class="version-history-dialog"
    >
      <div v-if="versions.length > 0" class="space-y-4">
        <div
          v-for="version in versions"
          :key="version.id"
          class="neo-card p-4 bg-white"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 text-xs font-bold bg-black text-white rounded">
                v{{ version.version }}
              </span>
              <span class="font-bold">{{ version.title }}</span>
              <span 
                v-if="version.version === resumeData.current_version"
                class="px-2 py-1 text-xs font-bold bg-neo-green text-black rounded"
              >
                当前版本
              </span>
            </div>
            <button 
              @click="viewVersionContent(version)"
              class="neo-btn bg-white px-4 py-2 text-sm hover:bg-gray-100"
            >
              查看内容
            </button>
          </div>
          <div class="text-xs font-bold text-gray-500">
            {{ formatDate(version.created_at) }}
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12">
        <i class="fa-solid fa-inbox text-6xl text-gray-400 mb-4"></i>
        <p class="text-lg font-bold text-gray-600">暂无版本历史</p>
      </div>
    </el-dialog>

    <!-- Full Preview Dialog -->
    <el-dialog
      v-model="showFullPreview"
      title="简历预览"
      width="90%"
      class="full-preview-dialog"
      :fullscreen="isFullscreen"
    >
      <div class="full-preview-content">
        <div class="preview-header mb-6 pb-4 border-b-3 border-black">
          <h1 class="text-4xl font-black mb-2">{{ resumeData.title || '简历标题' }}</h1>
          <div class="flex gap-4 text-sm font-bold text-gray-500">
            <span>版本 v{{ resumeData.current_version }}</span>
            <span>{{ formatDate(new Date()) }}</span>
          </div>
        </div>
        <div class="preview-content">
          <div class="markdown-preview" v-html="renderedContent"></div>
        </div>
      </div>
    </el-dialog>

    <!-- Version Content Dialog -->
    <el-dialog
      v-model="showVersionContent"
      title="版本内容"
      width="80%"
      class="version-content-dialog"
    >
      <div v-if="selectedVersion" class="version-content">
        <div class="version-content-header mb-6 pb-4 border-b-3 border-black">
          <h3 class="text-2xl font-black mb-2">{{ selectedVersion.title }}</h3>
          <div class="flex gap-4 text-sm font-bold text-gray-500">
            <span class="px-3 py-1 bg-black text-white rounded">v{{ selectedVersion.version }}</span>
            <span>{{ formatDate(selectedVersion.created_at) }}</span>
          </div>
        </div>
        <div class="version-content-body">
          <div class="markdown-preview" v-html="renderedVersionContent"></div>
        </div>
      </div>
    </el-dialog>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { showNotification } from '../utils/notification'
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
    showNotification.error('获取简历失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!resumeData.value.title.trim()) {
    showNotification.error('请输入简历标题')
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
    showNotification.success('简历保存成功')
  } catch (error) {
    console.error('保存简历失败:', error)
    showNotification.error(error.response?.data?.message || '保存简历失败')
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
    showNotification.error('获取版本历史失败')
  }
}

const viewVersionContent = async (version) => {
  selectedVersion.value = version
  showVersionHistory.value = false
  showVersionContent.value = true
}

const exportPDF = () => {
  showNotification.info('PDF导出功能开发中...')
}

const getStatusText = (status) => {
  const statusTexts = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return statusTexts[status] || status
}

const getStatusBadgeClass = (status) => {
  const classMap = {
    draft: 'bg-neo-yellow text-black',
    published: 'bg-neo-green text-black',
    archived: 'bg-gray-200 text-gray-800'
  }
  return classMap[status] || 'bg-gray-200 text-gray-800'
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

// 生命周期
onMounted(async () => {
  // 检查登录状态
  if (!authStore.isAuthenticated) {
    showNotification.warning('请先登录')
    router.push('/login')
    return
  }

  await fetchResume()

  // 监听版本历史对话框打开
  watch(showVersionHistory, (newVal) => {
    if (newVal && resumeData.value.id) {
      fetchVersions()
    }
  })
})
</script>

<style lang="scss" scoped>
.resume-preview {
  .markdown-preview {
    line-height: 1.6;
    color: #333;
  }

  .markdown-preview h1,
  .markdown-preview h2,
  .markdown-preview h3 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 700;
  }

  .markdown-preview p {
    margin-bottom: 16px;
  }

  .markdown-preview ul,
  .markdown-preview ol {
    margin-bottom: 16px;
    padding-left: 24px;
  }
}

.version-history-dialog,
.full-preview-dialog,
.version-content-dialog {
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
}

.full-preview-content,
.version-content {
  .markdown-preview {
    line-height: 1.8;
    color: #333;
  }
}
</style>
