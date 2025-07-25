<template>
  <div id="app" class="ai-dashboard">
    <!-- 顶部导航栏 -->
    <Header />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 全局通知组件 -->
    <Notifications />
  </div>
</template>

<script setup>
import Header from './components/layout/Header.vue'
import Notifications from './components/common/Notifications.vue'
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // 检查登录状态
  authStore.checkAuthStatus()
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .main-content {
    min-height: calc(100vh - 70px);
    padding-top: 70px;
    
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.3s ease;
    }
    
    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
    }
  }
}

// 自定义Element Plus主题色彩
:root {
  --el-color-primary: #6366f1;
  --el-color-primary-light-3: #8b87f7;
  --el-color-primary-light-5: #a5a0f8;
  --el-color-primary-light-7: #bfb9fa;
  --el-color-primary-light-8: #cfc7fb;
  --el-color-primary-light-9: #dfd7fc;
  --el-color-primary-dark-2: #5045e5;
}

// AI主题配色
:root {
  --ai-primary: #6366f1;
  --ai-secondary: #8b5cf6;
  --ai-accent: #06b6d4;
  --ai-success: #10b981;
  --ai-warning: #f59e0b;
  --ai-error: #ef4444;
  --ai-bg-primary: #ffffff;
  --ai-bg-secondary: #f8fafc;
  --ai-text-primary: #1e293b;
  --ai-text-secondary: #64748b;
  --ai-border: #e2e8f0;
}

// 暗色主题
html.dark {
  --ai-bg-primary: #0f172a;
  --ai-bg-secondary: #1e293b;
  --ai-text-primary: #f1f5f9;
  --ai-text-secondary: #94a3b8;
  --ai-border: #334155;
}
</style> 