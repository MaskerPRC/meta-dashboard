<template>
  <div class="tab-content">
    <div class="config-section">
      <h3 class="config-title">{{ t('admin.site_config.wechat_group.title') }}</h3>
      <div class="config-form">
        <el-form label-width="120px">
          <el-form-item :label="t('admin.site_config.wechat_group.qr_code')">
            <div class="qr-upload-container">
              <el-upload
                :show-file-list="false"
                :before-upload="beforeQRUpload"
                accept="image/*"
                :http-request="handleQRUpload"
              >
                <div class="qr-preview" v-if="siteConfig.wechat_group_qr?.value">
                  <img :src="siteConfig.wechat_group_qr.value" alt="微信群二维码" />
                  <div class="qr-mask">
                    <el-icon><Plus /></el-icon>
                    <span>{{ t('admin.site_config.wechat_group.change_qr') }}</span>
                  </div>
                </div>
                <div class="qr-placeholder" v-else>
                  <el-icon><Plus /></el-icon>
                  <span>{{ t('admin.site_config.wechat_group.upload_qr') }}</span>
                </div>
              </el-upload>
            </div>
          </el-form-item>

          <el-form-item :label="t('admin.site_config.wechat_group.group_title')">
            <el-input
              :value="siteConfig.wechat_group_title?.value || ''"
              @input="(value) => { if (siteConfig.wechat_group_title) siteConfig.wechat_group_title.value = value }"
              :placeholder="t('admin.site_config.wechat_group.title_placeholder')"
              style="width: 300px"
              @blur="updateConfig('wechat_group_title', siteConfig.wechat_group_title?.value)"
            />
          </el-form-item>

          <el-form-item :label="t('admin.site_config.wechat_group.group_description')">
            <el-input
              type="textarea"
              :value="siteConfig.wechat_group_description?.value || ''"
              @input="(value) => { if (siteConfig.wechat_group_description) siteConfig.wechat_group_description.value = value }"
              :placeholder="t('admin.site_config.wechat_group.description_placeholder')"
              :rows="3"
              style="width: 400px"
              @blur="updateConfig('wechat_group_description', siteConfig.wechat_group_description?.value)"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveAllConfigs">{{ t('admin.site_config.wechat_group.save_all') }}</el-button>
            <el-button @click="loadSiteConfig">{{ t('admin.site_config.wechat_group.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from '../../utils/axios'

const { t } = useI18n()

// 响应式数据
const siteConfig = ref({})
const configLoading = ref(false)

// 方法
const loadSiteConfig = async () => {
  try {
    configLoading.value = true
    const response = await axios.get('/api/config')
    siteConfig.value = response.data.configs
  } catch (error) {
    console.error('获取站点配置失败:', error)
    ElMessage.error(t('admin.site_config.messages.fetch_failed'))
  } finally {
    configLoading.value = false
  }
}

const updateConfig = async (key, value) => {
  try {
    await axios.put(`/api/config/${key}`, { value })
    ElMessage.success(t('admin.site_config.messages.update_success'))
  } catch (error) {
    console.error('更新配置失败:', error)
    ElMessage.error(t('admin.site_config.messages.update_failed'))
    // 重新加载配置以恢复原值
    loadSiteConfig()
  }
}

const saveAllConfigs = async () => {
  try {
    const configs = {}
    Object.keys(siteConfig.value).forEach(key => {
      configs[key] = siteConfig.value[key].value
    })

    await axios.put('/api/config', { configs })
    ElMessage.success(t('admin.site_config.messages.save_success'))
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error(t('admin.site_config.messages.save_failed'))
  }
}

const beforeQRUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error(t('admin.site_config.messages.image_only'))
    return false
  }
  if (!isLt5M) {
    ElMessage.error(t('admin.site_config.messages.file_too_large'))
    return false
  }
  return true
}

const handleQRUpload = async (uploadFile) => {
  const formData = new FormData()
  formData.append('image', uploadFile.file)

  try {
    // 这里应该调用图片上传API，暂时使用base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Data = e.target.result
      await updateConfig('wechat_group_qr', base64Data)
      // 更新本地状态
      if (!siteConfig.value.wechat_group_qr) {
        siteConfig.value.wechat_group_qr = {}
      }
      siteConfig.value.wechat_group_qr.value = base64Data
      ElMessage.success(t('admin.site_config.messages.upload_success'))
    }
    reader.readAsDataURL(uploadFile.file)
  } catch (error) {
    console.error('上传二维码失败:', error)
    ElMessage.error(t('admin.site_config.messages.upload_failed'))
  }
}

// 暴露方法供父组件调用
defineExpose({
  loadSiteConfig
})

// 生命周期
onMounted(loadSiteConfig)
</script>

<style lang="scss" scoped>
.config-section {
  .config-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--ai-text-primary);
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--ai-border);
  }

  .config-form {
    .qr-upload-container {
      .qr-preview,
      .qr-placeholder {
        width: 200px;
        height: 200px;
        border: 2px dashed var(--ai-border);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &:hover {
          border-color: var(--ai-primary);
          background: var(--ai-bg-secondary);
        }
      }

      .qr-preview {
        border-style: solid;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .qr-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease;

          &:hover {
            opacity: 1;
          }

          .el-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }

          span {
            font-size: 14px;
          }
        }
      }

      .qr-placeholder {
        color: var(--ai-text-secondary);

        .el-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        span {
          font-size: 14px;
        }
      }
    }
  }
}
</style> 