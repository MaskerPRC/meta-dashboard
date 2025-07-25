<template>
  <div class="home-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              <span class="gradient-text">一年100个AI产品挑战</span>
            </h1>
            <p class="hero-subtitle">
              记录每一个AI产品从构思到上线的完整历程，用代码书写人工智能时代的创新传奇
            </p>
            <div class="hero-actions">
              <router-link to="/projects">
                <el-button type="primary" size="large" class="ai-button">
                  <el-icon><View /></el-icon>
                  查看所有项目
                </el-button>
              </router-link>
              <router-link to="/about">
                <el-button size="large" class="ai-button secondary">
                  <el-icon><InfoFilled /></el-icon>
                  了解挑战
                </el-button>
              </router-link>
            </div>
          </div>
          <div class="hero-visual">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">{{ projectsStore.projects.length || 0 }}</div>
                <div class="stat-label">AI项目</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ projectsStore.totalProgress || 0 }}%</div>
                <div class="stat-label">整体进度</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ projectsStore.statusCounts.completed || 0 }}</div>
                <div class="stat-label">已完成</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ projectsStore.statusCounts.development || 0 }}</div>
                <div class="stat-label">开发中</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 项目状态统计 -->
    <section class="status-section">
      <div class="container">
        <h2 class="section-title">项目状态概览</h2>
        <div class="status-grid">
          <div 
            v-for="(count, status) in projectsStore.statusCounts" 
            :key="status"
            class="status-item"
            :class="status"
          >
            <div class="status-icon">
              <el-icon>
                <component :is="getStatusIcon(status)" />
              </el-icon>
            </div>
            <div class="status-info">
              <div class="status-count">{{ count }}</div>
              <div class="status-name">{{ getStatusName(status) }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新项目 -->
    <section class="recent-projects-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最新项目</h2>
          <router-link to="/projects">
            <el-button text type="primary">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </router-link>
        </div>
        
        <div v-if="recentProjects.length > 0" class="projects-grid">
          <ProjectCard 
            v-for="project in recentProjects" 
            :key="project.id"
            :project="project"
            @click="goToProject(project.id)"
          />
        </div>
        
        <div v-else class="empty-state">
          <el-icon size="64" color="#94a3b8"><DocumentAdd /></el-icon>
          <p>还没有任何项目，开始您的AI产品挑战之旅吧！</p>
          <el-button 
            v-if="authStore.isAdmin" 
            type="primary" 
            @click="$router.push('/admin')"
          >
            创建第一个项目
          </el-button>
        </div>
      </div>
    </section>

    <!-- 挑战宣言 -->
    <section class="manifesto-section">
      <div class="container">
        <div class="manifesto-card ai-card">
          <h3 class="manifesto-title">挑战宣言</h3>
          <blockquote class="manifesto-quote">
            "在AI让我们真正只做想做的事之前——我们先做一件足够挑战自己的事"
          </blockquote>
          <p class="manifesto-text">
            2025年，用100个AI产品记录这个时代最激动人心的技术变革。
            每一个产品都是一次勇敢的尝试，每一行代码都在书写未来。
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '../stores/projects'
import { useAuthStore } from '../stores/auth'
import ProjectCard from '../components/project/ProjectCard.vue'
import {
  View, InfoFilled, ArrowRight, DocumentAdd,
  Star, Edit, Cpu, TestTube, Upload, Check, Pause
} from '@element-plus/icons-vue'

const router = useRouter()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

const recentProjects = computed(() => {
  return projectsStore.projects.slice(0, 6)
})

// 获取状态图标
const getStatusIcon = (status) => {
  const icons = {
    idea: 'Star',
    planning: 'Edit', 
    development: 'Cpu',
    testing: 'TestTube',
    deployed: 'Upload',
    completed: 'Check',
    paused: 'Pause'
  }
  return icons[status] || 'Star'
}

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

// 跳转到项目详情
const goToProject = (id) => {
  router.push(`/project/${id}`)
}

onMounted(() => {
  // 获取项目数据
  projectsStore.fetchProjects({ limit: 12 })
})
</script>

<style lang="scss" scoped>
.home-page {
  .hero-section {
    padding: 60px 0 120px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    .hero-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 40px;
      }
    }
    
    .hero-text {
      .hero-title {
        font-size: 3.5rem;
        font-weight: 800;
        margin: 0 0 24px;
        line-height: 1.1;
        
        @media (max-width: 768px) {
          font-size: 2.5rem;
        }
      }
      
      .hero-subtitle {
        font-size: 1.25rem;
        line-height: 1.6;
        margin: 0 0 32px;
        opacity: 0.9;
      }
      
      .hero-actions {
        display: flex;
        gap: 16px;
        
        @media (max-width: 480px) {
          flex-direction: column;
        }
      }
    }
    
    .hero-visual {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        
        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          
          .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 8px;
          }
          
          .stat-label {
            font-size: 0.875rem;
            opacity: 0.8;
          }
        }
      }
    }
  }
  
  .status-section {
    padding: 80px 0;
    background: var(--ai-bg-secondary);
    
    .section-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 48px;
      color: var(--ai-text-primary);
    }
    
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      
      .status-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        border-radius: 12px;
        background: var(--ai-bg-primary);
        border: 1px solid var(--ai-border);
        transition: transform 0.3s ease;
        
        &:hover {
          transform: translateY(-4px);
        }
        
        .status-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }
        
        .status-info {
          .status-count {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--ai-text-primary);
          }
          
          .status-name {
            font-size: 0.875rem;
            color: var(--ai-text-secondary);
          }
        }
        
        // 状态特定样式
        &.idea .status-icon { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
        &.planning .status-icon { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
        &.development .status-icon { background: linear-gradient(135deg, #a78bfa, #8b5cf6); }
        &.testing .status-icon { background: linear-gradient(135deg, #fb7185, #e11d48); }
        &.deployed .status-icon { background: linear-gradient(135deg, #34d399, #10b981); }
        &.completed .status-icon { background: linear-gradient(135deg, #4ade80, #22c55e); }
        &.paused .status-icon { background: linear-gradient(135deg, #94a3b8, #64748b); }
      }
    }
  }
  
  .recent-projects-section {
    padding: 80px 0;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 48px;
      
      .section-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--ai-text-primary);
        margin: 0;
      }
    }
    
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--ai-text-secondary);
      
      p {
        margin: 24px 0;
        font-size: 1.125rem;
      }
    }
  }
  
  .manifesto-section {
    padding: 80px 0;
    background: var(--ai-bg-secondary);
    
    .manifesto-card {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px;
      text-align: center;
      
      .manifesto-title {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 24px;
        color: var(--ai-text-primary);
      }
      
      .manifesto-quote {
        font-size: 1.5rem;
        font-style: italic;
        margin: 24px 0;
        padding: 24px;
        background: rgba(99, 102, 241, 0.1);
        border-left: 4px solid var(--ai-primary);
        border-radius: 8px;
        color: var(--ai-primary);
      }
      
      .manifesto-text {
        font-size: 1.125rem;
        line-height: 1.7;
        color: var(--ai-text-secondary);
        margin: 0;
      }
    }
  }
}
</style> 