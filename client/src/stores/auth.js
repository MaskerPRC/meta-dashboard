import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '../utils/axios'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const loading = ref(false)
  
  // 计算属性
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.is_admin === 1)
  
  // 检查登录状态
  const checkAuthStatus = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/auth/status')
      if (response.data.isAuthenticated) {
        user.value = response.data.user
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      user.value = null
    } finally {
      loading.value = false
    }
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
  const loginWithGitHub = () => {
    window.location.href = '/api/auth/github'
  }
  
  // Google登录
  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google'
  }
  
  return {
    // 状态
    user,
    loading,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    
    // 方法
    checkAuthStatus,
    getUserInfo,
    logout,
    loginWithGitHub,
    loginWithGoogle
  }
}) 