<template>
  <div class="about-page">
    <div class="container">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-content">
                     <h1 class="hero-title">{{ $t('about.title') }}</h1>
          <p class="hero-subtitle">{{ $t('about.subtitle') }}</p>
          <div class="hero-stats">
            <div class="stat-card">
              <div class="stat-number">{{ projectsStore.projects.length || 0 }}</div>
              <div class="stat-label">{{ $t('about.stats.launched_projects') }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ projectsStore.totalProgress || 0 }}%</div>
              <div class="stat-label">{{ $t('about.stats.average_progress') }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ projectsStore.statusCounts.completed || 0 }}</div>
              <div class="stat-label">{{ $t('about.stats.completed_projects') }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 挑战介绍 -->
      <section class="introduction-section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('about.challenge_info.title') }}</h2>
          <p class="section-subtitle">{{ $t('about.challenge_info.why_title') }}</p>
        </div>

        <div class="intro-content">
          <div class="intro-card ai-card">
            <div class="card-icon">
              <el-icon size="48"><Cpu /></el-icon>
            </div>
            <h3 class="card-title">{{ $t('about.challenge_info.tech_dividend.title') }}</h3>
            <p class="card-description">
              {{ $t('about.challenge_info.tech_dividend.content') }}
            </p>
          </div>

                     <div class="intro-card ai-card">
             <div class="card-icon">
               <el-icon size="48"><ArrowUp /></el-icon>
             </div>
            <h3 class="card-title">{{ $t('about.challenge_info.personal_breakthrough.title') }}</h3>
            <p class="card-description">
              {{ $t('about.challenge_info.personal_breakthrough.content') }}
            </p>
          </div>

          <div class="intro-card ai-card">
            <div class="card-icon">
              <el-icon size="48"><Connection /></el-icon>
            </div>
            <h3 class="card-title">{{ $t('about.challenge_info.transparent_sharing.title') }}</h3>
            <p class="card-description">
              {{ $t('about.challenge_info.transparent_sharing.content') }}
            </p>
          </div>
        </div>
      </section>

      <!-- 挑战规则 -->
      <section class="rules-section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('about.challenge_rules.title') }}</h2>
          <p class="section-subtitle">{{ $t('about.challenge_rules.subtitle') }}</p>
        </div>

        <div class="rules-grid">
          <div class="rule-item ai-card">
            <div class="rule-number">01</div>
            <h3 class="rule-title">{{ $t('about.challenge_rules.target_quantity.title') }}</h3>
            <p class="rule-description">
              {{ $t('about.challenge_rules.target_quantity.content') }}
            </p>
          </div>

          <div class="rule-item ai-card">
            <div class="rule-number">02</div>
            <h3 class="rule-title">{{ $t('about.challenge_rules.criteria.title') }}</h3>
            <p class="rule-description">
              {{ $t('about.challenge_rules.criteria.content') }}
            </p>
          </div>

          <div class="rule-item ai-card">
            <div class="rule-number">03</div>
            <h3 class="rule-title">{{ $t('about.challenge_rules.transparency.title') }}</h3>
            <p class="rule-description">
              {{ $t('about.challenge_rules.transparency.content') }}
            </p>
          </div>

          <div class="rule-item ai-card">
            <div class="rule-number">04</div>
            <h3 class="rule-title">{{ $t('about.challenge_rules.toolstack.title') }}</h3>
            <p class="rule-description">
              {{ $t('about.challenge_rules.toolstack.content') }}
            </p>
          </div>

          <div class="rule-item ai-card">
            <div class="rule-number">05</div>
            <h3 class="rule-title">{{ $t('about.challenge_rules.iteration.title') }}</h3>
            <p class="rule-description">
              {{ $t('about.challenge_rules.iteration.content') }}
            </p>
          </div>

          <div class="rule-item ai-card">
            <div class="rule-number">06</div>
            <h3 class="rule-title">{{ $t('about.challenge_rules.review_rhythm.title') }}</h3>
            <p class="rule-description">
              {{ $t('about.challenge_rules.review_rhythm.content') }}
            </p>
          </div>
        </div>
      </section>

      <!-- 技术选择 -->
      <section class="tech-section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('about.tech_stack.title') }}</h2>
          <p class="section-subtitle">{{ $t('about.tech_stack.subtitle') }}</p>
        </div>

        <div class="tech-categories">
          <div class="tech-category ai-card">
            <h3 class="category-title">
              <el-icon><Cpu /></el-icon>
              {{ $t('about.tech_stack.ai_tools.title') }}
            </h3>
            <div class="tech-list">
              <el-tag v-for="tool in techStack.ai_tools" :key="tool" class="tech-tag">
                {{ tool }}
              </el-tag>
            </div>
          </div>

          <div class="tech-category ai-card">
            <h3 class="category-title">
              <el-icon><Monitor /></el-icon>
              {{ $t('about.tech_stack.frontend.title') }}
            </h3>
            <div class="tech-list">
              <el-tag v-for="tech in techStack.frontend" :key="tech" class="tech-tag">
                {{ tech }}
              </el-tag>
            </div>
          </div>

          <div class="tech-category ai-card">
            <h3 class="category-title">
              <el-icon><Platform /></el-icon>
              {{ $t('about.tech_stack.backend.title') }}
            </h3>
            <div class="tech-list">
              <el-tag v-for="tech in techStack.backend" :key="tech" class="tech-tag">
                {{ tech }}
              </el-tag>
            </div>
          </div>

          <div class="tech-category ai-card">
            <h3 class="category-title">
              <el-icon><Upload /></el-icon>
              {{ $t('about.tech_stack.deployment.title') }}
            </h3>
            <div class="tech-list">
              <el-tag v-for="platform in techStack.deployment" :key="platform" class="tech-tag">
                {{ platform }}
              </el-tag>
            </div>
          </div>
        </div>
      </section>

      <!-- 参与方式 -->
      <section class="participation-section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('about.how_to_participate.title') }}</h2>
          <p class="section-subtitle">{{ $t('about.how_to_participate.subtitle') }}</p>
        </div>

        <div class="participation-grid">
          <div class="participation-card ai-card">
            <div class="card-icon">
              <el-icon size="40"><ChatDotSquare /></el-icon>
            </div>
            <h3 class="card-title">{{ $t('about.how_to_participate.feedback.title') }}</h3>
            <p class="card-description">
              {{ $t('about.how_to_participate.feedback.content') }}
            </p>
          </div>

          <div class="participation-card ai-card">
            <div class="card-icon">
              <el-icon size="40"><Share /></el-icon>
            </div>
            <h3 class="card-title">{{ $t('about.how_to_participate.exchange.title') }}</h3>
            <p class="card-description">
              {{ $t('about.how_to_participate.exchange.content') }}
            </p>
          </div>

          <div class="participation-card ai-card">
            <div class="card-icon">
              <el-icon size="40"><Connection /></el-icon>
            </div>
            <h3 class="card-title">{{ $t('about.how_to_participate.cooperation.title') }}</h3>
            <p class="card-description">
              {{ $t('about.how_to_participate.cooperation.content') }}
            </p>
          </div>

          <div class="participation-card ai-card">
            <div class="card-icon">
              <el-icon size="40"><Trophy /></el-icon>
            </div>
            <h3 class="card-title">{{ $t('about.how_to_participate.encouragement.title') }}</h3>
            <p class="card-description">
              {{ $t('about.how_to_participate.encouragement.content') }}
            </p>
          </div>
        </div>
      </section>

      <!-- 联系方式 -->
      <section class="contact-section">
        <div class="contact-card ai-card">
          <h2 class="contact-title">{{ $t('about.contact.title') }}</h2>
          <p class="contact-description">
            {{ $t('about.contact.subtitle') }}
          </p>

          <div class="contact-methods">
            <div class="contact-item interactive" @click="openEmail">
              <el-icon><Message /></el-icon>
              <span>{{ $t('about.contact.email') }}：maskerprc@gmail.com</span>
              <el-tag size="small" class="action-hint">{{ $t('about.contact.click_email') }}</el-tag>
            </div>
            <div class="contact-item interactive" @click="openGithub">
              <el-icon><Link /></el-icon>
              <span>{{ $t('about.contact.github') }}：https://github.com/MaskerPRC</span>
              <el-tag size="small" class="action-hint">{{ $t('about.contact.click_visit') }}</el-tag>
            </div>
            <div class="contact-item interactive" @click="copyWechat">
              <el-icon><ChatDotSquare /></el-icon>
              <span>{{ $t('about.contact.wechat') }}：QQTommer</span>
              <el-tag size="small" class="action-hint">{{ $t('about.contact.click_copy') }}</el-tag>
            </div>
            <div class="contact-item interactive" @click="callPhone">
              <el-icon><Phone /></el-icon>
              <span>{{ $t('about.contact.phone') }}：13022898959</span>
              <el-tag size="small" class="action-hint">{{ $t('about.contact.click_call') }}</el-tag>
            </div>
          </div>

          <div class="contact-actions">
            <el-button type="primary" size="large">
              <el-icon><ChatDotSquare /></el-icon>
              {{ $t('comment.add_comment') }}
            </el-button>
            <router-link to="/projects">
              <el-button size="large">
                <el-icon><View /></el-icon>
                {{ $t('home.view_projects') }}
              </el-button>
            </router-link>
          </div>
        </div>
      </section>

      <!-- 微信群二维码 -->
      <section class="wechat-group-section" v-if="wechatGroupConfig.qr">
        <div class="wechat-group-card ai-card">
          <h2 class="wechat-group-title">{{ wechatGroupConfig.title }}</h2>
          <p class="wechat-group-description">
            {{ wechatGroupConfig.description }}
          </p>
          
          <div class="qr-container">
            <div class="qr-image-wrapper">
              <img 
                :src="wechatGroupConfig.qr" 
                alt="微信群二维码" 
                class="qr-image"
              />
              <div class="qr-overlay">
                <el-icon class="qr-icon"><ChatDotSquare /></el-icon>
                <span class="qr-hint">扫码加群</span>
              </div>
            </div>
          </div>
          
          <div class="wechat-group-tips">
            <p class="tip-text">
              <el-icon><ChatDotSquare /></el-icon>
              扫描上方二维码，或长按保存到相册后用微信扫一扫
            </p>
          </div>
        </div>
      </section>

      <!-- 底部宣言 -->
      <section class="manifesto-section">
        <div class="manifesto-content">
          <blockquote class="manifesto-quote">
            {{ $t('about.conclusion.quote') }}
          </blockquote>
          <p class="manifesto-signature">{{ $t('about.conclusion.signature') }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useProjectsStore } from '../stores/projects'
import axios from '../utils/axios'
import {
  Cpu, ArrowUp, Connection, Monitor, Platform, Upload,
  ChatDotSquare, Share, Trophy, Message, Link, View, Phone
} from '@element-plus/icons-vue'

const { t } = useI18n()
const projectsStore = useProjectsStore()

// 计算技术栈数据
const techStack = computed(() => {
  const { locale } = useI18n()
  
  // 定义工具数组 - 避免i18n问题
  const toolsData = {
    ai_tools: ['Cursor', 'Claude', 'ChatGPT', 'GitHub Copilot', 'v0.dev', 'Bolt.new'],
    frontend: ['Vue.js', 'React', 'Next.js', 'Nuxt.js', 'TypeScript', 'Tailwind CSS', 'Element Plus'],
    backend: ['Node.js', 'Python', 'FastAPI', 'Express', 'NestJS', 'Supabase', 'Firebase'],
    deployment: ['Vercel', 'Netlify', 'Railway', 'Render', 'Cloudflare', 'AWS', 'Zeabur']
  }
  
  return toolsData
})

// 微信群配置
const wechatGroupConfig = ref({
  qr: '',
  title: t('about.how_to_participate.title'),
  description: t('about.how_to_participate.subtitle')
})

// 联系方式交互方法
const openEmail = () => {
  window.location.href = 'mailto:maskerprc@gmail.com?subject=关于100个AI产品挑战&body=您好，我看到了您的100个AI产品挑战...'
  ElMessage.success('正在打开邮件客户端...')
}

const openGithub = () => {
  window.open('https://github.com/MaskerPRC', '_blank')
  ElMessage.success('正在打开GitHub页面...')
}

const copyWechat = async () => {
  try {
    await navigator.clipboard.writeText('QQTommer')
    ElMessage.success('微信号已复制到剪贴板！可以打开微信搜索添加好友')
  } catch (err) {
    // 降级处理：创建临时文本域来复制
    const textArea = document.createElement('textarea')
    textArea.value = 'QQTommer'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('微信号已复制到剪贴板！可以打开微信搜索添加好友')
  }
}

const callPhone = () => {
  window.location.href = 'tel:13022898959'
  ElMessage.success('正在启动拨号功能...')
}

// 加载微信群配置
const loadWechatGroupConfig = async () => {
  try {
    const response = await axios.get('/api/config')
    const configs = response.data.configs
    
    if (configs.wechat_group_qr?.value) {
      wechatGroupConfig.value.qr = configs.wechat_group_qr.value
    }
    if (configs.wechat_group_title?.value) {
      wechatGroupConfig.value.title = configs.wechat_group_title.value
    }
    if (configs.wechat_group_description?.value) {
      wechatGroupConfig.value.description = configs.wechat_group_description.value
    }
  } catch (error) {
    console.error('获取微信群配置失败:', error)
    // 静默失败，不显示错误信息给用户
  }
}

onMounted(() => {
  // 获取项目统计数据
  projectsStore.fetchProjects({ limit: 100 })
  // 加载微信群配置
  loadWechatGroupConfig()
})
</script>

<style lang="scss" scoped>
.about-page {
  min-height: calc(100vh - 70px);

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  section {
    margin-bottom: 80px;

    &:last-child {
      margin-bottom: 40px;
    }
  }

  .section-header {
    text-align: center;
    margin-bottom: 48px;

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 16px;
      color: var(--ai-text-primary);
    }

    .section-subtitle {
      font-size: 1.125rem;
      color: var(--ai-text-secondary);
      margin: 0;
    }
  }

  .hero-section {
    text-align: center;
    padding: 80px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px;
    margin-bottom: 80px;

         .hero-title {
       font-size: 3.5rem;
       font-weight: 800;
       margin: 0 0 24px;
       line-height: 1.1;
       color: white;
       text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

       @media (max-width: 768px) {
         font-size: 2.5rem;
       }
     }

    .hero-subtitle {
      font-size: 1.25rem;
      margin: 0 0 48px;
      opacity: 0.9;
      line-height: 1.6;
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      max-width: 600px;
      margin: 0 auto;

      .stat-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 24px;

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

  .introduction-section {
    .intro-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;

      .intro-card {
        padding: 32px;
        text-align: center;

        .card-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
          border-radius: 20px;
          color: white;
          margin-bottom: 24px;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 16px;
          color: var(--ai-text-primary);
        }

        .card-description {
          color: var(--ai-text-secondary);
          line-height: 1.6;
          margin: 0;
        }
      }
    }
  }

  .rules-section {
    .rules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;

      .rule-item {
        padding: 24px;
        position: relative;

        .rule-number {
          position: absolute;
          top: -12px;
          left: 24px;
          background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .rule-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 12px 0 12px;
          color: var(--ai-text-primary);
        }

        .rule-description {
          color: var(--ai-text-secondary);
          line-height: 1.6;
          margin: 0;
        }
      }
    }
  }

  .tech-section {
    .tech-categories {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;

      .tech-category {
        padding: 24px;

        .category-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 16px;
          color: var(--ai-text-primary);
        }

        .tech-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .tech-tag {
            background: var(--ai-bg-secondary);
            border: 1px solid var(--ai-border);
            color: var(--ai-text-primary);
          }
        }
      }
    }
  }

  .participation-section {
    .participation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;

      .participation-card {
        padding: 24px;
        text-align: center;

        .card-icon {
          color: var(--ai-primary);
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 12px;
          color: var(--ai-text-primary);
        }

        .card-description {
          color: var(--ai-text-secondary);
          line-height: 1.6;
          margin: 0;
        }
      }
    }
  }

  .contact-section {
    .contact-card {
      padding: 40px;
      text-align: center;

      .contact-title {
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 16px;
        color: var(--ai-text-primary);
      }

      .contact-description {
        font-size: 1.125rem;
        color: var(--ai-text-secondary);
        margin: 0 0 32px;
      }

      .contact-methods {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 32px;

        .contact-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--ai-text-primary);
          padding: 12px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;

          .el-icon {
            color: var(--ai-primary);
            transition: all 0.3s ease;
          }

          .action-hint {
            margin-left: 8px;
            opacity: 0.7;
            transition: opacity 0.3s ease;
          }

          &.interactive {
            cursor: pointer;
            
            &:hover {
              background: var(--ai-bg-secondary);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

              .el-icon {
                color: var(--ai-secondary);
                transform: scale(1.1);
              }

              .action-hint {
                opacity: 1;
              }
            }

            &:active {
              transform: translateY(0);
            }
          }
        }
      }

      .contact-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }

  .wechat-group-section {
    .wechat-group-card {
      padding: 40px;
      text-align: center;
      max-width: 500px;
      margin: 0 auto;

      .wechat-group-title {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 16px;
        color: var(--ai-text-primary);
      }

      .wechat-group-description {
        font-size: 1rem;
        color: var(--ai-text-secondary);
        margin: 0 0 32px;
        line-height: 1.6;
      }

      .qr-container {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;

        .qr-image-wrapper {
          position: relative;
          width: 200px;
          height: 200px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);

            .qr-overlay {
              opacity: 1;
            }
          }

          .qr-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .qr-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            opacity: 0;
            transition: opacity 0.3s ease;

            .qr-icon {
              font-size: 32px;
              margin-bottom: 8px;
            }

            .qr-hint {
              font-size: 14px;
              font-weight: 500;
            }
          }
        }
      }

      .wechat-group-tips {
        .tip-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--ai-text-secondary);
          font-size: 0.875rem;
          margin: 0;

          .el-icon {
            color: #07c160;
          }
        }
      }
    }
  }

  .manifesto-section {
    text-align: center;
    padding: 60px 0;

    .manifesto-content {
      max-width: 800px;
      margin: 0 auto;

      .manifesto-quote {
        font-size: 1.5rem;
        font-style: italic;
        line-height: 1.8;
        margin: 0 0 24px;
        padding: 32px;
        background: rgba(99, 102, 241, 0.1);
        border-left: 4px solid var(--ai-primary);
        border-radius: 8px;
        color: var(--ai-text-primary);
      }

      .manifesto-signature {
        font-size: 1.125rem;
        color: var(--ai-text-secondary);
        margin: 0;
      }
    }
  }
}
</style>
