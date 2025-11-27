<template>
  <main class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="neo-card p-8 md:p-12 bg-white max-w-md w-full relative">
      <!-- Logo和标题 -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-black text-white flex items-center justify-center font-black text-2xl border-2 border-white shadow-sm mx-auto mb-4">
          AI
        </div>
        <h1 class="font-display font-black text-3xl mb-2">{{ $t('home.title') }}</h1>
        <p class="text-gray-600 font-medium">{{ $t('home.subtitle') }}</p>
      </div>

      <!-- 登录表单 -->
      <div>
        <h2 class="text-2xl font-black mb-2 text-center">{{ $t('auth.welcome_back') }}</h2>
        <p class="text-sm text-gray-600 mb-6 text-center">{{ $t('auth.login_description') }}</p>

        <!-- 登录方式切换 -->
        <el-tabs v-model="activeTab" class="login-tabs">
          <!-- 账号密码登录 -->
          <el-tab-pane :label="$t('auth.account_login')" name="local">
            <div class="tab-content-wrapper">
              <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                @submit.prevent="handleLocalLogin"
                class="login-form"
              >
                <el-form-item prop="username" class="mb-4">
                  <div class="relative">
                    <input
                      v-model="loginForm.username"
                      type="text"
                      :placeholder="$t('auth.username_or_email')"
                      class="w-full bg-gray-100 border-2 border-black px-4 py-3 pl-10 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                    />
                    <i class="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  </div>
                </el-form-item>

                <el-form-item prop="password" class="mb-4">
                  <div class="relative">
                    <input
                      v-model="loginForm.password"
                      type="password"
                      :placeholder="$t('auth.password')"
                      class="w-full bg-gray-100 border-2 border-black px-4 py-3 pl-10 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                    />
                    <i class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  </div>
                </el-form-item>

                <el-form-item>
                  <button
                    type="submit"
                    @click="handleLocalLogin"
                    :disabled="loading"
                    class="neo-btn bg-black text-white w-full py-3 hover:bg-gray-800 font-bold disabled:opacity-50"
                  >
                    <span v-if="!loading">{{ $t('auth.login_button') }}</span>
                    <span v-else>{{ $t('auth.logging_in') }}</span>
                  </button>
                </el-form-item>

                <div class="text-center mt-4">
                  <button 
                    @click="activeTab = 'register'"
                    class="text-sm font-bold text-gray-600 hover:text-black underline"
                  >
                    {{ $t('auth.no_account') }} {{ $t('auth.register_now') }}
                  </button>
                </div>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- 注册 -->
          <el-tab-pane :label="$t('auth.register_account')" name="register">
            <div class="tab-content-wrapper">
              <el-form
                ref="registerFormRef"
                :model="registerForm"
                :rules="registerRules"
                @submit.prevent="handleRegister"
                class="login-form"
              >
                <el-form-item prop="username" class="mb-4">
                  <div class="relative">
                    <input
                      v-model="registerForm.username"
                      type="text"
                      :placeholder="$t('auth.username')"
                      class="w-full bg-gray-100 border-2 border-black px-4 py-3 pl-10 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                    />
                    <i class="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  </div>
                </el-form-item>

                <el-form-item prop="email" class="mb-4">
                  <div class="relative">
                    <input
                      v-model="registerForm.email"
                      type="email"
                      :placeholder="$t('auth.email')"
                      class="w-full bg-gray-100 border-2 border-black px-4 py-3 pl-10 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                    />
                    <i class="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  </div>
                </el-form-item>

                <el-form-item prop="phone" class="mb-4">
                  <div class="relative">
                    <input
                      v-model="registerForm.phone"
                      type="tel"
                      :placeholder="$t('auth.phone_optional')"
                      class="w-full bg-gray-100 border-2 border-black px-4 py-3 pl-10 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                    />
                    <i class="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  </div>
                </el-form-item>

                <el-form-item prop="password" class="mb-4">
                  <div class="relative">
                    <input
                      v-model="registerForm.password"
                      type="password"
                      :placeholder="$t('auth.password_placeholder')"
                      class="w-full bg-gray-100 border-2 border-black px-4 py-3 pl-10 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                    />
                    <i class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  </div>
                </el-form-item>

                <el-form-item prop="confirmPassword" class="mb-4">
                  <div class="relative">
                    <input
                      v-model="registerForm.confirmPassword"
                      type="password"
                      :placeholder="$t('auth.confirm_password')"
                      class="w-full bg-gray-100 border-2 border-black px-4 py-3 pl-10 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                    />
                    <i class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  </div>
                </el-form-item>

                <el-form-item>
                  <button
                    type="submit"
                    @click="handleRegister"
                    :disabled="loading"
                    class="neo-btn bg-neo-green text-black w-full py-3 hover:bg-green-400 font-bold disabled:opacity-50"
                  >
                    <span v-if="!loading">{{ $t('auth.register_button') }}</span>
                    <span v-else>{{ $t('auth.registering') }}</span>
                  </button>
                </el-form-item>

                <div class="text-center mt-4">
                  <button 
                    @click="activeTab = 'local'"
                    class="text-sm font-bold text-gray-600 hover:text-black underline"
                  >
                    {{ $t('auth.has_account') }} {{ $t('auth.login_now') }}
                  </button>
                </div>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- 第三方登录 -->
          <el-tab-pane :label="$t('auth.oauth_login')" name="oauth">
            <div class="tab-content-wrapper">
              <div class="space-y-4">
                <!-- GitHub登录 -->
                <button
                  @click="loginWithGitHub"
                  :disabled="loading"
                  class="neo-btn bg-[#24292e] text-white w-full py-3 hover:bg-[#1a1e22] font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <i class="fa-brands fa-github text-xl"></i>
                  <span>{{ $t('auth.github_login') }}</span>
                </button>

                <!-- Google登录 -->
                <button
                  @click="loginWithGoogle"
                  :disabled="loading"
                  class="neo-btn bg-white border-2 border-black w-full py-3 hover:bg-gray-100 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <i class="fa-brands fa-google text-xl"></i>
                  <span>{{ $t('auth.google_login') }}</span>
                </button>

                <!-- 微信登录 -->
                <button
                  @click="loginWithWechat"
                  :disabled="loading"
                  class="neo-btn bg-[#1AAD16] text-white w-full py-3 hover:bg-[#16941F] font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <i class="fa-brands fa-weixin text-xl"></i>
                  <span>{{ wechatLoginText }}</span>
                </button>
              </div>

              <!-- 登录提示 -->
              <div class="mt-6 p-4 bg-gray-100 border-2 border-black border-dashed rounded">
                <p class="text-xs font-bold mb-2">{{ $t('auth.oauth_login_note') }}</p>
                <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>{{ $t('auth.oauth_note_1') }}</li>
                  <li v-if="isInWechat">{{ $t('auth.oauth_note_wechat') }}</li>
                  <li v-else>{{ $t('auth.oauth_note_scan') }}</li>
                  <li>{{ $t('auth.oauth_note_2') }}</li>
                </ul>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 页面底部 -->
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500 mb-4">
          {{ $t('auth.terms_notice') }}
        </p>
        <router-link to="/" class="neo-btn bg-white px-4 py-2 text-sm hover:bg-gray-100 inline-flex items-center gap-2">
          <i class="fa-solid fa-arrow-left"></i>
          {{ $t('auth.back_to_home') }}
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { showNotification } from '../utils/notification'
import axios from '../utils/axios'
import { isWechatBrowser } from '../utils/wechatDetector'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const activeTab = ref('local')

