import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '../utils/axios'
import { ElMessage } from 'element-plus'
import { isWechatBrowser } from '../utils/wechatDetector'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const loading = ref(false)
  const hasCheckedAuth = ref(false) // 添加标记，记录是否已经检查过身份验证状态

  // 计算属性
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.is_admin === 1)

  // 检查登录状态
  const checkAuthStatus = async () => {
    // 如果已经检查过且有用户信息，直接返回
    if (hasCheckedAuth.value && user.value) {
      return user.value
    }
    
    try {
      loading.value = true
      const response = await axios.get('/api/auth/status')
      if (response.data.isAuthenticated) {
        user.value = response.data.user
      } else {
        user.value = null
      }
      hasCheckedAuth.value = true
      return user.value
    } catch (error) {
      console.error('检查登录状态失败:', error)
      user.value = null
      hasCheckedAuth.value = true
    } finally {
      loading.value = false
    }
    return user.value
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await axios.get('/api/auth/user')
      if (response.data.success) {
        user.value = response.data.user
        return response.data.user
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      user.value = null
    }
    return null
  }

  // 登出
  const logout = async () => {
    try {
      loading.value = true
      await axios.post('/api/auth/logout')
      user.value = null
      hasCheckedAuth.value = false // 重置检查状态，确保下次重新检查
      ElMessage.success('登出成功')
      // 刷新页面回到首页
      window.location.href = '/'
    } catch (error) {
      console.error('登出失败:', error)
      ElMessage.error('登出失败')
    } finally {
      loading.value = false
    }
  }

  // GitHub登录
  const loginWithGitHub = (redirectTo = null) => {
    const baseUrl = (import.meta.env.NODE_ENV==='development' ? '': import.meta.env.VITE_API_BASE_URL) + '/api/auth/github';
    const currentPath = redirectTo || window.location.pathname + window.location.search;
    const loginUrl = currentPath !== '/login' ? 
      `${baseUrl}?redirect=${encodeURIComponent(currentPath)}` : 
      baseUrl;
    window.location.href = loginUrl;
  }

  // Google登录
  const loginWithGoogle = (redirectTo = null) => {
    const baseUrl = (import.meta.env.NODE_ENV==='development' ? '': import.meta.env.VITE_API_BASE_URL) + '/api/auth/google';
    const currentPath = redirectTo || window.location.pathname + window.location.search;
    const loginUrl = currentPath !== '/login' ? 
      `${baseUrl}?redirect=${encodeURIComponent(currentPath)}` : 
      baseUrl;
    window.location.href = loginUrl;
  }

  // 微信登录 - 智能选择登录方式
  const loginWithWechat = (redirectTo = null) => {
    // 检测是否在微信浏览器中
    if (isWechatBrowser()) {
      // 在微信浏览器中，使用公众号网页授权
      loginWithWechatMp(redirectTo);
    } else {
      // 不在微信浏览器中，使用开放平台扫码登录
      loginWithWechatQr(redirectTo);
    }
  }

  // 微信开放平台扫码登录（原有的微信登录）
  const loginWithWechatQr = (redirectTo = null) => {
    const baseUrl = (import.meta.env.NODE_ENV==='development' ? '': import.meta.env.VITE_API_BASE_URL) + '/api/auth/wechat';
    const currentPath = redirectTo || window.location.pathname + window.location.search;
    const loginUrl = currentPath !== '/login' ? 
      `${baseUrl}?redirect=${encodeURIComponent(currentPath)}` : 
      baseUrl;
    window.location.href = loginUrl;
  }

  // 微信公众号网页授权登录
  const loginWithWechatMp = (redirectTo = null) => {
    const baseUrl = (import.meta.env.NODE_ENV==='development' ? '': import.meta.env.VITE_API_BASE_URL) + '/api/auth/wechat-mp';
    const currentPath = redirectTo || window.location.pathname + window.location.search;
    const loginUrl = currentPath !== '/login' ? 
      `${baseUrl}?redirect=${encodeURIComponent(currentPath)}` : 
      baseUrl;
    window.location.href = loginUrl;
  }

  // 更新用户基本信息
  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      const response = await axios.put('/api/auth/profile', profileData)
      
      if (response.data.success) {
        // 更新本地用户信息
        user.value = response.data.user
        ElMessage.success(response.data.message)
        return { success: true, user: response.data.user }
      } else {
        ElMessage.error(response.data.message || '更新失败')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      const errorMessage = error.response?.data?.message || '更新失败，请稍后重试'
      ElMessage.error(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // 修改密码
  const changePassword = async (passwordData) => {
    try {
      loading.value = true
      const response = await axios.post('/api/auth/change-password', passwordData)
      
      if (response.data.success) {
        ElMessage.success(response.data.message)
        return { success: true }
      } else {
        ElMessage.error(response.data.message || '密码修改失败')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('修改密码失败:', error)
      const errorMessage = error.response?.data?.message || '密码修改失败，请稍后重试'
      ElMessage.error(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    user,
    loading,
    hasCheckedAuth,

    // 计算属性
    isAuthenticated,
    isAdmin,

    // 方法
    checkAuthStatus,
    getUserInfo,
    logout,
    loginWithGitHub,
    loginWithGoogle,
    loginWithWechat,
    loginWithWechatQr,
    loginWithWechatMp,
    updateProfile,
    changePassword
  }
})
