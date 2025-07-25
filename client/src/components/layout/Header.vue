<template>
  <header class="ai-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo和标题 -->
        <div class="header-left">
          <router-link to="/" class="logo-section">
            <div class="logo-icon">
              <el-icon size="32"><Cpu /></el-icon>
            </div>
            <div class="logo-text">
              <h1 class="title">AI项目看板</h1>
              <p class="subtitle">一年100个AI产品挑战</p>
            </div>
          </router-link>
        </div>
        
        <!-- 导航菜单 - 桌面版 -->
        <nav class="header-nav desktop-nav">
          <router-link to="/" class="nav-item">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </router-link>
          <router-link to="/projects" class="nav-item">
            <el-icon><List /></el-icon>
            <span>项目列表</span>
          </router-link>
          <router-link to="/about" class="nav-item">
            <el-icon><InfoFilled /></el-icon>
            <span>关于挑战</span>
          </router-link>
        </nav>
        
        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn" @click="toggleMobileMenu">
          <el-button circle>
            <el-icon><Menu /></el-icon>
          </el-button>
        </div>
        
        <!-- 用户区域 -->
        <div class="header-right">
          <!-- 主题切换 -->
          <el-button 
            circle 
            @click="toggleTheme"
            class="theme-toggle"
          >
            <el-icon>
              <component :is="isDark ? 'Sunny' : 'Moon'" />
            </el-icon>
          </el-button>
          
          <!-- 用户菜单 -->
          <div v-if="authStore.isAuthenticated" class="user-menu">
            <el-dropdown trigger="click" @command="handleUserCommand">
              <div class="user-avatar">
                <el-avatar 
                  :src="authStore.user?.avatar_url" 
                  :size="36"
                >
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ authStore.user?.display_name || authStore.user?.username }}</span>
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人资料
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="authStore.isAdmin" 
                    command="admin"
                  >
                    <el-icon><Setting /></el-icon>
                    管理后台
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <!-- 登录按钮 -->
          <div v-else class="login-buttons">
            <router-link to="/login">
              <el-button type="primary">
                <el-icon><User /></el-icon>
                登录
              </el-button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 移动端菜单抽屉 -->
    <div 
      v-if="showMobileMenu" 
      class="mobile-menu-overlay"
      @click="toggleMobileMenu"
    >
      <nav 
        class="mobile-menu"
        @click.stop
      >
        <div class="mobile-menu-header">
          <h3>导航菜单</h3>
          <el-button 
            circle 
            text 
            @click="toggleMobileMenu"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="mobile-menu-items">
          <router-link 
            to="/" 
            class="mobile-nav-item"
            @click="toggleMobileMenu"
          >
            <el-icon><House /></el-icon>
            <span>首页</span>
          </router-link>
          <router-link 
            to="/projects" 
            class="mobile-nav-item"
            @click="toggleMobileMenu"
          >
            <el-icon><List /></el-icon>
            <span>项目列表</span>
          </router-link>
          <router-link 
            to="/about" 
            class="mobile-nav-item"
            @click="toggleMobileMenu"
          >
            <el-icon><InfoFilled /></el-icon>
            <span>关于挑战</span>
          </router-link>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { 
  Cpu, House, List, InfoFilled, User, ArrowDown, 
  Setting, SwitchButton, Moon, Sunny, Menu, Close
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const isDark = ref(false)
const showMobileMenu = ref(false)

// 主题切换
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// 移动菜单切换
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// 用户菜单命令处理
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      // 打开个人资料弹窗或页面
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      authStore.logout()
      break
  }
}

onMounted(() => {
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<style lang="scss" scoped>
.ai-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--ai-border);
  z-index: 1000;
  
  .header-content {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .header-left {
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
      
      .logo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
        border-radius: 12px;
        color: white;
      }
      
      .logo-text {
        .title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .subtitle {
          font-size: 12px;
          color: var(--ai-text-secondary);
          margin: 0;
        }
      }
    }
  }
  
  .header-nav {
    display: flex;
    gap: 24px;
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      text-decoration: none;
      color: var(--ai-text-secondary);
      border-radius: 8px;
      transition: all 0.3s ease;
      font-size: 14px;
      font-weight: 500;
      
      &:hover, &.router-link-active {
        color: var(--ai-primary);
        background: rgba(99, 102, 241, 0.1);
      }
    }
  }
  
  // 移动端菜单按钮 - 默认隐藏
  .mobile-menu-btn {
    display: none;
  }
  
  // 移动端菜单覆盖层
  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding-top: 70px;
  }
  
  // 移动端菜单
  .mobile-menu {
    background: var(--ai-bg-primary);
    border: 1px solid var(--ai-border);
    border-radius: 12px 0 0 12px;
    width: 280px;
    max-height: calc(100vh - 90px);
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    
    .mobile-menu-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid var(--ai-border);
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--ai-text-primary);
      }
    }
    
    .mobile-menu-items {
      padding: 16px;
      
      .mobile-nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        text-decoration: none;
        color: var(--ai-text-secondary);
        border-radius: 8px;
        transition: all 0.3s ease;
        font-size: 15px;
        font-weight: 500;
        margin-bottom: 8px;
        
        &:hover, &.router-link-active {
          color: var(--ai-primary);
          background: rgba(99, 102, 241, 0.1);
        }
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .theme-toggle {
      width: 40px;
      height: 40px;
      border: 1px solid var(--ai-border);
      
      &:hover {
        color: var(--ai-primary);
        border-color: var(--ai-primary);
      }
    }
    
    .user-menu {
      .user-avatar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s ease;
        
        &:hover {
          background: rgba(99, 102, 241, 0.1);
        }
        
        .username {
          font-size: 14px;
          font-weight: 500;
          color: var(--ai-text-primary);
        }
        
        .dropdown-icon {
          font-size: 12px;
          color: var(--ai-text-secondary);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .ai-header {
    // 隐藏桌面版导航菜单
    .desktop-nav {
      display: none;
    }
    
    // 显示移动端菜单按钮
    .mobile-menu-btn {
      display: block;
    }
    
    .logo-text .title {
      font-size: 16px;
    }
    
    .logo-text .subtitle {
      display: none;
    }
    
    // 调整header右侧间距
    .header-right {
      gap: 12px;
    }
  }
}

// 暗色主题
html.dark .ai-header {
  background: rgba(15, 23, 42, 0.95);
  border-bottom-color: var(--ai-border);
}
</style> 