// 微信登录相关
const isInWechat = ref(false)
const wechatLoginText = computed(() => {
  return isInWechat.value ? t('auth.wechat_login') : t('auth.wechat_scan_login')
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
    callback(new Error(t('auth.validation.confirm_password_again')))
  } else if (value !== registerForm.value.password) {
    callback(new Error(t('auth.validation.confirm_password_mismatch')))
  } else {
    callback()
  }
}

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: t('auth.validation.username_required'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('auth.validation.password_required'), trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: t('auth.validation.username_required_register'), trigger: 'blur' },
    { min: 3, max: 20, message: t('auth.validation.username_length'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: t('auth.validation.username_pattern'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('auth.validation.email_required'), trigger: 'blur' },
    { type: 'email', message: t('auth.validation.email_invalid'), trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: t('auth.validation.phone_invalid'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('auth.validation.password_required'), trigger: 'blur' },
    { min: 6, message: t('auth.validation.password_min'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('auth.validation.confirm_password_required'), trigger: 'blur' },
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
      showNotification.success(t('auth.messages.welcome_back'), t('auth.messages.login_success'))

      // 更新认证状态
      authStore.user = response.data.user

      // 触发微信群弹窗
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { user: response.data.user } 
        }))
      }, 1000)

      // 跳转到首页或目标页面
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      showNotification.error(response.data.message || t('auth.messages.login_failed'), t('auth.messages.login_failed'))
    }
  } catch (error) {
    console.error('登录错误:', error)
    if (error.response?.data?.message) {
      showNotification.error(error.response.data.message, t('auth.messages.login_failed'))
    } else {
      showNotification.error('请检查网络连接后重试', '网络错误')
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
      showNotification.success(t('auth.messages.register_success_auto_login'), t('auth.messages.register_success'))

      // 更新认证状态
      authStore.user = response.data.user

      // 触发微信群弹窗（新用户注册）
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { user: response.data.user, isNewUser: true } 
        }))
      }, 1000)

      // 跳转到首页或目标页面
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      showNotification.error(response.data.message || t('auth.messages.register_failed'), t('auth.messages.register_failed'))
    }
  } catch (error) {
    console.error('注册错误:', error)
    if (error.response?.data?.message) {
      showNotification.error(error.response.data.message, t('auth.messages.register_failed'))
    } else {
      showNotification.error('请检查网络连接后重试', '网络错误')
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
    showNotification.error('GitHub登录失败，请重试', '登录失败')
    loading.value = false
  }
}

