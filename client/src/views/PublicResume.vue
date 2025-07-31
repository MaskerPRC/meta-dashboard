<template>
  <div class="public-resume-page">
    <div class="container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- 无简历状态 -->
      <div v-else-if="!resume" class="no-resume-container">
        <el-empty description="暂无公开简历">
          <el-button @click="$router.push('/')">返回首页</el-button>
        </el-empty>
      </div>

      <!-- 简历内容 -->
      <div v-else class="resume-content">
        <!-- 简历头部 -->
        <div class="resume-header">
          <div class="author-info">
            <el-avatar 
              :src="resume.avatar_url" 
              :size="80"
              class="author-avatar"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="author-details">
              <h1 class="resume-title">{{ resume.title }}</h1>
              <div class="author-meta">
                <span class="author-name">{{ resume.display_name || resume.username }}</span>
                <span class="version-info">v{{ resume.display_version || resume.current_version }}</span>
                <span class="update-time">{{ formatDate(resume.updated_at) }}</span>
              </div>
            </div>
          </div>
          
          <div class="header-actions">
            <el-button @click="toggleFullscreen" :icon="isFullscreen ? CopyDocument : FullScreen">
              {{ isFullscreen ? '退出全屏' : '全屏阅读' }}
            </el-button>
            <el-button @click="printResume" :icon="Printer">
              打印简历
            </el-button>
          </div>
        </div>

        <!-- 简历正文 -->
        <div class="resume-body" :class="{ 'fullscreen-content': isFullscreen }">
          <div class="markdown-content" v-html="renderedContent"></div>
          
          <!-- 全屏模式下的退出按钮 -->
          <div v-if="isFullscreen" class="fullscreen-exit-btn">
            <el-button @click="toggleFullscreen" circle type="info" size="large">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 底部信息 -->
        <div class="resume-footer" v-if="!isFullscreen">
          <div class="footer-info">
            <span class="last-updated">最后更新：{{ formatDate(resume.updated_at) }}</span>
            <span class="version">版本：v{{ resume.display_version || resume.current_version }}</span>
          </div>
          <div class="footer-actions">
            <el-button @click="$router.push('/')">返回首页</el-button>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, FullScreen, CopyDocument, Printer, Close } from '@element-plus/icons-vue'
import axios from '../utils/axios'
import dayjs from 'dayjs'
import { renderEnhancedMarkdown } from '../utils/markdownRenderer'

const router = useRouter()

// 响应式数据
const resume = ref(null)
const loading = ref(true)
const isFullscreen = ref(false)

// 计算属性
const renderedContent = computed(() => {
  if (!resume.value?.content) return ''
  return renderEnhancedMarkdown(resume.value.content)
})

// 方法
const fetchPublicResume = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/resumes/public')
    resume.value = response.data.resume
  } catch (error) {
    console.error('获取公开简历失败:', error)
    if (error.response?.status === 404) {
      // 404 是正常情况，表示没有公开简历
      resume.value = null
    } else {
      ElMessage.error('获取简历失败')
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY年MM月DD日')
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const printResume = () => {
  window.print()
}

// 键盘事件处理
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

// 生命周期
onMounted(() => {
  fetchPublicResume()
  document.addEventListener('keydown', handleKeydown)
  
  // 设置页面标题
  document.title = '简历 - AI项目看板'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.public-resume-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 20px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading-container {
  padding: 40px 20px;
}

.no-resume-container {
  padding: 60px 20px;
  text-align: center;
}

.resume-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.author-avatar {
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.resume-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.author-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 14px;
  opacity: 0.9;
}

.version-info {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.resume-body {
  padding: 40px;
  line-height: 1.8;
  max-width: none;
}

.fullscreen-content {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 9999;
  overflow-y: auto;
  padding: 60px 80px;
}

.markdown-content {
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 32px;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.markdown-content h1 {
  font-size: 32px;
  border-bottom: 2px solid var(--el-color-primary);
  padding-bottom: 12px;
}

.markdown-content h2 {
  font-size: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 8px;
}

.markdown-content h3 {
  font-size: 20px;
}

.markdown-content p {
  margin-bottom: 16px;
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

.markdown-content li {
  margin-bottom: 4px;
}

.markdown-content code {
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
}

.markdown-content pre {
  background: var(--el-fill-color-light);
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 20px;
  border-left: 4px solid var(--el-color-primary);
}

.markdown-content blockquote {
  border-left: 4px solid var(--el-color-primary);
  padding-left: 20px;
  margin: 20px 0;
  color: var(--el-text-color-secondary);
  font-style: italic;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid var(--el-border-color-light);
  padding: 12px;
  text-align: left;
}

.markdown-content th {
  background: var(--el-fill-color-lighter);
  font-weight: 600;
}

.resume-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-top: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-lighter);
}

.footer-info {
  display: flex;
  gap: 20px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.fullscreen-exit-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10001;
  
  .el-button {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
    
    .el-icon {
      color: #606266;
      font-size: 18px;
    }
  }
}

/* 打印样式 */
@media print {
  .resume-header .header-actions,
  .resume-footer,
  .fullscreen-exit-btn {
    display: none !important;
  }
  
  .resume-content {
    box-shadow: none;
    border-radius: 0;
  }
  
  .resume-header {
    background: none !important;
    color: black !important;
    border-bottom: 2px solid #333;
  }
  
  .resume-body {
    padding: 20px 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .resume-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .author-info {
    flex-direction: column;
    text-align: center;
  }
  
  .resume-body {
    padding: 20px;
  }
  
  .fullscreen-content {
    padding: 40px 20px;
  }
  
  .footer-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>