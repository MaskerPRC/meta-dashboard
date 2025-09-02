<template>
  <div class="home-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              <span class="hero-title-text">{{ $t('home.challenge_title') }}</span>
            </h1>
            <p class="hero-subtitle">
              {{ $t('home.description') }}
            </p>
            <div class="hero-actions">
              <router-link to="/projects">
                <el-button type="primary" size="large" class="ai-button">
                  <el-icon><View /></el-icon>
                  {{ $t('home.view_projects') }}
                </el-button>
              </router-link>
              <router-link to="/about">
                <el-button size="large" class="ai-button secondary">
                  <el-icon><InfoFilled /></el-icon>
                  {{ $t('home.learn_more') }}
                </el-button>
              </router-link>
              <a
                v-if="startupArticle.url"
                :href="startupArticle.url"
                target="_blank"
                class="startup-article-link"
              >
                <el-button size="large" class="ai-button featured">
                  <el-icon><Document /></el-icon>
                  {{ startupArticle.title || '创业启动文章' }}
                </el-button>
              </a>
            </div>

            <!-- 社交媒体链接 -->
            <div v-if="hasSocialLinks" class="social-links">
              <div class="social-buttons">
                <a
                  v-if="socialLinks.social_x_url"
                  :href="socialLinks.social_x_url"
                  target="_blank"
                  class="social-link x-link"
                  title="X (Twitter)"
                >
                  <span class="social-icon">𝕏</span>
                  <span class="social-label">X</span>
                </a>

                <a
                  v-if="socialLinks.social_xiaohongshu_url"
                  :href="socialLinks.social_xiaohongshu_url"
                  target="_blank"
                  class="social-link xiaohongshu-link"
                  title="小红书"
                >
                  <span class="social-icon">📱</span>
                  <span class="social-label">小红书</span>
                </a>

                <a
                  v-if="socialLinks.social_bilibili_url"
                  :href="socialLinks.social_bilibili_url"
                  target="_blank"
                  class="social-link bilibili-link"
                  title="哔哩哔哩"
                >
                  <span class="social-icon">📺</span>
                  <span class="social-label">B站</span>
                </a>

                <a
                  v-if="socialLinks.social_wechat_official_url"
                  :href="socialLinks.social_wechat_official_url"
                  target="_blank"
                  class="social-link wechat-link"
                  title="微信公众号"
                >
                  <span class="social-icon">💬</span>
                  <span class="social-label">公众号</span>
                </a>

                <a
                  v-if="socialLinks.social_zhihu_url"
                  :href="socialLinks.social_zhihu_url"
                  target="_blank"
                  class="social-link zhihu-link"
                  title="知乎"
                >
                  <span class="social-icon">🧠</span>
                  <span class="social-label">知乎</span>
                </a>

                <a
                  v-if="socialLinks.social_csdn_url"
                  :href="socialLinks.social_csdn_url"
                  target="_blank"
                  class="social-link csdn-link"
                  title="CSDN"
                >
                  <span class="social-icon">💻</span>
                  <span class="social-label">CSDN</span>
                </a>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">{{ projectsStore.stats.totalProjects || 0 }}</div>
                <div class="stat-label">{{ $t('home.stats.ai_projects') }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ projectsStore.totalProgress || 0 }}%</div>
                <div class="stat-label">{{ $t('home.stats.overall_progress') }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ projectsStore.statusCounts.completed || 0 }}</div>
                <div class="stat-label">{{ $t('home.stats.completed') }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ projectsStore.statusCounts.development || 0 }}</div>
                <div class="stat-label">{{ $t('home.stats.in_development') }}</div>
              </div>
              <!-- 年度倒计时卡片 -->
              <div class="stat-card countdown-card">
                <div class="stat-number countdown-number">{{ daysRemaining }}</div>
                <div class="stat-label">{{ $t('home.stats.days_remaining') }}</div>
                <div class="countdown-year">{{ currentYear }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 项目状态统计 -->
    <section class="status-section">
      <div class="container">
        <h2 class="section-title">{{ $t('home.status_overview.title') }}</h2>
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
          <h2 class="section-title">{{ $t('home.latest_projects') }}</h2>
          <router-link to="/projects">
            <el-button text type="primary">
              {{ $t('projects.title') }}
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
          <p>{{ $t('message.no_data') }}</p>
          <el-button
            v-if="authStore.isAdmin"
            type="primary"
            @click="$router.push('/admin')"
          >
            {{ $t('admin.new_project') }}
          </el-button>
        </div>
      </div>
    </section>

    <!-- 微信交流群 -->
    <section class="wechat-group-section">
      <div class="container">
        <WechatGroup :is-compact="true" :show-contact-info="true" />
      </div>
    </section>

    <!-- 挑战宣言 -->
    <section class="manifesto-section">
      <div class="container">
        <div class="manifesto-card ai-card">
          <h3 class="manifesto-title">{{ $t('home.challenge_manifesto.title') }}</h3>
          <blockquote class="manifesto-quote">
            {{ $t('home.challenge_manifesto.quote') }}
          </blockquote>
          <p class="manifesto-text">
            {{ $t('home.challenge_manifesto.description') }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '../stores/projects'
import { useAuthStore } from '../stores/auth'
import ProjectCard from '../components/project/ProjectCard.vue'
import WechatGroup from '../components/common/WechatGroup.vue'
import axios from '../utils/axios'
import {
  View, InfoFilled, ArrowRight, DocumentAdd, Document,
  Star, Edit, Cpu, Operation, Upload, Check, VideoPause
} from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

// 数据
const socialLinks = ref({})
const startupArticle = ref({ url: '', title: '' })

// 年度倒计时
const currentYear = ref(new Date().getFullYear())
const daysRemaining = ref(0)

const recentProjects = computed(() => {
  return projectsStore.projects.slice(0, 6)
})

const hasSocialLinks = computed(() => {
  return Object.values(socialLinks.value).some(url => url && url.trim())
})

// 获取状态图标
const getStatusIcon = (status) => {
  const icons = {
    idea: 'Star',
    planning: 'Edit',
    development: 'Cpu',
    testing: 'Operation',
    deployed: 'Upload',
    completed: 'Check',
    paused: 'VideoPause'
  }
  return icons[status] || 'Star'
}

// 获取状态名称
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
  return t(`home.status_overview.${translationKey}`)
}

// 跳转到项目详情
const goToProject = (id) => {
  router.push(`/project/${id}`)
}

// 计算年度倒计时
const calculateDaysRemaining = () => {
  const now = new Date()
  const currentYearValue = now.getFullYear()
  const endOfYear = new Date(currentYearValue, 11, 31, 23, 59, 59) // 12月31日23:59:59
  
  const timeDiff = endOfYear.getTime() - now.getTime()
  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  currentYear.value = currentYearValue
  daysRemaining.value = Math.max(0, days) // 确保不会显示负数
}

// 获取社交媒体链接配置
const loadSocialLinks = async () => {
  try {
    const response = await axios.get('/api/config')
    const configs = response.data.configs

    // 提取社交媒体链接
    const socialKeys = [
      'social_x_url',
      'social_xiaohongshu_url',
      'social_bilibili_url',
      'social_wechat_official_url',
      'social_zhihu_url',
      'social_csdn_url'
    ]

    socialKeys.forEach(key => {
      if (configs[key]?.value) {
        socialLinks.value[key] = configs[key].value
      }
    })

    // 获取创业启动文章配置
    if (configs.startup_article_url?.value) {
      startupArticle.value.url = configs.startup_article_url.value
    }
    if (configs.startup_article_title?.value) {
      startupArticle.value.title = configs.startup_article_title.value
    }
  } catch (error) {
    console.error('获取社交媒体链接失败:', error)
  }
}

onMounted(async () => {
  // 获取统计数据
  await projectsStore.fetchStats()

  // 获取最新项目数据用于展示
  projectsStore.fetchProjects({ limit: 6 })

  // 获取社交媒体链接
  await loadSocialLinks()

  // 计算年度倒计时
  calculateDaysRemaining()

  // 每天更新一次倒计时
  const updateInterval = setInterval(() => {
    calculateDaysRemaining()
  }, 1000 * 60 * 60 * 24) // 24小时更新一次

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(updateInterval)
  })
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
        padding: 0px 24px;

        .hero-title-text {
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2);
        }

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

      .social-links {
        @media (max-width: 768px) {
          margin-top: 24px;

          .social-buttons {
            gap: 8px;

            .social-link {
              padding: 6px 12px;
              font-size: 0.8rem;

              .social-icon {
                font-size: 1rem;
              }
            }
          }
        }
      }

      // 优化Hero区域中所有按钮的视觉效果
      .hero-actions {
        .ai-button {
          border: 2px solid rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);

          &:not(.secondary) {
            // Primary按钮：渐变背景 + 白色边框
            background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
            color: white;

            &:hover {
              border-color: rgba(255, 255, 255, 0.9);
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3);
            }
          }

          &.secondary {
            // Secondary按钮：透明背景 + 白色边框
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.8);
            color: rgba(255, 255, 255, 0.95);

            &:hover {
              background: rgba(255, 255, 255, 0.2);
              border-color: white;
              color: white;
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
            }
          }

          &.featured {
            // Featured按钮：特色橙色渐变
            background: linear-gradient(135deg, #FF6B35, #F7931E);
            border-color: rgba(255, 255, 255, 0.8);
            color: white;

            &:hover {
              background: linear-gradient(135deg, #F7931E, #FF6B35);
              border-color: white;
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
            }
          }

          &:active {
            transform: translateY(0);
          }
        }
      }

      .social-links {
        margin-top: 32px;

        .social-buttons {
          display: flex;
          justify-content: left;
          gap: 12px;
          flex-wrap: wrap;

          .social-link {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.875rem;
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);

            .social-icon {
              font-size: 1.125rem;
            }

            .social-label {
              white-space: nowrap;
            }

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
              border-color: rgba(255, 255, 255, 0.6);
            }

            &.x-link {
              background: rgba(29, 161, 242, 0.8);
              color: white;

              &:hover {
                background: rgba(29, 161, 242, 1);
              }
            }

            &.xiaohongshu-link {
              background: rgba(255, 36, 66, 0.8);
              color: white;

              &:hover {
                background: rgba(255, 36, 66, 1);
              }
            }

            &.bilibili-link {
              background: rgba(0, 161, 214, 0.8);
              color: white;

              &:hover {
                background: rgba(0, 161, 214, 1);
              }
            }

            &.wechat-link {
              background: rgba(7, 193, 96, 0.8);
              color: white;

              &:hover {
                background: rgba(7, 193, 96, 1);
              }
            }

            &.zhihu-link {
              background: rgba(0, 132, 255, 0.8);
              color: white;

              &:hover {
                background: rgba(0, 132, 255, 1);
              }
            }

            &.csdn-link {
              background: rgba(252, 85, 49, 0.8);
              color: white;

              &:hover {
                background: rgba(252, 85, 49, 1);
              }
            }
          }
        }
      }
    }

    .hero-visual {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

          // 倒计时卡片特殊样式
          &.countdown-card {
            background: linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 69, 0, 0.2));
            border: 1px solid rgba(255, 140, 0, 0.4);
            position: relative;
            overflow: hidden;

            &::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
              transform: rotate(45deg);
              animation: shimmer 3s infinite;
            }

            .countdown-number {
              color: #ffd700;
              text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
              font-weight: 800;
            }

            .countdown-year {
              font-size: 0.75rem;
              opacity: 0.7;
              margin-top: 4px;
              color: #ffa500;
            }
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
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

  // 响应式设计
  @media (max-width: 768px) {
    .status-section {
      padding: 60px 0;

      .section-title {
        font-size: 2rem;
        margin-bottom: 32px;
      }

      .status-grid {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;

        .status-item {
          padding: 20px;
          gap: 12px;

          .status-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .status-info {
            .status-count {
              font-size: 1.25rem;
            }

            .status-label {
              font-size: 0.875rem;
            }
          }
        }
      }
    }

    .hero-section {
      padding: 60px 0;

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-visual {
        .stats-grid {
          gap: 16px;

          .stat-card {
            padding: 20px;

            .stat-number {
              font-size: 2rem;
            }
          }
        }
      }
    }

    .projects-section {
      padding: 60px 0;

      .projects-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .manifesto-section {
      padding: 60px 0;

      .manifesto-card {
        padding: 32px 20px;

        .manifesto-title {
          font-size: 1.75rem;
        }

        .manifesto-quote {
          font-size: 1.25rem;
          padding: 20px;
        }

        .manifesto-text {
          font-size: 1rem;
        }
      }
    }
  }

  @media (max-width: 600px) {
    .status-section {
      .status-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }
    }

    .hero-visual {
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
      }
    }
  }

  @media (max-width: 530px) {
    .status-section {
      .status-grid {
        grid-template-columns: repeat(2, minmax(100px, 1fr));
        gap: 12px;

        .status-item {
          padding: 16px;
          gap: 10px;

          .status-icon {
            width: 36px;
            height: 36px;
            font-size: 18px;
          }

          .status-info {
            .status-count {
              font-size: 1.125rem;
            }

            .status-label {
              font-size: 0.8rem;
            }
          }
        }
      }
    }

    .hero-visual {
      .stats-grid {
        grid-template-columns: repeat(2, minmax(100px, 1fr));
        gap: 12px;

        .stat-card {
          padding: 16px;

          .stat-number {
            font-size: 1.75rem;
          }

          .stat-label {
            font-size: 0.75rem;
          }
        }
      }
    }
  }

  // 超小屏幕强制两列布局
  @media (max-width: 360px) {
    .status-section {
      .status-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        .status-item {
          padding: 12px;
          gap: 8px;

          .status-icon {
            width: 32px;
            height: 32px;
            font-size: 16px;
          }

          .status-info {
            .status-count {
              font-size: 1rem;
            }

            .status-label {
              font-size: 0.75rem;
              line-height: 1.2;
            }
          }
        }
      }
    }

    .hero-visual {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        .stat-card {
          padding: 12px;

          .stat-number {
            font-size: 1.5rem;
          }

          .stat-label {
            font-size: 0.7rem;
            line-height: 1.2;
          }
        }
      }
    }
  }

  .wechat-group-section {
    padding: 80px 0;
    background: var(--ai-bg-secondary);
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

// 动画关键帧
@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}
</style>
