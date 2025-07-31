<template>
  <div class="wechat-group" :class="{ compact: isCompact }">
    <div class="wechat-group-card ai-card">
      <h3 v-if="!hideTitle" class="wechat-group-title">
        {{ wechatGroupConfig.title || '加入微信交流群' }}
      </h3>
      <p v-if="!hideDescription" class="wechat-group-description">
        {{ wechatGroupConfig.description || '与其他开发者交流AI项目经验，分享创意与灵感' }}
      </p>

      <div v-if="wechatGroupConfig.qr" class="qr-container">
        <div class="qr-image-wrapper">
          <img
            :src="wechatGroupConfig.qr"
            alt="微信群二维码"
            class="qr-image"
            @error="handleImageError"
          />
          <div class="qr-overlay">
            <el-icon class="qr-icon"><ChatDotSquare /></el-icon>
            <span class="qr-hint">扫码加群</span>
          </div>
        </div>
      </div>

      <div v-else class="placeholder-container">
        <div class="placeholder-qr">
          <el-icon class="placeholder-icon"><ChatDotSquare /></el-icon>
          <p class="placeholder-text">二维码加载中...</p>
        </div>
      </div>

      <div class="wechat-group-tips">
        <p class="tip-text">
          <el-icon><ChatDotSquare /></el-icon>
          扫描上方二维码，或长按保存到相册后用微信扫一扫
        </p>
        <div v-if="showContactInfo" class="contact-fallback">
          <p class="fallback-text">
            也可添加微信号：<span class="wechat-id" @click="copyWechat">QQTommer</span>
            <el-tag size="small" class="action-hint">点击复制</el-tag>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { showNotification } from '../../utils/notification'
import { ChatDotSquare } from '@element-plus/icons-vue'
import axios from '../../utils/axios'

// 定义 props
const props = defineProps({
  // 紧凑模式 - 减少内边距和间距
  isCompact: {
    type: Boolean,
    default: false
  },
  // 隐藏标题
  hideTitle: {
    type: Boolean,
    default: false
  },
  // 隐藏描述
  hideDescription: {
    type: Boolean,
    default: false
  },
  // 显示联系方式备选
  showContactInfo: {
    type: Boolean,
    default: false
  }
})

// 微信群配置
const wechatGroupConfig = ref({
  qr: '',
  title: '加入微信交流群',
  description: '与其他开发者交流AI项目经验，分享创意与灵感'
})

// 复制微信号
const copyWechat = async () => {
  try {
    await navigator.clipboard.writeText('QQTommer')
    showNotification.success('微信号已复制到剪贴板！可以打开微信搜索添加好友')
  } catch (err) {
    // 降级处理：创建临时文本域来复制
    const textArea = document.createElement('textarea')
    textArea.value = 'QQTommer'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showNotification.success('微信号已复制到剪贴板！可以打开微信搜索添加好友')
  }
}

// 处理图片加载错误
const handleImageError = () => {
  console.warn('微信群二维码加载失败')
}

// 加载微信群配置
const loadWechatGroupConfig = async () => {
  try {
    const response = await axios.get('/api/config')
    const configs = response.data.configs

    if (configs.wechat_group_qr?.value) {
      wechatGroupConfig.value.qr = configs.wechat_group_qr.value
    }
    if (configs.wechat_group_title?.value) {
      wechatGroupConfig.value.title = configs.wechat_group_title.value
    }
    if (configs.wechat_group_description?.value) {
      wechatGroupConfig.value.description = configs.wechat_group_description.value
    }
  } catch (error) {
    console.error('获取微信群配置失败:', error)
    // 静默失败，不显示错误信息给用户
  }
}

onMounted(() => {
  loadWechatGroupConfig()
})
</script>

<style lang="scss" scoped>
.wechat-group {
  .wechat-group-card {
    padding: 40px;
    text-align: center;
    max-width: 500px;
    margin: 0 auto;

    .wechat-group-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 16px;
      color: var(--ai-text-primary);
    }

    .wechat-group-description {
      font-size: 1rem;
      color: var(--ai-text-secondary);
      margin: 0 0 32px;
      line-height: 1.6;
    }

    .qr-container {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;

      .qr-image-wrapper {
        position: relative;
        width: 200px;
        height: 200px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);

          .qr-overlay {
            opacity: 1;
          }
        }

        .qr-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .qr-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease;

          .qr-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }

          .qr-hint {
            font-size: 14px;
            font-weight: 500;
          }
        }
      }
    }

    .placeholder-container {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;

      .placeholder-qr {
        width: 200px;
        height: 200px;
        border: 2px dashed var(--ai-border);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--ai-text-secondary);
        background: var(--ai-bg-secondary);

        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.6;
        }

        .placeholder-text {
          font-size: 14px;
          margin: 0;
          opacity: 0.8;
        }
      }
    }

    .wechat-group-tips {
      .tip-text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--ai-text-secondary);
        font-size: 0.875rem;
        margin: 0 0 12px;

        .el-icon {
          color: #07c160;
        }
      }

      .contact-fallback {
        .fallback-text {
          font-size: 0.875rem;
          color: var(--ai-text-secondary);
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;

          .wechat-id {
            color: var(--ai-primary);
            font-weight: 500;
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 4px;
            transition: all 0.3s ease;

            &:hover {
              background: var(--ai-bg-secondary);
              transform: scale(1.05);
            }
          }

          .action-hint {
            opacity: 0.7;
          }
        }
      }
    }
  }

  // 紧凑模式样式
  &.compact {
    .wechat-group-card {
      padding: 24px;

      .wechat-group-title {
        font-size: 1.25rem;
        margin-bottom: 12px;
      }

      .wechat-group-description {
        font-size: 0.875rem;
        margin-bottom: 20px;
      }

      .qr-container, .placeholder-container {
        margin-bottom: 16px;

        .qr-image-wrapper, .placeholder-qr {
          width: 150px;
          height: 150px;
        }
      }

      .wechat-group-tips {
        .tip-text {
          font-size: 0.8rem;
          margin-bottom: 8px;
        }

        .contact-fallback .fallback-text {
          font-size: 0.8rem;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .wechat-group {
    .wechat-group-card {
      padding: 24px 16px;

      .wechat-group-title {
        font-size: 1.5rem;
      }

      .qr-container, .placeholder-container {
        .qr-image-wrapper, .placeholder-qr {
          width: 180px;
          height: 180px;
        }
      }

      .wechat-group-tips {
        .contact-fallback .fallback-text {
          flex-direction: column;
          gap: 4px;
        }
      }
    }

    &.compact {
      .wechat-group-card {
        padding: 20px 12px;

        .qr-container, .placeholder-container {
          .qr-image-wrapper, .placeholder-qr {
            width: 130px;
            height: 130px;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .wechat-group {
    .wechat-group-card {
      .qr-container, .placeholder-container {
        .qr-image-wrapper, .placeholder-qr {
          width: 160px;
          height: 160px;
        }
      }
    }

    &.compact {
      .wechat-group-card {
        .qr-container, .placeholder-container {
          .qr-image-wrapper, .placeholder-qr {
            width: 120px;
            height: 120px;
          }
        }
      }
    }
  }
}
</style>