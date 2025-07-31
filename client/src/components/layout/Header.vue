<template>
  <header class="ai-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo和标题 -->
        <div class="header-left">
          <router-link to="/" class="logo-section">
            <div class="logo-icon">
              <img src="/logo.png" alt="AI项目看板" class="logo-image" />
            </div>
            <div class="logo-text">
              <h1 class="title">{{ $t('home.title') }}</h1>
              <p class="subtitle">{{ $t('home.subtitle') }}</p>
            </div>
          </router-link>
          
          <!-- GitHub开源标识 - 紧贴标题右侧 -->
          <div class="github-badge desktop-only">
            <a 
              href="https://github.com/MaskerPRC/meta-dashboard" 
              target="_blank" 
              class="github-link"
              @click="trackGitHubClick"
              title="查看GitHub源码"
            >
              <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span class="github-text">GitHub</span>
              <span v-if="starCount !== null" class="star-count">{{ starCount }}</span>
              <span v-else class="star-count">--</span>
            </a>
          </div>
        </div>
        
        <!-- 导航菜单 - 桌面版 -->
        <nav class="header-nav desktop-nav">
          <router-link to="/" class="nav-item" active-class="router-link-active" @click="handleNavClick('/')">
            <el-icon><House /></el-icon>
            <span>{{ $t('nav.home') }}</span>
          </router-link>
          <router-link to="/projects" class="nav-item" active-class="router-link-active" @click="handleNavClick('/projects')">
            <el-icon><List /></el-icon>
            <span>{{ $t('nav.projects') }}</span>
          </router-link>
          <router-link to="/ideas" class="nav-item" active-class="router-link-active" @click="handleNavClick('/ideas')">
            <el-icon><Star /></el-icon>
            <span>{{ $t('nav.ideas') }}</span>
          </router-link>
          <router-link to="/global-history" class="nav-item" active-class="router-link-active" @click="handleNavClick('/global-history')">
            <el-icon><Clock /></el-icon>
            <span>{{ $t('nav.global_history') }}</span>
          </router-link>
          <router-link 
            v-if="isPublicResumeAvailable"
            to="/resume" 
            class="nav-item" 
            active-class="router-link-active" 
            @click="handleNavClick('/resume')"
          >
            <el-icon><Document /></el-icon>
            <span>简历</span>
          </router-link>

          <router-link to="/about" class="nav-item" active-class="router-link-active" @click="handleNavClick('/about')">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ $t('nav.about') }}</span>
          </router-link>
        </nav>
        
        <!-- 用户区域 -->
        <div class="header-right">
          <!-- 语言切换 - 仅桌面端显示 -->
          <LanguageSwitcher />
          
          <!-- 移动端操作区域 -->
          <div class="mobile-actions">
            <!-- 移动端菜单按钮 -->
            <div class="mobile-menu-btn" @click="toggleMobileMenu">
              <el-button class="mobile-menu-toggle">
                <el-icon><Menu /></el-icon>
                <span>菜单</span>
              </el-button>
            </div>
            
            <!-- 移动端登录按钮 -->
            <div v-if="!authStore.isAuthenticated" class="mobile-login-btn">
              <router-link to="/login">
                <el-button class="mobile-login-toggle">
                  <el-icon><User /></el-icon>
                  <span>登录</span>
                </el-button>
              </router-link>
            </div>
            
            <!-- 移动端主题切换 -->
            <el-button 
              @click="toggleTheme"
              class="mobile-theme-toggle"
            >
              <el-icon>
                <component :is="isDark ? 'Sunny' : 'Moon'" />
              </el-icon>
              <span>{{ isDark ? '浅色' : '深色' }}</span>
            </el-button>
          </div>
          
          <!-- 桌面端主题切换 -->
          <el-button 
            circle 
            @click="toggleTheme"
            class="desktop-theme-toggle"
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
                    {{ $t('auth.profile') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="my-resume">
                    <el-icon><Document /></el-icon>
                    编辑简历
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="authStore.isAdmin" 
                    command="admin"
                  >
                    <el-icon><Setting /></el-icon>
                    {{ $t('nav.admin') }}
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    {{ $t('nav.logout') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <!-- 桌面端登录按钮 -->
          <div v-else class="desktop-login-buttons">
            <router-link to="/login">
              <el-button type="primary" class="desktop-login-btn">
                <el-icon><User /></el-icon>
                {{ $t('nav.login') }}
              </el-button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 移动端菜单抽屉 -->
    <Transition name="mobile-overlay" appear>
      <div 
        v-if="showMobileMenu" 
        class="mobile-menu-overlay"
        @click="toggleMobileMenu"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <Transition name="mobile-drawer" appear>
          <nav 
            v-if="showMobileMenu"
            class="mobile-menu"
            @click.stop
            ref="mobileMenuRef"
          >
            <div class="mobile-menu-header">
              <h3>{{ $t('nav.title') }}</h3>
              <el-button 
                circle 
                text 
                @click="toggleMobileMenu"
                class="close-btn"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            
            <div class="mobile-menu-items">
              <router-link 
                to="/" 
                class="mobile-nav-item"
                :class="{ 'active': $route.path === '/' }"
                @click="handleMobileNavClick('/')"
              >
                <el-icon><House /></el-icon>
                <span>{{ $t('nav.home') }}</span>
              </router-link>
              <router-link 
                to="/projects" 
                class="mobile-nav-item"
                :class="{ 'active': $route.path === '/projects' }"
                @click="handleMobileNavClick('/projects')"
              >
                <el-icon><List /></el-icon>
                <span>{{ $t('nav.projects') }}</span>
              </router-link>
              <router-link 
                to="/ideas" 
                class="mobile-nav-item"
                :class="{ 'active': $route.path === '/ideas' }"
                @click="handleMobileNavClick('/ideas')"
              >
                <el-icon><Star /></el-icon>
                <span>{{ $t('nav.ideas') }}</span>
              </router-link>
              <router-link 
                to="/global-history" 
                class="mobile-nav-item"
                :class="{ 'active': $route.path === '/global-history' }"
                @click="handleMobileNavClick('/global-history')"
              >
                <el-icon><Clock /></el-icon>
                <span>{{ $t('nav.global_history') }}</span>
              </router-link>
              <router-link 
                v-if="isPublicResumeAvailable"
                to="/resume" 
                class="mobile-nav-item"
                :class="{ 'active': $route.path === '/resume' }"
                @click="handleMobileNavClick('/resume')"
              >
                <el-icon><Document /></el-icon>
                <span>简历</span>
              </router-link>

              <router-link 
                to="/about" 
                class="mobile-nav-item"
                :class="{ 'active': $route.path === '/about' }"
                @click="handleMobileNavClick('/about')"
              >
                <el-icon><InfoFilled /></el-icon>
                <span>{{ $t('nav.about') }}</span>
              </router-link>
              
              <!-- GitHub开源链接 -->
              <a 
                href="https://github.com/MaskerPRC/meta-dashboard" 
                target="_blank" 
                class="mobile-nav-item github-mobile-link"
                @click="handleMobileGitHubClick"
              >
                <svg class="github-icon-mobile" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub {{ starCount !== null ? `(${starCount})` : '' }}</span>
              </a>
              
              <!-- 移动端用户区域 -->
              <div class="mobile-user-section">
                <div v-if="authStore.isAuthenticated" class="mobile-user-info">
                  <div class="user-profile">
                    <el-avatar 
                      :src="authStore.user?.avatar_url" 
                      :size="32"
                    >
                      <el-icon><User /></el-icon>
                    </el-avatar>
                    <span class="username">{{ authStore.user?.display_name || authStore.user?.username }}</span>
                  </div>
                  <div class="mobile-user-actions">
                    <el-button 
                      text
                      @click="handleMobileUserAction('profile')"
                      class="mobile-action-btn"
                    >
                      <el-icon><User /></el-icon>
                      {{ $t('auth.profile') }}
                    </el-button>

                    <el-button 
                      v-if="authStore.isAdmin" 
                      text
                      @click="handleMobileUserAction('admin')"
                      class="mobile-action-btn"
                    >
                      <el-icon><Setting /></el-icon>
                      {{ $t('nav.admin') }}
                    </el-button>
                    <el-button 
                      text
                      @click="handleMobileUserAction('logout')"
                      class="mobile-action-btn logout-btn"
                    >
                      <el-icon><SwitchButton /></el-icon>
                      {{ $t('nav.logout') }}
                    </el-button>
                  </div>
                </div>
                <div v-else class="mobile-login">
                  <el-button 
                    type="primary" 
                    @click="handleMobileNavClick('/login')"
                    class="mobile-login-btn"
                  >
                    <el-icon><User /></el-icon>
                    {{ $t('nav.login') }}
                  </el-button>
                </div>
              </div>
            </div>
          </nav>
        </Transition>
      </div>
    </Transition>
    
    <!-- 个人资料弹窗 -->
    <ProfileDialog v-model="showProfileDialog" />
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import LanguageSwitcher from '../common/LanguageSwitcher.vue'
import ProfileDialog from '../common/ProfileDialog.vue'
import { 
  House, List, InfoFilled, User, ArrowDown, 
  Setting, SwitchButton, Moon, Sunny, Menu, Close, Clock, Document, Star
} from '@element-plus/icons-vue'
import axios from '../../utils/axios'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const isDark = ref(false)
const showMobileMenu = ref(false)
const showProfileDialog = ref(false)
const mobileMenuRef = ref(null)
const isPublicResumeAvailable = ref(false)
const starCount = ref(null)

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

// 触摸事件处理
const handleTouchStart = (e) => {
  // 记录触摸开始位置
  e.currentTarget.touchStartX = e.touches[0].clientX
}

const handleTouchEnd = (e) => {
  const touchEndX = e.changedTouches[0].clientX
  const touchStartX = e.currentTarget.touchStartX
  
  // 右滑关闭菜单
  if (touchEndX - touchStartX > 100) {
    toggleMobileMenu()
  }
}

// 导航点击处理
const handleNavClick = (path) => {
  console.log('Navigation clicked:', path)
  router.push(path)
}

// 移动端导航点击处理
const handleMobileNavClick = (path) => {
  console.log('Mobile navigation clicked:', path)
  toggleMobileMenu()
  router.push(path)
}

// 移动端用户操作处理
const handleMobileUserAction = (action) => {
  toggleMobileMenu()
  handleUserCommand(action)
}

// 用户菜单命令处理
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      showProfileDialog.value = true
      break
    case 'my-resume':
      router.push('/my-resume')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      authStore.logout()
      break
  }
}

// 检查公开简历是否可用
const checkPublicResumeStatus = async () => {
  try {
    const response = await axios.get('/api/resumes/public/status')
    isPublicResumeAvailable.value = response.data.available
  } catch (error) {
    console.error('检查公开简历状态失败:', error)
    isPublicResumeAvailable.value = false
  }
}

// 获取GitHub星标数
const fetchGitHubStars = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/MaskerPRC/meta-dashboard')
    if (response.ok) {
      const data = await response.json()
      starCount.value = data.stargazers_count
    }
  } catch (error) {
    console.error('获取GitHub星标数失败:', error)
    starCount.value = 0
  }
}

