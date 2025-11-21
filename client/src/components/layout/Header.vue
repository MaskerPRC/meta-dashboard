<template>
  <nav class="neo-navbar fixed w-full z-50 border-b-4 border-black bg-neo-yellow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <router-link to="/" class="flex items-center gap-2 no-underline">
            <div class="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl border-2 border-white shadow-sm">
              AI
            </div>
            <span class="font-display font-bold text-2xl tracking-tighter text-black">Project_100</span>
          </router-link>
        </div>
        
        <!-- Desktop Menu -->
        <div class="hidden md:flex space-x-1 font-bold text-sm">
          <router-link 
            to="/" 
            class="px-4 py-2 hover:bg-white border-2 border-transparent hover:border-black rounded-md transition"
            :class="{ 'bg-white/50 border-black/10': $route.path === '/' }"
          >
            首页
          </router-link>
          <router-link 
            to="/projects" 
            class="px-4 py-2 hover:bg-white border-2 border-transparent hover:border-black rounded-md transition"
            :class="{ 'bg-white/50 border-black/10': $route.path === '/projects' }"
          >
            项目列表
          </router-link>
          <router-link 
            to="/ideas" 
            class="px-4 py-2 hover:bg-white border-2 border-transparent hover:border-black rounded-md transition"
            :class="{ 'bg-white/50 border-black/10': $route.path === '/ideas' }"
          >
            想法征集
          </router-link>
          <router-link 
            v-if="isPublicResumeAvailable"
            to="/resume" 
            class="px-4 py-2 hover:bg-white border-2 border-transparent hover:border-black rounded-md transition"
            :class="{ 'bg-white/50 border-black/10': $route.path === '/resume' }"
          >
            简历
          </router-link>
          <router-link 
            to="/about" 
            class="px-4 py-2 hover:bg-white border-2 border-transparent hover:border-black rounded-md transition"
            :class="{ 'bg-white/50 border-black/10': $route.path === '/about' }"
          >
            关于
          </router-link>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          <a 
            href="https://github.com/MaskerPRC/meta-dashboard" 
            target="_blank"
            class="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 transition shadow-neo-sm"
            title="GitHub"
          >
            <i class="fa-brands fa-github text-xl"></i>
          </a>
          
          <!-- 用户菜单 -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <el-dropdown trigger="click" @command="handleUserCommand">
              <div class="flex items-center gap-2 cursor-pointer px-3 py-1 hover:bg-white/50 rounded-md transition">
                <el-avatar 
                  :src="authStore.user?.avatar_url" 
                  :size="32"
                  class="border-2 border-black"
                >
                  <i class="fa-solid fa-user"></i>
                </el-avatar>
                <span class="font-bold text-sm hidden md:inline">{{ authStore.user?.display_name || authStore.user?.username }}</span>
                <i class="fa-solid fa-chevron-down text-xs hidden md:inline"></i>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <i class="fa-solid fa-user mr-2"></i>
                    {{ $t('auth.profile') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="my-resume">
                    <i class="fa-solid fa-file-alt mr-2"></i>
                    编辑简历
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="authStore.isAdmin" 
                    command="admin"
                  >
                    <i class="fa-solid fa-cog mr-2"></i>
                    {{ $t('nav.admin') }}
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <i class="fa-solid fa-sign-out-alt mr-2"></i>
                    {{ $t('nav.logout') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <!-- 登录按钮 -->
          <router-link v-else to="/login">
            <button class="neo-btn bg-white px-5 py-2 text-black hover:bg-neo-purple hover:text-white">
              登 录
            </button>
          </router-link>
          
          <!-- 移动端菜单按钮 -->
          <button 
            class="md:hidden w-10 h-10 bg-white border-2 border-black rounded-md flex items-center justify-center hover:bg-gray-100 transition"
            @click="toggleMobileMenu"
          >
            <i class="fa-solid fa-bars text-xl"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 移动端菜单抽屉 -->
    <Transition name="mobile-drawer">
      <div 
        v-if="showMobileMenu" 
        class="fixed inset-0 z-50 md:hidden"
        @click="toggleMobileMenu"
      >
        <div class="absolute inset-0 bg-black/50" @click="toggleMobileMenu"></div>
        <nav 
          class="absolute right-0 top-0 h-full w-80 bg-white border-l-4 border-black shadow-neo overflow-y-auto"
          @click.stop
        >
          <div class="p-4 border-b-4 border-black bg-neo-yellow">
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-xl">菜单</h3>
              <button 
                class="w-10 h-10 bg-white border-2 border-black rounded-md flex items-center justify-center hover:bg-gray-100 transition"
                @click="toggleMobileMenu"
              >
                <i class="fa-solid fa-times text-xl"></i>
              </button>
            </div>
          </div>
          
          <div class="p-4 space-y-2">
            <router-link 
              to="/" 
              class="block px-4 py-3 hover:bg-gray-100 border-2 border-transparent hover:border-black rounded-md transition font-bold"
              :class="{ 'bg-white/50 border-black/10': $route.path === '/' }"
              @click="toggleMobileMenu"
            >
              首页
            </router-link>
            <router-link 
              to="/projects" 
              class="block px-4 py-3 hover:bg-gray-100 border-2 border-transparent hover:border-black rounded-md transition font-bold"
              :class="{ 'bg-white/50 border-black/10': $route.path === '/projects' }"
              @click="toggleMobileMenu"
            >
              项目列表
            </router-link>
            <router-link 
              to="/ideas" 
              class="block px-4 py-3 hover:bg-gray-100 border-2 border-transparent hover:border-black rounded-md transition font-bold"
              :class="{ 'bg-white/50 border-black/10': $route.path === '/ideas' }"
              @click="toggleMobileMenu"
            >
              想法征集
            </router-link>
            <router-link 
              v-if="isPublicResumeAvailable"
              to="/resume" 
              class="block px-4 py-3 hover:bg-gray-100 border-2 border-transparent hover:border-black rounded-md transition font-bold"
              :class="{ 'bg-white/50 border-black/10': $route.path === '/resume' }"
              @click="toggleMobileMenu"
            >
              简历
            </router-link>
            <router-link 
              to="/about" 
              class="block px-4 py-3 hover:bg-gray-100 border-2 border-transparent hover:border-black rounded-md transition font-bold"
              :class="{ 'bg-white/50 border-black/10': $route.path === '/about' }"
              @click="toggleMobileMenu"
            >
              关于
            </router-link>
            
            <!-- 移动端用户区域 -->
            <div v-if="authStore.isAuthenticated" class="mt-4 pt-4 border-t-2 border-black">
              <div class="px-4 py-2 mb-2">
                <div class="flex items-center gap-2">
                  <el-avatar 
                    :src="authStore.user?.avatar_url" 
                    :size="32"
                    class="border-2 border-black"
                  >
                    <i class="fa-solid fa-user"></i>
                  </el-avatar>
                  <span class="font-bold">{{ authStore.user?.display_name || authStore.user?.username }}</span>
                </div>
              </div>
              <button 
                class="w-full px-4 py-3 hover:bg-gray-100 border-2 border-transparent hover:border-black rounded-md transition font-bold text-left"
                @click="handleMobileUserAction('profile')"
              >
                <i class="fa-solid fa-user mr-2"></i>
                {{ $t('auth.profile') }}
              </button>
              <button 
                v-if="authStore.isAdmin"
                class="w-full px-4 py-3 hover:bg-gray-100 border-2 border-transparent hover:border-black rounded-md transition font-bold text-left"
                @click="handleMobileUserAction('admin')"
              >
                <i class="fa-solid fa-cog mr-2"></i>
                {{ $t('nav.admin') }}
              </button>
              <button 
                class="w-full px-4 py-3 hover:bg-red-100 border-2 border-transparent hover:border-black rounded-md transition font-bold text-left text-red-600"
                @click="handleMobileUserAction('logout')"
              >
                <i class="fa-solid fa-sign-out-alt mr-2"></i>
                {{ $t('nav.logout') }}
              </button>
            </div>
            <div v-else class="mt-4 pt-4 border-t-2 border-black">
              <router-link to="/login" class="block">
                <button class="neo-btn bg-black text-white w-full px-4 py-3 hover:bg-gray-800">
                  登 录
                </button>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
    </Transition>
    
    <!-- 个人资料弹窗 -->
    <ProfileDialog v-model="showProfileDialog" />
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import ProfileDialog from '../common/ProfileDialog.vue'
import axios from '../../utils/axios'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const showMobileMenu = ref(false)
const showProfileDialog = ref(false)
const isPublicResumeAvailable = ref(false)

// 移动菜单切换
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
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

// 移动端用户操作处理
const handleMobileUserAction = (action) => {
  toggleMobileMenu()
  handleUserCommand(action)
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

onMounted(async () => {
  await checkPublicResumeStatus()
})
</script>

<style lang="scss" scoped>
.neo-navbar {
  font-family: 'Noto Sans SC', sans-serif;
}

// 移动端抽屉动画
.mobile-drawer-enter-active,
.mobile-drawer-leave-active {
  transition: opacity 0.3s ease;
  
  nav {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.mobile-drawer-enter-from,
.mobile-drawer-leave-to {
  opacity: 0;
  
  nav {
    transform: translateX(100%);
  }
}

// 确保路由链接样式正确
a {
  color: inherit;
  text-decoration: none;
  
  &.router-link-active {
    background-color: rgba(255, 255, 255, 0.5);
    border-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
