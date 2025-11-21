<template>
  <div class="neo-card rounded-xl p-0 overflow-hidden flex flex-col h-full cursor-pointer" @click="$emit('click')">
    <!-- Header with colored background -->
    <div 
      class="h-40 border-b-2 border-black flex items-center justify-center relative overflow-hidden"
      :class="getStatusColorClass(project.status)"
    >
      <!-- Pattern inside header -->
      <div 
        class="absolute inset-0 opacity-20"
        :style="getPatternStyle(project.status)"
      ></div>
        <i :class="[getStatusIcon(project.status), 'text-6xl', getIconColorClass(project.status)]"></i>
      <div 
        class="absolute top-3 right-3 border-2 border-black px-2 py-1 font-bold text-xs rounded shadow-[2px_2px_0_0_black]"
        :class="getStatusBadgeClass(project.status)"
      >
        {{ getStatusBadgeText(project.status) }}
      </div>
    </div>
    
    <div class="p-6 flex-grow flex flex-col">
      <h3 class="text-xl font-black mb-2 leading-tight">{{ project.title }}</h3>
      <p class="text-sm font-medium text-gray-600 mb-4 flex-grow">
        {{ project.description }}
      </p>
      
      <!-- Tech Stack Tags -->
      <div v-if="project.tech_stack && project.tech_stack.length" class="flex gap-2 mb-4 flex-wrap">
        <span 
          v-for="tech in project.tech_stack.slice(0, 3)" 
          :key="tech"
          class="text-xs font-bold border border-black px-2 py-1 rounded-md bg-gray-100"
        >
          {{ tech }}
        </span>
        <span v-if="project.tech_stack.length > 3" class="text-xs font-bold text-gray-500">
          +{{ project.tech_stack.length - 3 }}
        </span>
      </div>

      <div class="mt-auto">
        <!-- Progress Bar -->
        <div class="flex justify-between text-xs font-bold mb-1">
          <span>进度</span>
          <span>{{ project.progress || 0 }}%</span>
        </div>
        <div class="h-5 w-full border-2 border-black rounded-full bg-white overflow-hidden p-[2px]">
          <div 
            class="h-full rounded-full stripe-progress" 
            :class="getProgressColorClass(project.progress)"
            :style="{ width: `${project.progress || 0}%` }"
          ></div>
        </div>
        
        <!-- Footer -->
        <div class="mt-4 flex justify-between items-center">
          <span class="text-xs font-bold text-gray-500">{{ formatDate(project.created_at) }}</span>
          <button 
            class="w-8 h-8 bg-white border-2 border-black rounded-full hover:bg-black hover:text-white transition flex items-center justify-center"
            @click.stop="$emit('click')"
          >
            <i class="fa-solid fa-arrow-right transform -rotate-45"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '@/stores/projects'
import dayjs from 'dayjs'

const { t } = useI18n()
const projectsStore = useProjectsStore()

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

// 获取状态颜色类
const getStatusColorClass = (status) => {
  const colorMap = {
    idea: 'bg-gray-200',
    planning: 'bg-blue-200',
    development: 'bg-neo-purple',
    testing: 'bg-red-200',
    deployed: 'bg-green-200',
    completed: 'bg-neo-green',
    paused: 'bg-gray-300'
  }
  return colorMap[status] || 'bg-gray-200'
}

// 获取状态图标
const getStatusIcon = (status) => {
  const iconMap = {
    idea: 'fa-solid fa-lightbulb',
    planning: 'fa-solid fa-pen-ruler',
    development: 'fa-solid fa-code',
    testing: 'fa-solid fa-bug',
    deployed: 'fa-solid fa-rocket',
    completed: 'fa-solid fa-check-circle',
    paused: 'fa-solid fa-pause-circle'
  }
  return iconMap[status] || 'fa-solid fa-star'
}

// 获取图标颜色类
const getIconColorClass = (status) => {
  if (status === 'development' || status === 'completed') {
    return 'text-white drop-shadow-[3px_3px_0_#000]'
  }
  return 'text-black opacity-80'
}

// 获取状态徽章类
const getStatusBadgeClass = (status) => {
  const badgeMap = {
    idea: 'bg-white',
    planning: 'bg-blue-200',
    development: 'bg-neo-yellow',
    testing: 'bg-red-200',
    deployed: 'bg-green-200',
    completed: 'bg-white',
    paused: 'bg-gray-200'
  }
  return badgeMap[status] || 'bg-white'
}

// 获取状态徽章文本
const getStatusBadgeText = (status) => {
  const textMap = {
    idea: 'IDEA',
    planning: 'PLAN',
    development: 'DEV',
    testing: 'TEST',
    deployed: 'DEPLOY',
    completed: 'DONE',
    paused: 'PAUSE'
  }
  return textMap[status] || 'IDEA'
}

// 获取进度条颜色类
const getProgressColorClass = (progress) => {
  if (progress >= 100) return 'bg-neo-green'
  if (progress >= 70) return 'bg-neo-blue'
  if (progress >= 30) return 'bg-neo-purple'
  return 'bg-neo-red'
}

// 获取背景图案样式
const getPatternStyle = (status) => {
  if (status === 'development') {
    return {
      backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
      backgroundSize: '20px 20px'
    }
  }
  return {
    backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
    backgroundSize: '10px 10px'
  }
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<style lang="scss" scoped>
// 确保卡片样式正确
.neo-card {
  transition: all 0.1s ease;
  
  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px #000000;
  }
}
</style>