// GitHub点击追踪
const trackGitHubClick = () => {
  console.log('GitHub链接被点击')
  // 这里可以添加埋点统计
}

// 移动端GitHub点击处理
const handleMobileGitHubClick = () => {
  toggleMobileMenu()
  trackGitHubClick()
}

onMounted(async () => {
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
  
  // 检查公开简历状态
  await checkPublicResumeStatus()
  
  // 获取GitHub星标数
  await fetchGitHubStars()
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
  
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
     .header-content {
     height: 70px;
     display: flex;
     align-items: center;
     justify-content: space-between;
     min-width: 0;
   }
  
     .header-left {
     flex: 1;
     min-width: 0;
     display: flex;
     align-items: center;
     gap: 16px;
     
     .logo-section {
       display: flex;
       align-items: center;
       gap: 12px;
       text-decoration: none;
       color: inherit;
       min-width: 0;
       flex-shrink: 0;
      
      .logo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        overflow: hidden;
        
        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
      
             .logo-text {
         min-width: 0;
         flex: 1;
         
         .title {
           font-size: 20px;
           font-weight: 700;
           margin: 0;
           line-height: 1.2;
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
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
    
    // GitHub开源徽章
    .github-badge {
      flex-shrink: 0;
      
      .github-link {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        text-decoration: none;
        color: var(--ai-text-secondary);
        border: 1px solid var(--ai-border);
        border-radius: 16px;
        background: var(--ai-bg-primary);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        
        &:hover {
          color: #24292f;
          border-color: #24292f;
          background: #f6f8fa;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(36, 41, 47, 0.15);
        }
        
        .github-icon {
          width: 16px;
          height: 16px;
          color: #24292f;
        }
        
        .github-text {
          font-weight: 500;
          color: #24292f;
        }
        
        .star-count {
          background: #f59e0b;
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          min-width: 18px;
          text-align: center;
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
      cursor: pointer;
      position: relative;
      z-index: 10;
      
      &:hover, &.router-link-active {
        color: var(--ai-primary);
        background: rgba(99, 102, 241, 0.1);
      }
    }
  }
  
     // 移动端操作区域
   .mobile-actions {
     display: none;
     gap: 8px;
     align-items: center;
   }
   
   // 统一的移动端按钮样式
   .mobile-menu-toggle,
   .mobile-login-toggle,
   .mobile-theme-toggle {
     display: flex;
     align-items: center;
     gap: 6px;
     padding: 8px 16px;
     border-radius: 20px;
     background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
     color: white;
     border: none;
     font-size: 14px;
     font-weight: 500;
     min-width: 80px;
     height: 36px;
     box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
     
     &:hover {
       transform: translateY(-1px);
       box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
       background: linear-gradient(135deg, var(--ai-primary-dark, #5b21b6), var(--ai-secondary-dark, #7c3aed));
     }
     
     &:active {
       transform: translateY(0);
       box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
     }
     
     .el-icon {
       font-size: 16px;
     }
     
     span {
       font-size: 13px;
       font-weight: 500;
     }
   }
   
   // 桌面端主题切换按钮
   .desktop-theme-toggle {
     width: 40px;
     height: 40px;
     border: 1px solid var(--ai-border);
     
     &:hover {
       color: var(--ai-primary);
       border-color: var(--ai-primary);
     }
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
      
      .close-btn {
        width: 32px;
        height: 32px;
        
        &:hover {
          color: var(--ai-primary);
        }
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
        
        &:hover, &.router-link-active, &.active {
          color: var(--ai-primary);
          background: rgba(99, 102, 241, 0.1);
        }
        
        &.github-mobile-link {
          background: rgba(36, 41, 47, 0.05);
          border: 1px solid rgba(36, 41, 47, 0.1);
          
          .github-icon-mobile {
            width: 16px;
            height: 16px;
            color: #24292f;
          }
          
          &:hover {
            background: rgba(36, 41, 47, 0.1);
            color: #24292f;
            
            .github-icon-mobile {
              color: #24292f;
            }
          }
        }
        
        &:last-child {
          margin-bottom: 0;
        }
      }
      
      .mobile-user-section {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid var(--ai-border);
        
        .mobile-user-info {
          .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            margin-bottom: 12px;
            background: rgba(99, 102, 241, 0.05);
            border-radius: 8px;
            
            .username {
              font-size: 14px;
              font-weight: 500;
              color: var(--ai-text-primary);
            }
          }
          
          .mobile-user-actions {
            display: flex;
            flex-direction: column;
            gap: 4px;
            
            .mobile-action-btn {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 16px;
              text-align: left;
              justify-content: flex-start;
              color: var(--ai-text-secondary);
              border-radius: 8px;
              transition: all 0.3s ease;
              
              &:hover {
                color: var(--ai-primary);
                background: rgba(99, 102, 241, 0.1);
              }
              
              &.logout-btn:hover {
                color: #ef4444;
                background: rgba(239, 68, 68, 0.1);
              }
            }
          }
        }
        
        .mobile-login {
          .mobile-login-btn {
            width: 100%;
            height: 44px;
            border-radius: 8px;
          }
        }
      }
    }
  }
  
     .header-right {
     display: flex;
     align-items: center;
     gap: 16px;
     flex-shrink: 0;
    
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

// 抽屉动画过渡效果
.mobile-overlay-enter-active,
.mobile-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-overlay-enter-from,
.mobile-overlay-leave-to {
  opacity: 0;
}

.mobile-drawer-enter-active,
.mobile-drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-drawer-enter-from,
.mobile-drawer-leave-to {
  transform: translateX(100%);
}

// 响应式设计
@media (max-width: 768px) {
  .ai-header {
    // 隐藏桌面版导航菜单
    .desktop-nav {
      display: none;
    }
    
    .header-content {
      gap: 16px;
    }
    
    .header-right {
      // 隐藏桌面端元素
      .desktop-theme-toggle,
      .desktop-login-buttons,
      .desktop-only {
        display: none;
      }
      
            // 显示移动端操作区域
      .mobile-actions {
        display: flex;
      }
      
      // 在移动端隐藏语言切换器，节省空间
      :deep(.language-switcher) {
        display: none;
      }
      
      // 简化用户菜单显示
      .user-menu .user-avatar {
        padding: 4px 6px;
        
        .username {
          display: none;
        }
        
        .el-avatar {
          width: 28px !important;
          height: 28px !important;
        }
      }
    }
    
    .header-left {
      flex-shrink: 1;
      min-width: 0;
      
      // 在移动端隐藏GitHub徽章
      .desktop-only {
        display: none;
      }
      
      .logo-section {
        gap: 8px;
      }
      
      .logo-icon {
        width: 40px;
        height: 40px;
      }
      
      .logo-text {
        min-width: 0;
        flex: 1;
        
        .title {
          font-size: 16px;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .subtitle {
          display: none;
        }
      }
    }
    
    // 调整容器padding
    .container {
      padding: 0 16px;
    }
  }
}

@media (max-width: 480px) {
  .ai-header {
    .header-left {
      .logo-section {
        gap: 6px;
      }
      
      .logo-icon {
        width: 32px;
        height: 32px;
      }
      
      .logo-text {
        .title {
          font-size: 14px;
        }
      }
    }
    
    .header-right {
      gap: 4px;
      
      // 调整移动端按钮大小
      .mobile-actions {
        gap: 4px;
        
        .mobile-menu-toggle,
        .mobile-login-toggle,
        .mobile-theme-toggle {
          min-width: 60px;
          padding: 4px 8px;
          height: 28px;
          
          span {
            font-size: 11px;
          }
          
          .el-icon {
            font-size: 12px;
          }
        }
      }
      
      // 进一步简化用户头像
      .user-menu .user-avatar {
        padding: 2px 4px;
        
        .el-avatar {
          width: 24px !important;
          height: 24px !important;
        }
      }
    }
    
    .container {
      padding: 0 8px;
    }
    
    .header-content {
      gap: 8px;
    }
    
    .mobile-menu {
      width: 90vw;
      max-width: 320px;
    }
  }
}

// 暗色主题
html.dark .ai-header {
  background: rgba(15, 23, 42, 0.95);
  border-bottom-color: var(--ai-border);
  
  .github-badge .github-link {
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
}
</style>