// Google登录
const loginWithGoogle = async () => {
  loading.value = true
  try {
    authStore.loginWithGoogle()
  } catch (error) {
    showNotification.error('Google登录失败，请重试', '登录失败')
    loading.value = false
  }
}

// 微信登录
const loginWithWechat = async () => {
  loading.value = true
  try {
    authStore.loginWithWechat()
  } catch (error) {
    showNotification.error(t('auth.messages.wechat_login_failed'), t('auth.messages.login_failed'))
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
      showNotification.error(t('auth.messages.github_login_failed'), t('auth.messages.login_failed'))
    } else if (errorType === 'google') {
      showNotification.error(t('auth.messages.google_login_failed'), t('auth.messages.login_failed'))
    } else if (errorType === 'wechat') {
      showNotification.error(t('auth.messages.wechat_scan_login_failed'), t('auth.messages.login_failed'))
    } else if (errorType === 'wechat_mp') {
      showNotification.error(errorMessage ? decodeURIComponent(errorMessage) : t('auth.messages.wechat_login_failed'), t('auth.messages.login_failed'))
    } else if (errorType === 'auth_failed') {
      showNotification.error(errorMessage ? decodeURIComponent(errorMessage) : t('auth.messages.login_failed'), t('auth.messages.auth_failed'))
    } else if (errorType === 'session_error') {
      showNotification.error(errorMessage ? decodeURIComponent(errorMessage) : t('auth.messages.session_save_failed'), t('auth.messages.session_error'))
    }
  }

  // 如果已经登录，重定向到首页
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style lang="scss" scoped>
.login-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-weight: 700;
    color: #666;
    border: 2px solid transparent;
    border-radius: 6px;
    margin-right: 4px;

    &.is-active {
      color: black;
      background: #f3f4f6;
      border-color: black;
    }
  }

  :deep(.el-tabs__active-bar) {
    display: none;
  }

  // 强制el-form-item块级显示，解决宽度压缩问题
  :deep(.el-form-item) {
    display: block;
    width: 100%;
    margin-bottom: 16px;
  }

  // 恢复内容区域默认行为，确保宽度100%
  :deep(.el-form-item__content) {
    display: block;
    width: 100%;
    margin-left: 0 !important;
    line-height: normal;
  }

  // 确保tab-pane有足够的最小高度
  :deep(.el-tab-pane) {
    min-height: 520px;
  }
}

// Tab内容包装器 - 统一所有tab的padding
.tab-content-wrapper {
  padding: 0 20px;
  width: 100%;
}

// 登录表单样式 - 移除默认的padding
.login-form {
  padding: 0;
  margin: 0;
}

// 确保el-form没有额外的margin
:deep(.el-form) {
  margin: 0;
  padding: 0;
}
</style>
