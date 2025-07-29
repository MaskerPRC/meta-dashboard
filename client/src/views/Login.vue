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

          <!-- 登录方式切换 -->
          <el-tabs v-model="activeTab" class="login-tabs">
            <!-- 账号密码登录 -->
            <el-tab-pane label="账号登录" name="local">
              <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                @submit.prevent="handleLocalLogin"
              >
                <el-form-item prop="username">
                  <el-input
                    v-model="loginForm.username"
                    placeholder="用户名或邮箱"
                    size="large"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="密码"
                    size="large"
                    show-password
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    style="width: 100%"
                    @click="handleLocalLogin"
                    :loading="loading"
                  >
                    登录
                  </el-button>
                </el-form-item>

                <div class="form-links">
                  <el-button text type="primary" @click="activeTab = 'register'">
                    还没有账号？立即注册
                  </el-button>
                </div>
              </el-form>
            </el-tab-pane>

            <!-- 注册 -->
            <el-tab-pane label="注册账号" name="register">
              <el-form
                ref="registerFormRef"
                :model="registerForm"
                :rules="registerRules"
                @submit.prevent="handleRegister"
              >
                <el-form-item prop="username">
                  <el-input
                    v-model="registerForm.username"
                    placeholder="用户名"
                    size="large"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="email">
                  <el-input
                    v-model="registerForm.email"
                    placeholder="邮箱"
                    size="large"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="phone">
                  <el-input
                    v-model="registerForm.phone"
                    placeholder="手机号（可选）"
                    size="large"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Phone /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="password">
                  <el-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="密码（至少6位）"
                    size="large"
                    show-password
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="confirmPassword">
                  <el-input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    placeholder="确认密码"
                    size="large"
                    show-password
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    style="width: 100%"
                    @click="handleRegister"
                    :loading="loading"
                  >
                    注册
                  </el-button>
                </el-form-item>

                <div class="form-links">
                  <el-button text type="primary" @click="activeTab = 'local'">
                    已有账号？立即登录
                  </el-button>
                </div>
              </el-form>
            </el-tab-pane>

            <!-- 第三方登录 -->
            <el-tab-pane label="第三方登录" name="oauth">
              <div class="oauth-buttons">
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

                 <!-- 微信登录 -->
                 <el-button
                   size="large"
                   class="login-btn wechat-btn"
                   @click="loginWithWechat"
                   :loading="loading"
                 >
                   <svg viewBox="0 0 1024 1024" width="16" height="16" style="margin-right: 8px;">
                     <path d="M664.576 346.496c-8.96 0-17.92 0.768-26.88 1.536 23.808-110.08 128.768-189.696 252.672-189.696 124.16 0 219.904 79.616 219.904 189.696 0 65.024-34.816 119.808-89.856 152.064l17.92 59.648-69.632-34.816c-26.88 5.376-44.8 10.752-71.68 10.752-7.424 0-14.848-0.256-22.272-0.768-16.896 111.36-132.096 194.56-268.8 194.56-35.84 0-71.68-8.96-103.424-18.176l-89.856 44.8 26.88-89.856c-62.208-44.8-98.048-110.08-98.048-184.32 0-131.072 116.224-224 268.8-224 7.424 0 14.848 0.256 22.272 0.768zM498.432 269.568c17.92 0 26.88-8.96 26.88-26.88s-8.96-26.88-26.88-26.88-26.88 8.96-26.88 26.88 8.96 26.88 26.88 26.88z m179.2 0c17.92 0 26.88-8.96 26.88-26.88s-8.96-26.88-26.88-26.88-26.88 8.96-26.88 26.88 8.96 26.88 26.88 26.88z m-134.4 179.2c-17.92 0-26.88 8.96-26.88 26.88s8.96 26.88 26.88 26.88 26.88-8.96 26.88-26.88-8.96-26.88-26.88-26.88z m89.856 0c-17.92 0-26.88 8.96-26.88 26.88s8.96 26.88 26.88 26.88 26.88-8.96 26.88-26.88-8.96-26.88-26.88-26.88z" fill="#1AAD16"></path>
                   </svg>
                   <span>{{ wechatLoginText }}</span>
                 </el-button>
              </div>

              <!-- 登录提示 -->
              <div class="login-tips">
                <el-alert
                  title="第三方登录说明"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <ul class="tips-list">
                      <li>首次登录将自动创建账户</li>
                      <li v-if="isInWechat">支持微信网页授权登录，安全便捷</li>
                      <li v-else>支持GitHub、Google和微信扫码登录</li>
                      <li>安全快捷，无需记住密码</li>
                      <li v-if="isInWechat">如需使用其他方式登录，请在非微信浏览器中打开</li>
                    </ul>
                  </template>
                </el-alert>
              </div>
            </el-tab-pane>
          </el-tabs>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { Cpu, ArrowLeft, User, Lock, Message, Phone } from '@element-plus/icons-vue'
