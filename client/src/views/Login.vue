<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card ai-card">
        <!-- Logo和标题 -->
        <div class="login-header">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon size="48"><Cpu /></el-icon>
            </div>
            <h1 class="title gradient-text">AI项目看板</h1>
            <p class="subtitle">一年100个AI产品挑战</p>
          </div>
        </div>

        <!-- 登录表单 -->
        <div class="login-form">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">选择您喜欢的方式登录，参与AI产品挑战之旅</p>

          <div class="login-buttons">
            <!-- GitHub登录 -->
                         <el-button 
               size="large" 
               class="login-btn github-btn"
               @click="loginWithGitHub"
               :loading="loading"
             >
               <svg viewBox="0 0 1024 1024" width="16" height="16" style="margin-right: 8px;">
                 <path d="M512 12.64c-282.752 0-512 229.216-512 512 0 226.208 146.688 418.144 350.08 485.824 25.6 4.736 35.008-11.104 35.008-24.64 0-12.192-0.48-52.544-0.704-95.328-142.464 30.976-172.512-60.416-172.512-60.416-23.296-59.168-56.832-74.912-56.832-74.912-46.464-31.776 3.52-31.136 3.52-31.136 51.392 3.616 78.464 52.768 78.464 52.768 45.664 78.272 119.776 55.648 148.992 42.56 4.576-33.088 17.856-55.68 32.512-68.48-113.728-12.928-233.28-56.864-233.28-253.024 0-55.904 19.936-101.568 52.672-137.44-5.312-12.896-22.848-64.96 4.96-135.488 0 0 42.88-13.76 140.8 52.48 40.832-11.36 84.64-17.024 128.16-17.248 43.488 0.192 87.328 5.888 128.256 17.248 97.856-66.24 140.672-52.48 140.672-52.48 27.872 70.528 10.336 122.592 5.024 135.488 32.832 35.84 52.608 81.536 52.608 137.44 0 196.64-119.776 239.936-233.792 252.64 18.368 15.904 34.72 47.04 34.72 94.816 0 68.512-0.608 123.648-0.608 140.512 0 13.632 9.216 29.6 35.168 24.576C877.44 942.08 1024 750.208 1024 524.64c0-282.784-229.248-512-512-512z" fill="currentColor"></path>
               </svg>
               <span>使用 GitHub 登录</span>
             </el-button>

             <!-- Google登录 -->
             <el-button 
               size="large" 
               class="login-btn google-btn"
               @click="loginWithGoogle"
               :loading="loading"
             >
               <svg viewBox="0 0 1024 1024" width="16" height="16" style="margin-right: 8px;">
                 <path d="M881 442.4H519.7v148.5h206.4c-8.9 48-35.9 88.6-76.6 115.8-34.4 23-78.3 36.6-129.9 36.6-99.9 0-184.4-67.5-214.6-158.2-7.6-23-12-47.6-12-72.9s4.4-49.9 12-72.9c30.3-90.6 114.8-158.1 214.6-158.1 56.3 0 106.8 19.4 146.6 57.4l110-110.1c-66.5-62-153.2-100-256.6-100-149.9 0-279.6 86.8-342.7 213.1C59.2 307.2 32 378.4 32 456.8c0 78.2 27.2 149.4 74.2 206.1 63.1 126.3 192.8 213.1 342.7 213.1 118.3 0 218.8-38.6 291.4-104.8 85.8-78.5 137.1-194.8 137.1-327.2 0-24.6-2.3-49.3-6.9-72.8z" fill="#4285f4"></path>
               </svg>
               <span>使用 Google 登录</span>
             </el-button>
          </div>

          <!-- 登录提示 -->
          <div class="login-tips">
            <el-alert
              title="登录说明"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <ul class="tips-list">
                  <li>首次登录将自动创建账户</li>
                  <li>支持GitHub和Google账号登录</li>
                  <li>登录后可以查看项目详情和评论</li>
                  <li>管理员可以创建和管理AI项目</li>
                </ul>
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 页面底部 -->
        <div class="login-footer">
          <p class="footer-text">
            继续即表示您同意我们的服务条款和隐私政策
          </p>
          <router-link to="/" class="back-home">
            <el-button text type="primary">
              <el-icon><ArrowLeft /></el-icon>
              返回首页
            </el-button>
          </router-link>
        </div>
      </div>

      <!-- 背景装饰 -->
      <div class="background-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { Cpu, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)

