<template>
  <main class="flex-grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
    <!-- Header Section -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-center">
      <!-- Text Content -->
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-block bg-black text-white px-3 py-1 font-bold text-sm border-2 border-black transform -rotate-2">
          🚀 #BuildInPublic
        </div>
        
        <h1 class="font-display font-black text-6xl md:text-7xl leading-[1.1]">
          一年挑战 <br>
          <span class="highlight-marker">100个 AI产品</span>
        </h1>
        
        <p class="text-lg font-medium text-gray-800 max-w-lg border-l-4 border-neo-purple pl-4 bg-white/60 py-2">
          {{ $t('home.description') }}
        </p>

        <div class="flex flex-wrap gap-4 pt-4">
          <router-link to="/projects" class="neo-btn bg-black text-white px-8 py-4 text-lg flex gap-2 items-center hover:bg-gray-800">
            我做了啥？ <i class="fa-solid fa-arrow-right -rotate-45"></i>
          </router-link>
          <router-link to="/about" class="neo-btn bg-neo-green px-8 py-4 text-lg font-bold flex gap-2 items-center hover:bg-green-400">
            <i class="fa-solid fa-bolt"></i> 围观挑战
          </router-link>
        </div>

        <!-- Social Tags -->
        <div v-if="hasSocialLinks" class="flex gap-3 pt-4">
          <a
            v-if="socialLinks.social_xiaohongshu_url"
            :href="socialLinks.social_xiaohongshu_url"
            target="_blank"
            class="px-3 py-1 border-2 border-black rounded-full bg-neo-red text-white font-bold text-xs shadow-neo-sm cursor-pointer hover:translate-y-0.5 hover:shadow-none transition"
          >
            小红书
          </a>
          <a
            v-if="socialLinks.social_bilibili_url"
            :href="socialLinks.social_bilibili_url"
            target="_blank"
            class="px-3 py-1 border-2 border-black rounded-full bg-neo-blue text-white font-bold text-xs shadow-neo-sm cursor-pointer hover:translate-y-0.5 hover:shadow-none transition"
          >
            Bilibili
          </a>
          <a
            v-if="socialLinks.social_wechat_official_url"
            :href="socialLinks.social_wechat_official_url"
            target="_blank"
            class="px-3 py-1 border-2 border-black rounded-full bg-[#07C160] text-white font-bold text-xs shadow-neo-sm cursor-pointer hover:translate-y-0.5 hover:shadow-none transition"
          >
            公众号
          </a>
        </div>
      </div>

      <!-- Stats Matrix -->
      <div class="lg:col-span-5 relative">
        <!-- Decorative BG Blob -->
        <div class="absolute -top-10 -right-10 w-full h-full bg-neo-purple rounded-full opacity-20 blur-3xl -z-10"></div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Total Progress -->
          <div class="neo-card col-span-2 p-6 rounded-xl flex items-center justify-between bg-neo-yellow">
            <div>
              <div class="text-sm font-bold uppercase border-b-2 border-black inline-block mb-2">当前总进度</div>
              <div class="text-6xl font-black font-display">{{ projectsStore.totalProgress || 0 }}%</div>
            </div>
            <i class="fa-solid fa-chart-line text-5xl opacity-20"></i>
          </div>

          <!-- Stat 1 -->
          <div class="neo-card p-5 rounded-xl bg-white text-center group">
            <div class="w-full bg-neo-green border-2 border-black py-1 font-bold text-xs mb-3 group-hover:bg-black group-hover:text-neo-green transition">SUCCESS</div>
            <div class="text-4xl font-black mb-1">{{ projectsStore.statusCounts.completed || 0 }}</div>
            <div class="text-xs font-bold text-gray-500">已完成</div>
          </div>

          <!-- Stat 2 -->
          <div class="neo-card p-5 rounded-xl bg-white text-center group">
            <div class="w-full bg-neo-blue border-2 border-black py-1 font-bold text-xs mb-3 text-white group-hover:bg-black group-hover:text-neo-blue transition">BUILDING</div>
            <div class="text-4xl font-black mb-1">{{ projectsStore.statusCounts.development || 0 }}</div>
            <div class="text-xs font-bold text-gray-500">开发中</div>
          </div>

          <!-- Countdown -->
          <div class="neo-card col-span-2 p-4 rounded-xl bg-black text-white flex justify-between items-center border-gray-500">
            <div class="flex items-center gap-4">
              <div class="bg-neo-red text-black w-12 h-12 flex items-center justify-center border-2 border-white font-bold rounded shadow-[2px_2px_0_0_white]">
                <i class="fa-regular fa-clock text-xl"></i>
              </div>
              <div>
                <div class="text-gray-400 text-xs">距离{{ currentYear }}年结束</div>
                <div class="text-2xl font-black text-neo-yellow font-display">{{ daysRemaining }} <span class="text-base text-white">天</span></div>
              </div>
            </div>
            <div class="text-right pr-2">
              <div class="text-3xl font-bold">{{ projectsStore.statusCounts.idea || 0 }}</div>
              <div class="text-xs text-gray-400">待开发</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Marquee (Horizontal Scroll) -->
    <div class="mb-12">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-2xl font-black bg-white border-2 border-black px-4 py-1 shadow-neo-sm inline-block transform -rotate-1">
          看板状态
        </h3>
      </div>
      
      <div class="flex gap-4 overflow-x-auto custom-scrollbar py-4 pl-1">
        <!-- Status Cards -->
        <div class="neo-card min-w-[160px] p-4 rounded-lg flex flex-col items-center justify-center text-center bg-white">
          <div class="w-10 h-10 rounded-full bg-gray-100 border-2 border-black flex items-center justify-center mb-2">
            <i class="fa-solid fa-lightbulb text-yellow-500"></i>
          </div>
          <div class="text-3xl font-black">{{ projectsStore.statusCounts.idea || 0 }}</div>
          <div class="text-sm font-bold bg-gray-200 px-2 rounded border border-black">构思中</div>
        </div>

        <div class="neo-card min-w-[160px] p-4 rounded-lg flex flex-col items-center justify-center text-center bg-white">
          <div class="w-10 h-10 rounded-full bg-blue-100 border-2 border-black flex items-center justify-center mb-2">
            <i class="fa-solid fa-pen-ruler text-blue-500"></i>
          </div>
          <div class="text-3xl font-black">{{ projectsStore.statusCounts.planning || 0 }}</div>
          <div class="text-sm font-bold bg-blue-200 px-2 rounded border border-black">规划中</div>
        </div>

        <div class="neo-card min-w-[160px] p-4 rounded-lg flex flex-col items-center justify-center text-center bg-neo-purple/20">
          <div class="w-10 h-10 rounded-full bg-purple-100 border-2 border-black flex items-center justify-center mb-2">
            <i class="fa-solid fa-code text-purple-600"></i>
          </div>
          <div class="text-3xl font-black">{{ projectsStore.statusCounts.development || 0 }}</div>
          <div class="text-sm font-bold bg-neo-purple text-white px-2 rounded border border-black">开发中</div>
        </div>

        <div class="neo-card min-w-[160px] p-4 rounded-lg flex flex-col items-center justify-center text-center bg-white">
          <div class="w-10 h-10 rounded-full bg-red-100 border-2 border-black flex items-center justify-center mb-2">
            <i class="fa-solid fa-bug text-red-500"></i>
          </div>
          <div class="text-3xl font-black">{{ projectsStore.statusCounts.testing || 0 }}</div>
          <div class="text-sm font-bold bg-red-200 px-2 rounded border border-black">测试中</div>
        </div>
        
        <div class="neo-card min-w-[160px] p-4 rounded-lg flex flex-col items-center justify-center text-center bg-neo-green/20">
          <div class="w-10 h-10 rounded-full bg-green-100 border-2 border-black flex items-center justify-center mb-2">
            <i class="fa-solid fa-check text-green-600"></i>
          </div>
          <div class="text-3xl font-black">{{ projectsStore.statusCounts.completed || 0 }}</div>
          <div class="text-sm font-bold bg-neo-green border border-black px-2 rounded">已完成</div>
        </div>
      </div>
    </div>

    <!-- Projects List -->
    <div class="mb-6 flex justify-between items-end border-b-4 border-black pb-2">
      <h2 class="text-4xl font-black uppercase tracking-tight">Latest Drops</h2>
      <router-link to="/projects" class="font-bold hover:underline bg-black text-white px-2">
        查看全部列表 &rarr;
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      <ProjectCard
        v-for="project in recentProjects"
        :key="project.id"
        :project="project"
        @click="goToProject(project.id)"
      />
      
      <div v-if="recentProjects.length === 0" class="col-span-full text-center py-12">
        <i class="fa-solid fa-inbox text-6xl text-gray-400 mb-4"></i>
        <p class="text-lg font-bold text-gray-600">{{ $t('message.no_data') }}</p>
        <router-link 
          v-if="authStore.isAdmin"
          to="/admin"
          class="neo-btn bg-black text-white px-6 py-3 mt-4 inline-block"
        >
          创建新项目
        </router-link>
      </div>
    </div>

    <!-- Footer / Manifesto -->
    <div class="bg-neo-red border-4 border-black p-8 mb-10 shadow-neo relative overflow-hidden">
      <div class="absolute -right-20 -bottom-20 text-black opacity-10">
        <i class="fa-solid fa-bullhorn text-[200px]"></i>
      </div>
      <div class="relative z-10 md:flex justify-between items-center">
        <div class="text-white mb-6 md:mb-0">
          <h2 class="text-3xl font-black mb-2">加入微信交流群</h2>
          <p class="font-bold text-lg opacity-90">扫码即刻与1000+开发者一起卷！</p>
        </div>
        <div class="bg-white p-3 border-2 border-black transform rotate-2 shadow-neo-sm">
          <WechatGroup :is-compact="true" :hide-title="true" :hide-description="true" />
        </div>
      </div>
    </div>
    
    <footer class="text-center font-bold text-gray-500 py-8">
      © {{ currentYear }} AI Project 100 Challenge. Built with ❤️ and ☕.
    </footer>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '../stores/projects'