import axios from '../utils/axios'
import { isWechatBrowser } from '../utils/wechatDetector'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const activeTab = ref('local')

// 微信登录相关
const isInWechat = ref(false)
const wechatLoginText = computed(() => {
  return isInWechat.value ? '使用微信登录' : '使用微信扫码登录'
})

// 登录表单数据
const loginForm = ref({
  username: '',
  password: ''
})

const loginFormRef = ref()

// 注册表单数据
const registerForm = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const registerFormRef = ref()

// 自定义验证函数
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.value.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 本地登录处理
const handleLocalLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true

    const response = await axios.post('/api/auth/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    if (response.data.success) {
      ElMessage.success('登录成功！')

      // 更新认证状态
      authStore.user = response.data.user

      // 跳转到首页或目标页面
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      ElMessage.error(response.data.message || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('登录失败，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    loading.value = true

    const response = await axios.post('/api/auth/register', {
      username: registerForm.value.username,
      email: registerForm.value.email,
      phone: registerForm.value.phone || null,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword
    })

    if (response.data.success) {
      ElMessage.success('注册成功！已自动登录')

      // 更新认证状态
      authStore.user = response.data.user

      // 跳转到首页或目标页面
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      ElMessage.error(response.data.message || '注册失败')
    }
  } catch (error) {
    console.error('注册错误:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('注册失败，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}

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

// 微信登录
const loginWithWechat = async () => {
  loading.value = true
  try {
    authStore.loginWithWechat()
  } catch (error) {
    ElMessage.error('微信登录失败，请重试')
    loading.value = false
  }
}

onMounted(async () => {
  // 检测是否在微信浏览器中
  isInWechat.value = isWechatBrowser()

  // 检查是否有登录错误
  if (route.query.error) {
    const errorType = route.query.error
    const errorMessage = route.query.message

    if (errorType === 'github') {
      ElMessage.error('GitHub登录失败，请重试')
    } else if (errorType === 'google') {
      ElMessage.error('Google登录失败，请重试')
    } else if (errorType === 'wechat') {
      ElMessage.error('微信扫码登录失败，请重试')
    } else if (errorType === 'wechat_mp') {
      ElMessage.error(errorMessage ? decodeURIComponent(errorMessage) : '微信登录失败，请重试')
    } else if (errorType === 'auth_failed') {
      ElMessage.error(errorMessage ? decodeURIComponent(errorMessage) : '登录失败')
    } else if (errorType === 'session_error') {
      ElMessage.error(errorMessage ? decodeURIComponent(errorMessage) : '登录状态保存失败')
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

      .login-tabs {
        .el-tabs__header {
          margin-bottom: 24px;
        }

        .el-tabs__nav-wrap::after {
          display: none;
        }

        .el-tabs__item {
          font-weight: 500;
          color: var(--ai-text-secondary);

          &.is-active {
            color: var(--ai-primary);
          }
        }

        .el-tabs__active-bar {
          background-color: var(--ai-primary);
        }

        .el-tab-pane {
          .el-form {
            .el-form-item {
              margin-bottom: 20px;

              .el-input__wrapper {
                border-radius: 8px;
                box-shadow: 0 0 0 1px var(--ai-border) inset;

                &:hover {
                  box-shadow: 0 0 0 1px var(--ai-primary) inset;
                }

                &.is-focus {
                  box-shadow: 0 0 0 1px var(--ai-primary) inset;
                }
              }
            }

            .form-links {
              text-align: center;
              margin-top: 16px;
            }
          }
        }
      }

      .oauth-buttons {
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
             margin: 0;

                       &:hover {
               background: #f8f9fa;
               border-color: #dadce0;
               transform: translateY(-2px);
               box-shadow: 0 8px 25px rgba(60, 64, 67, 0.15);
             }
           }

           &.wechat-btn {
             background: #1AAD16;
             border-color: #1AAD16;
             color: white;
             margin: 0;

             &:hover {
               background: #16941F;
               border-color: #16941F;
               transform: translateY(-2px);
               box-shadow: 0 8px 25px rgba(26, 173, 22, 0.3);
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
