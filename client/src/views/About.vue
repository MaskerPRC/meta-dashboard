<template>
  <div class="about-page">
    <div class="container">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-content">
                     <h1 class="hero-title">一年100个AI产品挑战</h1>
          <p class="hero-subtitle">把梦想落在键盘上，用代码书写AI时代的个人传奇</p>
          <div class="hero-stats">
            <div class="stat-card">
              <div class="stat-number">{{ projectsStore.projects.length || 0 }}</div>
              <div class="stat-label">已启动项目</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ projectsStore.totalProgress || 0 }}%</div>
              <div class="stat-label">平均进度</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ projectsStore.statusCounts.completed || 0 }}</div>
              <div class="stat-label">已完成项目</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 挑战介绍 -->
      <section class="introduction-section">
        <div class="section-header">
          <h2 class="section-title">关于这个挑战</h2>
          <p class="section-subtitle">为什么要在2025年做100个AI产品？</p>
        </div>

        <div class="intro-content">
          <div class="intro-card ai-card">
            <div class="card-icon">
              <el-icon size="48"><Cpu /></el-icon>
            </div>
            <h3 class="card-title">技术红利时代</h3>
            <p class="card-description">
              LLM的普及正在带来"软件的超级高产时代"。个人开发者甚至非技术人员都能快速产出大量软件，
              深入各行各业，解决过去工程界久攻不下的问题。
            </p>
          </div>

                     <div class="intro-card ai-card">
             <div class="card-icon">
               <el-icon size="48"><ArrowUp /></el-icon>
             </div>
            <h3 class="card-title">个人能力突破</h3>
            <p class="card-description">
              通过持续的产品开发实践，验证AI工具的真实能力，积累从想法到产品的完整经验，
              在AI让我们"真正只做想做的事"之前，先做一件足够挑战自己的事。
            </p>
          </div>

          <div class="intro-card ai-card">
            <div class="card-icon">
              <el-icon size="48"><Connection /></el-icon>
            </div>
            <h3 class="card-title">透明分享</h3>
            <p class="card-description">
              记录每一个产品的构思、开发、上线和反馈过程，分享做产品的经验、踩过的坑、复盘思考，
              为其他AI产品开发者提供参考。
            </p>
          </div>
        </div>
      </section>

      <!-- 挑战规则 -->
      <section class="rules-section">
        <div class="section-header">
          <h2 class="section-title">挑战规则</h2>
          <p class="section-subtitle">明确的目标和标准，确保挑战的可执行性</p>
        </div>

        <div class="rules-grid">
          <div class="rule-item ai-card">
            <div class="rule-number">01</div>
            <h3 class="rule-title">目标数量</h3>
            <p class="rule-description">
              2025年发布100个可用的AI产品（平均约3.6天/个）
            </p>
          </div>

          <div class="rule-item ai-card">
            <div class="rule-number">02</div>
            <h3 class="rule-title">判定标准</h3>
            <p class="rule-description">
              能被真实用户使用（哪怕是极小众），有清晰功能与价值
            </p>
          </div>

          <div class="rule-item ai-card">
            <div class="rule-number">03</div>
            <h3 class="rule-title">过程透明</h3>
            <p class="rule-description">
              每款产品的灵感、开发记录、上线情况、数据反馈都会公开
            </p>
          </div>

          <div class="rule-item ai-card">
            <div class="rule-number">04</div>
            <h3 class="rule-title">工具栈</h3>
            <p class="rule-description">
              主力使用LLM辅助开发（Cursor、Claude等），加速从想法到上线
            </p>
          </div>

          <div class="rule-item ai-card">
            <div class="rule-number">05</div>
            <h3 class="rule-title">允许迭代</h3>
            <p class="rule-description">
              每个产品上线后可继续优化，但不影响下一个产品的推进
            </p>
          </div>

          <div class="rule-item ai-card">
            <div class="rule-number">06</div>
            <h3 class="rule-title">复盘节奏</h3>
            <p class="rule-description">
              每完成10个产品，做一次阶段复盘，调整方向和策略
            </p>
          </div>
        </div>
      </section>

      <!-- 技术选择 -->
      <section class="tech-section">
        <div class="section-header">
          <h2 class="section-title">技术工具栈</h2>
          <p class="section-subtitle">充分利用AI工具提升开发效率</p>
        </div>

        <div class="tech-categories">
          <div class="tech-category ai-card">
            <h3 class="category-title">
              <el-icon><Cpu /></el-icon>
              AI开发工具
            </h3>
            <div class="tech-list">
              <el-tag v-for="tool in aiTools" :key="tool" class="tech-tag">
                {{ tool }}
              </el-tag>
            </div>
          </div>

          <div class="tech-category ai-card">
            <h3 class="category-title">
              <el-icon><Monitor /></el-icon>
              前端技术
            </h3>
            <div class="tech-list">
              <el-tag v-for="tech in frontendTech" :key="tech" class="tech-tag">
                {{ tech }}
              </el-tag>
            </div>
          </div>

          <div class="tech-category ai-card">
            <h3 class="category-title">
              <el-icon><Platform /></el-icon>
              后端技术
            </h3>
            <div class="tech-list">
              <el-tag v-for="tech in backendTech" :key="tech" class="tech-tag">
                {{ tech }}
              </el-tag>
            </div>
          </div>

          <div class="tech-category ai-card">
            <h3 class="category-title">
              <el-icon><Upload /></el-icon>
              部署平台
            </h3>
            <div class="tech-list">
              <el-tag v-for="platform in deployPlatforms" :key="platform" class="tech-tag">
                {{ platform }}
              </el-tag>
            </div>
          </div>
        </div>
      </section>

      <!-- 参与方式 -->
      <section class="participation-section">
        <div class="section-header">
          <h2 class="section-title">如何参与</h2>
          <p class="section-subtitle">欢迎以各种方式参与这个挑战</p>
        </div>

        <div class="participation-grid">
          <div class="participation-card ai-card">
            <div class="card-icon">
              <el-icon size="40"><ChatDotSquare /></el-icon>
            </div>
            <h3 class="card-title">反馈产品</h3>
            <p class="card-description">
              试用我的产品，告诉我你的感受和建议，帮助我改进产品质量。
            </p>
          </div>

          <div class="participation-card ai-card">
            <div class="card-icon">
              <el-icon size="40"><Share /></el-icon>
            </div>
            <h3 class="card-title">交流想法</h3>
            <p class="card-description">
              如果你也在做类似的事，欢迎互相借鉴，分享经验和资源。
            </p>
          </div>

          <div class="participation-card ai-card">
            <div class="card-icon">
              <el-icon size="40"><Connection /></el-icon>
            </div>
            <h3 class="card-title">资源合作</h3>
            <p class="card-description">
              如果你有需求、数据、渠道等资源，欢迎对接探讨合作机会。
            </p>
          </div>

          <div class="participation-card ai-card">
            <div class="card-icon">
              <el-icon size="40"><Trophy /></el-icon>
            </div>
            <h3 class="card-title">纯粹鼓励</h3>
            <p class="card-description">
              一句"加油"，也是燃料。你的关注和支持是我前进的动力。
            </p>
          </div>
        </div>
      </section>

      <!-- 联系方式 -->
      <section class="contact-section">
        <div class="contact-card ai-card">
          <h2 class="contact-title">联系我</h2>
          <p class="contact-description">
            有任何想法、建议或合作意向，欢迎随时联系
          </p>

          <div class="contact-methods">
            <div class="contact-item interactive" @click="openEmail">
              <el-icon><Message /></el-icon>
              <span>邮箱：maskerprc@gmail.com</span>
              <el-tag size="small" class="action-hint">点击发邮件</el-tag>
            </div>
            <div class="contact-item interactive" @click="openGithub">
              <el-icon><Link /></el-icon>
              <span>GitHub：https://github.com/MaskerPRC</span>
              <el-tag size="small" class="action-hint">点击访问</el-tag>
            </div>
            <div class="contact-item interactive" @click="copyWechat">
              <el-icon><ChatDotSquare /></el-icon>
              <span>微信：QQTommer</span>
              <el-tag size="small" class="action-hint">点击复制</el-tag>
            </div>
            <div class="contact-item interactive" @click="callPhone">
              <el-icon><Phone /></el-icon>
              <span>手机：13022898959</span>
              <el-tag size="small" class="action-hint">点击拨打</el-tag>
            </div>
          </div>

          <div class="contact-actions">
            <el-button type="primary" size="large">
              <el-icon><ChatDotSquare /></el-icon>
              开始对话
            </el-button>
            <router-link to="/projects">
              <el-button size="large">
                <el-icon><View /></el-icon>
                查看项目
              </el-button>
            </router-link>
          </div>
        </div>
      </section>

      <!-- 底部宣言 -->
      <section class="manifesto-section">
        <div class="manifesto-content">
          <blockquote class="manifesto-quote">
            "2025年，我会把这100个小小的软件，作为我和这个时代对话的方式。
            它们不一定每个都完美，但每一个都是真诚的尝试。"
          </blockquote>
          <p class="manifesto-signature">—— 继续向前的我</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useProjectsStore } from '../stores/projects'
import {
  Cpu, ArrowUp, Connection, Monitor, Platform, Upload,
  ChatDotSquare, Share, Trophy, Message, Link, View, Phone
} from '@element-plus/icons-vue'

const projectsStore = useProjectsStore()

// 技术栈数据
const aiTools = ref([
  'Cursor', 'Claude', 'ChatGPT', 'GitHub Copilot', 'v0.dev', 'Bolt.new'
])

const frontendTech = ref([
  'Vue.js', 'React', 'Next.js', 'Nuxt.js', 'TypeScript', 'Tailwind CSS', 'Element Plus'
])

const backendTech = ref([
  'Node.js', 'Python', 'FastAPI', 'Express', 'NestJS', 'Supabase', 'Firebase'
])

const deployPlatforms = ref([
  'Vercel', 'Netlify', 'Railway', 'Render', 'Cloudflare', 'AWS', 'Zeabur'
])

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

onMounted(() => {
  // 获取项目统计数据
  projectsStore.fetchProjects({ limit: 100 })
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
