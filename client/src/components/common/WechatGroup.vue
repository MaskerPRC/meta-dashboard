<template>
  <div class="wechat-group" :class="{ compact: isCompact }">
    <div class="wechat-group-card ai-card">
      <h3 v-if="!hideTitle" class="wechat-group-title">
        {{ wechatGroupConfig.title || $t('home.join_wechat_group') }}
      </h3>
      <p v-if="!hideDescription" class="wechat-group-description">
        {{ wechatGroupConfig.description || $t('wechat_group.default_description') }}
      </p>

      <div v-if="wechatGroupConfig.qr" class="qr-container">
        <div class="qr-image-wrapper">
          <img
            :src="wechatGroupConfig.qr"
            :alt="$t('wechat_group.qr_code_alt')"
            class="qr-image"
            @error="handleImageError"
          />
        </div>
      </div>

      <div v-else class="placeholder-container">
        <div class="placeholder-qr">
          <i class="fa-solid fa-qrcode placeholder-icon"></i>
          <p class="placeholder-text">{{ $t('wechat_group.qr_loading') }}</p>
        </div>
      </div>
      
      <div v-if="showContactInfo && !hideDescription" class="text-center mt-2">
        <p class="text-xs font-bold">
          {{ $t('wechat_group.wechat_id_label') }}<span class="wechat-id cursor-pointer hover:underline" @click="copyWechat">{{ $t('wechat_group.wechat_id') }}</span>
        </p>
      </div>

      <div v-if="!isCompact" class="wechat-group-tips">
        <p class="tip-text">
          <i class="fa-solid fa-info-circle mr-2"></i>
          {{ $t('wechat_group.scan_tip') }}
        </p>
        <div v-if="showContactInfo" class="contact-fallback">
          <p class="fallback-text">
            {{ $t('wechat_group.wechat_id_label') }}<span class="wechat-id cursor-pointer hover:underline" @click="copyWechat">{{ $t('wechat_group.wechat_id') }}</span>
            <span class="text-xs bg-gray-200 px-2 py-1 rounded border border-black ml-2">{{ $t('wechat_group.click_to_copy') }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { showNotification } from '../../utils/notification'
import { ChatDotSquare } from '@element-plus/icons-vue'
import axios from '../../utils/axios'

const { t } = useI18n()

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
  title: t('home.join_wechat_group'),
  description: t('wechat_group.default_description')
})

// 复制微信号
const copyWechat = async () => {
  try {
    await navigator.clipboard.writeText('QQTommer')
    showNotification.success(t('wechat_group.copy_wechat_success'))
  } catch (err) {
    // 降级处理：创建临时文本域来复制
    const textArea = document.createElement('textarea')
    textArea.value = 'QQTommer'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showNotification.success(t('wechat_group.copy_wechat_success'))
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
        border: 2px solid black;
        border-radius: 0;
        overflow: hidden;
        box-shadow: 2px 2px 0px 0px #000000;
        transition: all 0.1s ease;
        background: white;

        &:hover {
          transform: translate(2px, 2px);
          box-shadow: 0px 0px 0px 0px #000000;
        }

        .qr-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
        border: 2px solid black;
        border-radius: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #18181b;
        background: #f3f4f6;

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
      padding: 0;
      max-width: 128px;
      margin: 0;

      .qr-container, .placeholder-container {
        margin-bottom: 0;

        .qr-image-wrapper, .placeholder-qr {
          width: 128px;
          height: 128px;
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