<template>
  <main class="flex-grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <h1 class="font-display font-black text-6xl mb-6 bg-white border-4 border-black inline-block px-8 py-3 shadow-neo transform -rotate-1">
        {{ $t('about.title') }}
      </h1>
      <p class="text-lg font-medium text-gray-600 max-w-2xl mx-auto bg-white/80 p-3 border-2 border-black border-dashed">
        {{ $t('about.subtitle') }}
      </p>
      
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
        <div class="neo-card p-4 bg-neo-yellow text-center">
          <div class="text-4xl font-black mb-1">{{ projectsStore.projects.length || 0 }}</div>
          <div class="text-xs font-bold">已启动项目</div>
        </div>
        <div class="neo-card p-4 bg-neo-green text-center">
          <div class="text-4xl font-black mb-1">{{ projectsStore.totalProgress || 0 }}%</div>
          <div class="text-xs font-bold">平均进度</div>
        </div>
        <div class="neo-card p-4 bg-neo-blue text-center">
          <div class="text-4xl font-black mb-1">{{ projectsStore.statusCounts.completed || 0 }}</div>
          <div class="text-xs font-bold">已完成</div>
        </div>
      </div>
    </div>

    <!-- Challenge Info -->
    <section class="mb-16">
      <h2 class="text-3xl font-black mb-4 bg-white border-2 border-black inline-block px-4 py-1 shadow-neo-sm transform rotate-1">
        {{ $t('about.challenge_info.title') }}
      </h2>
      <p class="text-gray-600 mb-8">{{ $t('about.challenge_info.why_title') }}</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="neo-card p-6 bg-white text-center">
          <div class="w-16 h-16 bg-neo-purple border-4 border-black rounded-lg flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-microchip text-3xl text-black"></i>
          </div>
          <h3 class="text-xl font-black mb-2">{{ $t('about.challenge_info.tech_dividend.title') }}</h3>
          <p class="text-sm text-gray-600">{{ $t('about.challenge_info.tech_dividend.content') }}</p>
        </div>

        <div class="neo-card p-6 bg-white text-center">
          <div class="w-16 h-16 bg-neo-blue border-4 border-black rounded-lg flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-arrow-up text-3xl text-black"></i>
          </div>
          <h3 class="text-xl font-black mb-2">{{ $t('about.challenge_info.personal_breakthrough.title') }}</h3>
          <p class="text-sm text-gray-600">{{ $t('about.challenge_info.personal_breakthrough.content') }}</p>
        </div>

        <div class="neo-card p-6 bg-white text-center">
          <div class="w-16 h-16 bg-neo-green border-4 border-black rounded-lg flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-network-wired text-3xl text-black"></i>
          </div>
          <h3 class="text-xl font-black mb-2">{{ $t('about.challenge_info.transparent_sharing.title') }}</h3>
          <p class="text-sm text-gray-600">{{ $t('about.challenge_info.transparent_sharing.content') }}</p>
        </div>
      </div>
    </section>

    <!-- Challenge Rules -->
    <section class="mb-16">
      <h2 class="text-3xl font-black mb-8 bg-white border-2 border-black inline-block px-4 py-1 shadow-neo-sm transform -rotate-1">
        {{ $t('about.challenge_rules.title') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="(rule, index) in rules"
          :key="index"
          class="neo-card p-6 bg-white relative"
        >
          <div class="absolute -top-3 -left-3 w-10 h-10 bg-black text-white border-2 border-white rounded-full flex items-center justify-center font-black text-sm shadow-neo-sm">
            {{ String(index + 1).padStart(2, '0') }}
          </div>
          <h3 class="text-xl font-black mb-2 mt-2">{{ rule.title }}</h3>
          <p class="text-sm text-gray-600">{{ rule.content }}</p>
        </div>
      </div>
    </section>

    <!-- Tech Stack -->
    <section class="mb-16">
      <h2 class="text-3xl font-black mb-8 bg-white border-2 border-black inline-block px-4 py-1 shadow-neo-sm transform rotate-1">
        {{ $t('about.tech_stack.title') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="category in techCategories"
          :key="category.name"
          class="neo-card p-6 bg-white"
        >
          <h3 class="text-xl font-black mb-4 flex items-center gap-2">
            <i :class="category.icon" class="text-2xl"></i>
            {{ category.title }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tech in category.techs"
              :key="tech"
              class="px-3 py-1 border-2 border-black rounded font-bold text-sm bg-gray-100"
            >
              {{ tech }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Participation -->
    <section class="mb-16">
      <h2 class="text-3xl font-black mb-8 bg-white border-2 border-black inline-block px-4 py-1 shadow-neo-sm transform -rotate-1">
        {{ $t('about.how_to_participate.title') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="method in participationMethods"
          :key="method.title"
          class="neo-card p-6 bg-white text-center"
        >
          <div class="w-14 h-14 bg-neo-purple border-3 border-black rounded-lg flex items-center justify-center mx-auto mb-4">
            <i :class="method.icon" class="text-2xl text-black"></i>
          </div>
          <h3 class="text-lg font-black mb-2">{{ method.title }}</h3>
          <p class="text-sm text-gray-600">{{ method.content }}</p>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="mb-16">
      <div class="neo-card p-8 bg-white">
        <h2 class="text-3xl font-black mb-4 text-center">{{ $t('about.contact.title') }}</h2>
        <p class="text-center text-gray-600 mb-8">{{ $t('about.contact.subtitle') }}</p>

        <div class="space-y-3 max-w-2xl mx-auto">
          <div 
            v-for="contact in contacts"
            :key="contact.label"
            @click="handleContactClick(contact)"
            class="neo-card p-4 bg-gray-50 cursor-pointer hover:translate-x-1 transition-transform flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <i :class="contact.icon" class="text-xl"></i>
              <span class="font-bold">{{ contact.label }}：</span>
              <span class="font-mono text-sm">{{ contact.value }}</span>
            </div>
            <span class="text-xs font-bold bg-neo-yellow px-2 py-1 border-2 border-black rounded">
              {{ contact.action }}
            </span>
          </div>
        </div>

        <div class="flex justify-center gap-4 mt-8">
          <router-link to="/projects" class="neo-btn bg-black text-white px-6 py-3 hover:bg-gray-800">
            <i class="fa-solid fa-eye mr-2"></i>
            {{ $t('home.view_projects') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Wechat Group -->
    <section class="mb-16">
      <WechatGroup :show-contact-info="true" />
    </section>

    <!-- Manifesto -->
    <section class="mb-16">
      <div class="neo-card p-8 bg-black text-white text-center">
        <blockquote class="text-2xl font-bold italic mb-4">
          {{ $t('about.conclusion.quote') }}
        </blockquote>
        <p class="text-gray-400 font-bold">{{ $t('about.conclusion.signature') }}</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { showNotification } from '../utils/notification'
import { useProjectsStore } from '../stores/projects'
import WechatGroup from '../components/common/WechatGroup.vue'

const { t } = useI18n()
const projectsStore = useProjectsStore()

// 规则数据
const rules = computed(() => [
  {
    title: t('about.challenge_rules.target_quantity.title'),
    content: t('about.challenge_rules.target_quantity.content')
  },
  {
    title: t('about.challenge_rules.criteria.title'),
    content: t('about.challenge_rules.criteria.content')
  },
  {
    title: t('about.challenge_rules.transparency.title'),
    content: t('about.challenge_rules.transparency.content')
  },
  {
    title: t('about.challenge_rules.toolstack.title'),
    content: t('about.challenge_rules.toolstack.content')
  },
  {
    title: t('about.challenge_rules.iteration.title'),
    content: t('about.challenge_rules.iteration.content')
  },
  {
    title: t('about.challenge_rules.review_rhythm.title'),
    content: t('about.challenge_rules.review_rhythm.content')
  }
])

// 技术栈分类
const techCategories = computed(() => [
  {
    name: 'ai_tools',
    title: t('about.tech_stack.ai_tools.title'),
    icon: 'fa-solid fa-microchip',
    techs: ['Cursor', 'Claude', 'ChatGPT', 'GitHub Copilot', 'v0.dev', 'Bolt.new']
  },
  {
    name: 'frontend',
    title: t('about.tech_stack.frontend.title'),
    icon: 'fa-solid fa-desktop',
    techs: ['Vue.js', 'React', 'Next.js', 'Nuxt.js', 'TypeScript', 'Tailwind CSS', 'Element Plus']
  },
  {
    name: 'backend',
    title: t('about.tech_stack.backend.title'),
    icon: 'fa-solid fa-server',
    techs: ['Node.js', 'Python', 'FastAPI', 'Express', 'NestJS', 'Supabase', 'Firebase']
  },
  {
    name: 'deployment',
    title: t('about.tech_stack.deployment.title'),
    icon: 'fa-solid fa-cloud',
    techs: ['Vercel', 'Netlify', 'Railway', 'Render', 'Cloudflare', 'AWS', 'Zeabur']
  }
])

// 参与方式
const participationMethods = computed(() => [
  {
    title: t('about.how_to_participate.feedback.title'),
    content: t('about.how_to_participate.feedback.content'),
    icon: 'fa-solid fa-comments'
  },
  {
    title: t('about.how_to_participate.exchange.title'),
    content: t('about.how_to_participate.exchange.content'),
    icon: 'fa-solid fa-share-nodes'
  },
  {
    title: t('about.how_to_participate.cooperation.title'),
    content: t('about.how_to_participate.cooperation.content'),
    icon: 'fa-solid fa-network-wired'
  },
  {
    title: t('about.how_to_participate.encouragement.title'),
    content: t('about.how_to_participate.encouragement.content'),
    icon: 'fa-solid fa-trophy'
  }
])

// 联系方式
const contacts = ref([
  {
    label: t('about.contact.email'),
    value: 'maskerprc@gmail.com',
    icon: 'fa-solid fa-envelope',
    action: t('about.contact.click_email'),
    handler: () => {
      window.location.href = 'mailto:maskerprc@gmail.com?subject=关于100个AI产品挑战&body=您好，我看到了您的100个AI产品挑战...'
      showNotification.success('正在打开邮件客户端...')
    }
  },
  {
    label: t('about.contact.github'),
    value: 'github.com/MaskerPRC',
    icon: 'fa-brands fa-github',
    action: t('about.contact.click_visit'),
    handler: () => {
      window.open('https://github.com/MaskerPRC', '_blank')
      showNotification.success('正在打开GitHub页面...')
    }
  },
  {
    label: t('about.contact.wechat'),
    value: 'QQTommer',
    icon: 'fa-brands fa-weixin',
    action: t('about.contact.click_copy'),
    handler: async () => {
      try {
        await navigator.clipboard.writeText('QQTommer')
        showNotification.success('微信号已复制到剪贴板！可以打开微信搜索添加好友')
      } catch (err) {
        const textArea = document.createElement('textarea')
        textArea.value = 'QQTommer'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        showNotification.success('微信号已复制到剪贴板！可以打开微信搜索添加好友')
      }
    }
  },
  {
    label: t('about.contact.phone'),
    value: '13022898959',
    icon: 'fa-solid fa-phone',
    action: t('about.contact.click_call'),
    handler: () => {
      window.location.href = 'tel:13022898959'
      showNotification.success('正在启动拨号功能...')
    }
  },
  {
    label: t('about.contact.issue'),
    value: 'github.com/MaskerPRC/meta-dashboard',
    icon: 'fa-solid fa-bug',
    action: t('about.contact.click_issue'),
    handler: () => {
      window.open('https://github.com/MaskerPRC/meta-dashboard/issues', '_blank')
      showNotification.success('正在打开GitHub Issues页面...')
    }
  }
])

const handleContactClick = (contact) => {
  if (contact.handler) {
    contact.handler()
  }
}

onMounted(() => {
  projectsStore.fetchProjects({ limit: 100 })
})
</script>

<style lang="scss" scoped>
// 响应式
@media (max-width: 768px) {
  main {
    padding-top: 6rem;
  }
  
  h1 {
    font-size: 3rem;
  }
}
</style>