// GitHub登录
const loginWithGitHub = async () => {
  loading.value = true
  try {
    authStore.loginWithGitHub()
  } catch (error) {
    ElMessage.error('GitHub登录失败，请重试')
    loading.value = false
  }
}

// Google登录
const loginWithGoogle = async () => {
  loading.value = true
  try {
    authStore.loginWithGoogle()
  } catch (error) {
    ElMessage.error('Google登录失败，请重试')
    loading.value = false
  }
}

onMounted(() => {
  // 检查是否有登录错误
  if (route.query.error) {
    const errorType = route.query.error
    if (errorType === 'github') {
      ElMessage.error('GitHub登录失败，请重试')
    } else if (errorType === 'google') {
      ElMessage.error('Google登录失败，请重试')
    }
  }

  // 如果已经登录，重定向到首页
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  .login-container {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 400px;
    
    .login-card {
      padding: 40px;
      text-align: center;
      backdrop-filter: blur(20px);
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.2);
      
      @media (max-width: 480px) {
        padding: 30px 20px;
      }
    }
    
    .login-header {
      margin-bottom: 32px;
      
      .logo-section {
        .logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
          border-radius: 20px;
          color: white;
          margin: 0 auto 16px;
        }
        
        .title {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 8px;
        }
        
        .subtitle {
          font-size: 0.875rem;
          color: var(--ai-text-secondary);
          margin: 0;
        }
      }
    }
    
    .login-form {
      .form-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ai-text-primary);
        margin: 0 0 8px;
      }
      
      .form-subtitle {
        font-size: 0.875rem;
        color: var(--ai-text-secondary);
        margin: 0 0 32px;
        line-height: 1.5;
      }
      
      .login-buttons {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;
        
        .login-btn {
          height: 48px;
          width: 100%;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s ease;
          
          &.github-btn {
            background: #24292e;
            border-color: #24292e;
            color: white;
            
            &:hover {
              background: #1a1e22;
              border-color: #1a1e22;
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(36, 41, 46, 0.3);
            }
          }
          
          &.google-btn {
            background: white;
            border-color: #dadce0;
            color: #3c4043;
            
            &:hover {
              background: #f8f9fa;
              border-color: #dadce0;
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(60, 64, 67, 0.15);
            }
          }
          
          .el-icon {
            margin-right: 8px;
          }
        }
      }
      
      .login-tips {
        text-align: left;
        
        .tips-list {
          margin: 0;
          padding-left: 16px;
          color: var(--ai-text-secondary);
          font-size: 0.875rem;
          
          li {
            margin-bottom: 4px;
            
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
    
    .login-footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--ai-border);
      
      .footer-text {
        font-size: 0.75rem;
        color: var(--ai-text-secondary);
        margin: 0 0 16px;
        line-height: 1.4;
      }
      
      .back-home {
        text-decoration: none;
      }
    }
  }
  
  .background-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    
    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      
      &.circle-1 {
        width: 200px;
        height: 200px;
        top: 10%;
        left: -5%;
        animation: float 6s ease-in-out infinite;
      }
      
      &.circle-2 {
        width: 150px;
        height: 150px;
        top: 60%;
        right: -5%;
        animation: float 4s ease-in-out infinite reverse;
      }
      
      &.circle-3 {
        width: 100px;
        height: 100px;
        bottom: 20%;
        left: 10%;
        animation: float 5s ease-in-out infinite;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

// 暗色主题
html.dark .login-page {
  .login-container .login-card {
    background: rgba(15, 23, 42, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style> 