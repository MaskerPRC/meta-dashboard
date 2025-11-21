<template>
  <el-dialog
    v-model="dialogVisible"
    title="欢迎加入AI项目交流群！"
    width="500px"
    :before-close="handleClose"
    center
    class="wechat-group-dialog"
  >
    <div class="welcome-content">
      <div class="welcome-header">
        <div class="w-20 h-20 bg-neo-green border-4 border-black rounded-lg flex items-center justify-center mx-auto mb-4 shadow-neo">
          <i class="fa-solid fa-check text-4xl text-black"></i>
        </div>
        <h3 class="text-2xl font-black mb-2">登录成功！</h3>
        <p class="text-gray-600 font-medium">
          恭喜您成为AI项目挑战的一员，快来加入我们的交流群吧！
        </p>
      </div>

      <div class="neo-card p-6 bg-white mb-6">
        <h4 class="text-lg font-black mb-4 flex items-center gap-2">
          <i class="fa-solid fa-comments text-neo-green"></i>
          交流群福利
        </h4>
        <ul class="space-y-3">
          <li class="flex items-start gap-3">
            <i class="fa-solid fa-star text-neo-yellow mt-1"></i>
            <span class="text-sm text-gray-700">第一时间获取项目更新和技术分享</span>
          </li>
          <li class="flex items-start gap-3">
            <i class="fa-solid fa-users text-neo-blue mt-1"></i>
            <span class="text-sm text-gray-700">与志同道合的开发者交流经验</span>
          </li>
          <li class="flex items-start gap-3">
            <i class="fa-solid fa-trophy text-neo-purple mt-1"></i>
            <span class="text-sm text-gray-700">参与技术讨论和项目合作机会</span>
          </li>
          <li class="flex items-start gap-3">
            <i class="fa-solid fa-network-wired text-neo-green mt-1"></i>
            <span class="text-sm text-gray-700">获得AI工具使用技巧和最佳实践</span>
          </li>
        </ul>
      </div>

      <WechatGroup 
        :is-compact="true" 
        :hide-title="true" 
        :hide-description="true"
        :show-contact-info="true"
      />
    </div>

    <template #footer>
      <div class="dialog-footer flex gap-4 justify-center">
        <button 
          @click="handleLater"
          class="neo-btn bg-white px-6 py-3 hover:bg-gray-100"
        >
          稍后再说
        </button>
        <button 
          @click="handleJoined"
          class="neo-btn bg-neo-green text-black px-6 py-3 hover:bg-green-400"
        >
          <i class="fa-solid fa-comments mr-2"></i>
          我已加入群聊
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { showNotification } from '../../utils/notification'
import WechatGroup from './WechatGroup.vue'

// 定义 props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// 定义 emits
const emit = defineEmits(['update:modelValue', 'joined', 'later'])

// 响应式数据
const dialogVisible = ref(props.modelValue)

// 监听 props 变化
watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
}, { immediate: true })

// 监听 dialogVisible 变化
watch(dialogVisible, (newValue) => {
  emit('update:modelValue', newValue)
})

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false
  emit('later')
}

// 处理稍后再说
const handleLater = () => {
  dialogVisible.value = false
  emit('later')
  showNotification.info('您可以随时在任意页面底部找到微信群二维码')
}

// 处理已加入群聊
const handleJoined = () => {
  dialogVisible.value = false
  emit('joined')
  showNotification.success('欢迎加入AI项目交流群！期待您的参与和分享')
}
</script>

<style lang="scss" scoped>
.wechat-group-dialog {
  :deep(.el-dialog) {
    border: 4px solid black;
    border-radius: 0;
    box-shadow: 8px 8px 0 0 black;
  }

  :deep(.el-dialog__header) {
    text-align: center;
    padding: 24px 24px 0;
    border-bottom: 3px solid black;

    .el-dialog__title {
      font-weight: 900;
      font-size: 1.5rem;
      color: black;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 20px 24px;
    border-top: 3px solid black;
  }

  .welcome-content {
    .welcome-header {
      text-align: center;
      margin-bottom: 24px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .wechat-group-dialog {
    :deep(.el-dialog) {
      width: 90% !important;
      margin: 5vh auto !important;
    }
  }
}
</style>
