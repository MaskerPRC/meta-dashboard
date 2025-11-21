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
        <el-icon class="welcome-icon" size="64" color="#67c23a">
          <SuccessFilled />
        </el-icon>
        <h3 class="welcome-title">登录成功！</h3>
        <p class="welcome-subtitle">
          恭喜您成为AI项目挑战的一员，快来加入我们的交流群吧！
        </p>
      </div>

      <div class="group-benefits">
        <h4 class="benefits-title">
          <el-icon><ChatDotSquare /></el-icon>
          交流群福利
        </h4>
        <ul class="benefits-list">
          <li>
            <el-icon class="benefit-icon"><Star /></el-icon>
            第一时间获取项目更新和技术分享
          </li>
          <li>
            <el-icon class="benefit-icon"><User /></el-icon>
            与志同道合的开发者交流经验
          </li>
          <li>
            <el-icon class="benefit-icon"><Trophy /></el-icon>
            参与技术讨论和项目合作机会
          </li>
          <li>
            <el-icon class="benefit-icon"><Connection /></el-icon>
            获得AI工具使用技巧和最佳实践
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
      <div class="dialog-footer">
        <el-button @click="handleLater">稍后再说</el-button>
        <el-button type="primary" @click="handleJoined">
          <el-icon><ChatDotSquare /></el-icon>
          我已加入群聊
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { showNotification } from '../../utils/notification'
import WechatGroup from './WechatGroup.vue'
import {
  SuccessFilled, ChatDotSquare, Star, User, Trophy, Connection
} from '@element-plus/icons-vue'

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
  :deep(.el-dialog__header) {
    text-align: center;
    padding: 24px 24px 0;
    border-bottom: none;

    .el-dialog__title {
      font-weight: 600;
      color: var(--ai-text-primary);
    }
  }

  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 0 24px 24px;
    text-align: center;
  }

  .welcome-content {
    .welcome-header {
      text-align: center;
      margin-bottom: 24px;

      .welcome-icon {
        margin-bottom: 12px;
      }

      .welcome-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 8px;
        color: var(--ai-text-primary);
      }

      .welcome-subtitle {
        font-size: 1rem;
        color: var(--ai-text-secondary);
        margin: 0;
        line-height: 1.5;
      }
    }

    .group-benefits {
      margin-bottom: 24px;
      padding: 20px;
      background: var(--ai-bg-secondary);
      border-radius: 8px;
      border: 1px solid var(--ai-border);

      .benefits-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0 0 16px;
        color: var(--ai-text-primary);

        .el-icon {
          color: #07c160;
        }
      }

      .benefits-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: var(--ai-text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;

          &:last-child {
            margin-bottom: 0;
          }

          .benefit-icon {
            color: var(--ai-primary);
            font-size: 16px;
            flex-shrink: 0;
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: center;

    .el-button {
      min-width: 120px;
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

    :deep(.el-dialog__header),
    :deep(.el-dialog__body),
    :deep(.el-dialog__footer) {
      padding-left: 16px;
      padding-right: 16px;
    }

    .welcome-content {
      .welcome-header {
        .welcome-title {
          font-size: 1.25rem;
        }

        .welcome-subtitle {
          font-size: 0.875rem;
        }
      }

      .group-benefits {
        padding: 16px;

        .benefits-title {
          font-size: 1rem;
        }

        .benefits-list li {
          font-size: 0.8rem;
        }
      }
    }

    .dialog-footer {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>