<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <!-- 404动画区域 -->
        <div class="error-visual">
          <div class="error-code">
            <span class="digit">4</span>
            <span class="digit special">0</span>
            <span class="digit">4</span>
          </div>
          <div class="error-icon">
            <el-icon size="120"><Warning /></el-icon>
          </div>
        </div>

        <!-- 错误信息 -->
        <div class="error-info">
          <h1 class="error-title">页面找不到了</h1>
          <p class="error-description">
            抱歉，您访问的页面可能已被删除、重命名或暂时不可用。
            <br>
            让我们帮您找到正确的路径吧！
          </p>
        </div>

        <!-- 搜索功能 -->
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索AI项目、标签或关键词..."
            size="large"
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>

        <!-- 导航建议 -->
        <div class="navigation-suggestions">
          <h3 class="suggestions-title">您可能想要访问：</h3>
          <div class="suggestions-grid">
            <router-link to="/" class="suggestion-card ai-card">
              <div class="card-icon">
                <el-icon size="32"><House /></el-icon>
              </div>
              <h4 class="card-title">首页</h4>
              <p class="card-description">查看AI挑战概览和最新项目</p>
            </router-link>

            <router-link to="/projects" class="suggestion-card ai-card">
              <div class="card-icon">
                <el-icon size="32"><List /></el-icon>
              </div>
              <h4 class="card-title">项目列表</h4>
              <p class="card-description">浏览所有AI项目的完整列表</p>
            </router-link>

            <router-link to="/about" class="suggestion-card ai-card">
              <div class="card-icon">
                <el-icon size="32"><InfoFilled /></el-icon>
              </div>
              <h4 class="card-title">关于挑战</h4>
              <p class="card-description">了解100个AI产品挑战的详情</p>
            </router-link>

            <a 
              v-if="randomProject" 
              @click="goToRandomProject"
              class="suggestion-card ai-card cursor-pointer"
            >
              <div class="card-icon">
                <el-icon size="32"><MagicStick /></el-icon>
              </div>
              <h4 class="card-title">随机项目</h4>
              <p class="card-description">{{ randomProject.title }}</p>
            </a>
          </div>
        </div>

        <!-- 最近项目 -->
        <div v-if="recentProjects.length > 0" class="recent-projects">
          <h3 class="recent-title">最新AI项目</h3>
          <div class="projects-grid">
            <div 
              v-for="project in recentProjects.slice(0, 3)" 
              :key="project.id"
              class="project-card ai-card"
              @click="goToProject(project.id)"
            >
              <div class="project-status">
                <el-tag :class="['status-tag', project.status]" size="small">
                  {{ getStatusName(project.status) }}
                </el-tag>
              </div>
              <h4 class="project-title">{{ project.title }}</h4>
              <p class="project-description">{{ project.description }}</p>
              <div class="project-meta">
                <span class="project-progress">进度: {{ project.progress }}%</span>
                <span class="project-date">{{ formatDate(project.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误报告 -->
        <div class="error-report">
          <el-collapse>
            <el-collapse-item title="遇到了问题？点击报告错误" name="report">
              <div class="report-content">
                <p class="report-description">
                  如果您认为这是一个错误，请告诉我们具体情况：
                </p>
                <el-input
                  v-model="errorReport"
                  type="textarea"
                  :rows="3"
                  placeholder="描述您遇到的问题或期望找到的内容..."
                  maxlength="500"
                  show-word-limit
                />
                <div class="report-actions">
                  <el-button 
                    type="primary" 
                    @click="submitErrorReport"
                    :loading="submitting"
                    :disabled="!errorReport.trim()"
                  >
                    提交报告
                  </el-button>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 返回按钮 -->
        <div class="back-actions">
          <el-button size="large" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
          <router-link to="/">
            <el-button type="primary" size="large">
              <el-icon><House /></el-icon>
              回到首页
            </el-button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '../stores/projects'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import {
  Warning, Search, House, List, InfoFilled, MagicStick, ArrowLeft
} from '@element-plus/icons-vue'

const router = useRouter()
const projectsStore = useProjectsStore()

const searchQuery = ref('')
const errorReport = ref('')
const submitting = ref(false)

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
    ElMessage.warning('请输入搜索关键词')
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
  // 检查是否有历史记录
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

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

const submitErrorReport = async () => {
  if (!errorReport.value.trim()) {
    ElMessage.warning('请输入错误描述')
    return
  }
  
  try {
    submitting.value = true
    
    // 这里可以实现错误报告的提交逻辑
    // 例如发送到后端API或第三方服务
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('错误报告已提交，感谢您的反馈！')
    errorReport.value = ''
  } catch (error) {
    console.error('提交错误报告失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 生命周期
onMounted(() => {
  // 获取项目数据用于显示最近项目
  if (projectsStore.projects.length === 0) {
    projectsStore.fetchProjects({ limit: 10 })
  }
})
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: calc(100vh - 70px);
  background: var(--ai-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  
  .container {
    max-width: 800px;
    width: 100%;
  }
  
  .not-found-content {
    text-align: center;
    
    .error-visual {
      position: relative;
      margin-bottom: 40px;
      
      .error-code {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
        
        .digit {
          font-size: 8rem;
          font-weight: 900;
          color: var(--ai-primary);
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          
          @media (max-width: 768px) {
            font-size: 6rem;
          }
          
          @media (max-width: 480px) {
            font-size: 4rem;
          }
          
          &.special {
            background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: pulse 2s ease-in-out infinite;
          }
        }
      }
      
      .error-icon {
        color: var(--ai-text-secondary);
        opacity: 0.6;
        animation: float 3s ease-in-out infinite;
      }
    }
    
    .error-info {
      margin-bottom: 40px;
      
      .error-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 16px;
        color: var(--ai-text-primary);
        
        @media (max-width: 768px) {
          font-size: 2rem;
        }
      }
      
      .error-description {
        font-size: 1.125rem;
        color: var(--ai-text-secondary);
        line-height: 1.6;
        margin: 0;
      }
    }
    
    .search-section {
      margin-bottom: 60px;
      
      .search-input {
        max-width: 500px;
        margin: 0 auto;
        
        :deep(.el-input__wrapper) {
          border-radius: 12px;
        }
      }
    }
    
    .navigation-suggestions {
      margin-bottom: 60px;
      
      .suggestions-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 24px;
        color: var(--ai-text-primary);
      }
      
      .suggestions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        
        .suggestion-card {
          padding: 24px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          cursor: pointer;
          
          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.15);
          }
          
          .card-icon {
            color: var(--ai-primary);
            margin-bottom: 12px;
          }
          
          .card-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin: 0 0 8px;
            color: var(--ai-text-primary);
          }
          
          .card-description {
            font-size: 0.875rem;
            color: var(--ai-text-secondary);
            margin: 0;
            line-height: 1.5;
          }
        }
      }
    }
    
    .recent-projects {
      margin-bottom: 40px;
      
      .recent-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 24px;
        color: var(--ai-text-primary);
      }
      
      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        
        .project-card {
          padding: 20px;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.1);
          }
          
          .project-status {
            margin-bottom: 12px;
            
            .status-tag {
              border: none;
              font-weight: 500;
              padding: 4px 8px;
              border-radius: 6px;
            }
          }
          
          .project-title {
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 8px;
            color: var(--ai-text-primary);
            
            // 限制两行显示
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .project-description {
            font-size: 0.875rem;
            color: var(--ai-text-secondary);
            margin: 0 0 12px;
            line-height: 1.5;
            
            // 限制两行显示
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .project-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.75rem;
            color: var(--ai-text-secondary);
            
            .project-progress {
              font-weight: 500;
            }
          }
        }
      }
    }
    
    .error-report {
      margin-bottom: 40px;
      text-align: left;
      
      .report-content {
        .report-description {
          margin: 0 0 16px;
          color: var(--ai-text-secondary);
        }
        
        .report-actions {
          margin-top: 16px;
          text-align: right;
        }
      }
    }
    
    .back-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}

// 动画效果
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

// 光标指针样式
.cursor-pointer {
  cursor: pointer;
}
</style> 