import { useAuthStore } from '../stores/auth'
import ProjectCard from '../components/project/ProjectCard.vue'
import WechatGroup from '../components/common/WechatGroup.vue'
import axios from '../utils/axios'

const router = useRouter()
const { t } = useI18n()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

// 数据
const socialLinks = ref({})
const startupArticle = ref({ url: '', title: '' })

// 年度倒计时
const currentYear = ref(new Date().getFullYear())
const daysRemaining = ref(0)

const recentProjects = computed(() => {
  return projectsStore.projects.slice(0, 6)
})

const hasSocialLinks = computed(() => {
  return Object.values(socialLinks.value).some(url => url && url.trim())
})

// 跳转到项目详情
const goToProject = (id) => {
  router.push(`/project/${id}`)
}

// 计算年度倒计时
const calculateDaysRemaining = () => {
  const now = new Date()
  const currentYearValue = now.getFullYear()
  const endOfYear = new Date(currentYearValue, 11, 31, 23, 59, 59) // 12月31日23:59:59
  
  const timeDiff = endOfYear.getTime() - now.getTime()
  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  currentYear.value = currentYearValue
  daysRemaining.value = Math.max(0, days) // 确保不会显示负数
}

// 获取社交媒体链接配置
const loadSocialLinks = async () => {
  try {
    const response = await axios.get('/api/config')
    const configs = response.data.configs

    // 提取社交媒体链接
    const socialKeys = [
      'social_x_url',
      'social_xiaohongshu_url',
      'social_bilibili_url',
      'social_wechat_official_url',
      'social_zhihu_url',
      'social_csdn_url'
    ]

    socialKeys.forEach(key => {
      if (configs[key]?.value) {
        socialLinks.value[key] = configs[key].value
      }
    })

    // 获取创业启动文章配置
    if (configs.startup_article_url?.value) {
      startupArticle.value.url = configs.startup_article_url.value
    }
    if (configs.startup_article_title?.value) {
      startupArticle.value.title = configs.startup_article_title.value
    }
  } catch (error) {
    console.error('获取社交媒体链接失败:', error)
  }
}

let updateInterval = null

onMounted(async () => {
  // 获取统计数据
  await projectsStore.fetchStats()

  // 获取最新项目数据用于展示
  projectsStore.fetchProjects({ limit: 6 })

  // 获取社交媒体链接
  await loadSocialLinks()

  // 计算年度倒计时
  calculateDaysRemaining()

  // 每天更新一次倒计时
  updateInterval = setInterval(() => {
    calculateDaysRemaining()
  }, 1000 * 60 * 60 * 24) // 24小时更新一次
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style lang="scss" scoped>
// 确保字体正确应用
.font-display {
  font-family: 'Space Grotesk', sans-serif;
}

// 响应式调整
@media (max-width: 768px) {
  main {
    padding-top: 6rem;
  }
  
  h1 {
    font-size: 2.5rem;
  }
}
</style>
