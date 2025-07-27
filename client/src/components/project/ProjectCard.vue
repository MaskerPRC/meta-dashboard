<template>
  <div class="project-card ai-card" @click="$emit('click')">
    <!-- 项目状态和优先级 -->
    <div class="card-header">
      <div class="status-tags">
        <el-tag 
          :class="['status-tag', project.status]" 
          size="small"
        >
          {{ getStatusName(project.status) }}
        </el-tag>
        <el-tag 
          :class="['priority-tag', project.priority]" 
          size="small"
        >
          {{ getPriorityName(project.priority) }}
        </el-tag>
      </div>
      <!-- AI生成标识 -->
      <el-tag 
        v-if="isAIGenerated(project)"
        type="success" 
        size="small"
        class="ai-generated-tag"
      >
        <el-icon><Cpu /></el-icon>
        AI生成
      </el-tag>
    </div>

    <!-- 项目标题和描述 -->
    <div class="card-content">
      <h3 class="project-title">{{ project.title }}</h3>
      <p class="project-description">{{ project.description }}</p>
      
      <!-- 技术栈标签 -->
      <div v-if="project.tech_stack && project.tech_stack.length" class="tech-tags">
        <el-tag 
          v-for="tech in project.tech_stack.slice(0, 3)" 
          :key="tech"
          size="small"
          type="info"
          class="tech-tag"
        >
          {{ tech }}
        </el-tag>
        <span v-if="project.tech_stack.length > 3" class="more-tech">
          +{{ project.tech_stack.length - 3 }}
        </span>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-label">进度</span>
        <span class="progress-value">{{ project.progress }}%</span>
      </div>
      <el-progress 
        :percentage="project.progress" 
        :stroke-width="6"
        :show-text="false"
        :color="getProgressColor(project.progress)"
      />
    </div>

    <!-- 卡片底部信息 -->
    <div class="card-footer">
      <div class="footer-left">
        <div class="project-dates">
          <el-icon><Calendar /></el-icon>
          <span>{{ formatDate(project.created_at) }}</span>
        </div>
      </div>
      
      <div class="footer-right">
        <!-- GitHub仓库链接 -->
        <el-tooltip v-if="project.github_repo" content="查看源码" placement="top">
          <el-button 
            size="small" 
            circle 
            @click.stop="openGithub"
          >
            <el-icon><Link /></el-icon>
          </el-button>
        </el-tooltip>
        
        <!-- Demo链接 -->
        <el-tooltip v-if="project.demo_url" content="在线演示" placement="top">
          <el-button 
            size="small" 
            circle 
            type="primary"
            @click.stop="openDemo"
          >
            <el-icon><View /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Calendar, Link, View, Cpu } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

// 获取状态名称
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

// 获取优先级名称
const getPriorityName = (priority) => {
  const names = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急'
  }
  return names[priority] || '中'
}

// 获取进度条颜色
const getProgressColor = (progress) => {
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
}

// 判断是否为AI生成项目
const isAIGenerated = (project) => {
  // 检查项目标签中是否包含"AI生成"
  if (project.tags && Array.isArray(project.tags)) {
    return project.tags.includes('AI生成')
  }
  if (typeof project.tags === 'string') {
    return project.tags.includes('AI生成')
  }
  return false
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 打开GitHub仓库
const openGithub = () => {
  if (props.project.github_repo) {
    window.open(props.project.github_repo, '_blank')
  }
}

// 打开Demo链接
const openDemo = () => {
  if (props.project.demo_url) {
    window.open(props.project.demo_url, '_blank')
  }
}
</script>

<style lang="scss" scoped>
.project-card {
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--ai-border);
  
  &:hover {
    border-color: var(--ai-primary);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.15);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .status-tags {
      display: flex;
      gap: 8px;
    }
    
    .ai-generated-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(135deg, #43e97b, #38f9d7);
      border: none;
      
      .el-icon {
        font-size: 12px;
      }
    }
    
    .status-tag, .priority-tag {
      border: none;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 6px;
    }
  }
  
  .card-content {
    margin-bottom: 16px;
    
    .project-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 8px;
      color: var(--ai-text-primary);
      line-height: 1.4;
      
      // 限制两行显示
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .project-description {
      font-size: 0.875rem;
      color: var(--ai-text-secondary);
      line-height: 1.5;
      margin: 0 0 12px;
      
      // 限制三行显示
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .tech-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      
      .tech-tag {
        font-size: 12px;
        height: 20px;
        line-height: 20px;
        border-radius: 4px;
      }
      
      .more-tech {
        font-size: 12px;
        color: var(--ai-text-secondary);
      }
    }
  }
  
  .progress-section {
    margin-bottom: 16px;
    
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .progress-label {
        font-size: 0.875rem;
        color: var(--ai-text-secondary);
      }
      
      .progress-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ai-text-primary);
      }
    }
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .footer-left {
      .project-dates {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        color: var(--ai-text-secondary);
        
        .el-icon {
          font-size: 12px;
        }
      }
    }
    
    .footer-right {
      display: flex;
      gap: 8px;
      
      .el-button {
        width: 28px;
        height: 28px;
        
        .el-icon {
          font-size: 14px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .project-card {
    padding: 16px;
    
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
}
</style> 