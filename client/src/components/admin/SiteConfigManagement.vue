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

    <!-- 社交媒体链接配置 -->
    <div class="config-section">
      <h3 class="config-title">社交媒体链接配置</h3>
      <div class="config-form">
        <el-form label-width="120px">
          <el-form-item label="X (Twitter)">
            <el-input
              :value="siteConfig.social_x_url?.value || ''"
              @input="(value) => updateSocialConfig('social_x_url', value)"
              placeholder="https://x.com/your_username"
              style="width: 400px"
              @blur="updateConfig('social_x_url', siteConfig.social_x_url?.value)"
            >
              <template #prepend>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="小红书">
            <el-input
              :value="siteConfig.social_xiaohongshu_url?.value || ''"
              @input="(value) => updateSocialConfig('social_xiaohongshu_url', value)"
              placeholder="https://www.xiaohongshu.com/user/profile/your_id"
              style="width: 400px"
              @blur="updateConfig('social_xiaohongshu_url', siteConfig.social_xiaohongshu_url?.value)"
            >
              <template #prepend>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="哔哩哔哩">
            <el-input
              :value="siteConfig.social_bilibili_url?.value || ''"
              @input="(value) => updateSocialConfig('social_bilibili_url', value)"
              placeholder="https://space.bilibili.com/your_uid"
              style="width: 400px"
              @blur="updateConfig('social_bilibili_url', siteConfig.social_bilibili_url?.value)"
            >
              <template #prepend>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="微信公众号">
            <el-input
              :value="siteConfig.social_wechat_official_url?.value || ''"
              @input="(value) => updateSocialConfig('social_wechat_official_url', value)"
              placeholder="微信公众号链接或二维码链接"
              style="width: 400px"
              @blur="updateConfig('social_wechat_official_url', siteConfig.social_wechat_official_url?.value)"
            >
              <template #prepend>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="知乎">
            <el-input
              :value="siteConfig.social_zhihu_url?.value || ''"
              @input="(value) => updateSocialConfig('social_zhihu_url', value)"
              placeholder="https://www.zhihu.com/people/your_id"
              style="width: 400px"
              @blur="updateConfig('social_zhihu_url', siteConfig.social_zhihu_url?.value)"
            >
              <template #prepend>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="CSDN">
            <el-input
              :value="siteConfig.social_csdn_url?.value || ''"
              @input="(value) => updateSocialConfig('social_csdn_url', value)"
              placeholder="https://blog.csdn.net/your_username"
              style="width: 400px"
              @blur="updateConfig('social_csdn_url', siteConfig.social_csdn_url?.value)"
            >
              <template #prepend>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveAllConfigs">保存所有社交媒体链接</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 特色内容配置 -->
    <div class="config-section">
      <h3 class="config-title">特色内容配置</h3>
      <div class="config-form">
        <el-form label-width="140px">
          <el-form-item label="创业启动文章链接">
            <el-input
              :value="siteConfig.startup_article_url?.value || ''"
              @input="(value) => updateSocialConfig('startup_article_url', value)"
              placeholder="微信公众号创业启动文章的链接"
              style="width: 400px"
              @blur="updateConfig('startup_article_url', siteConfig.startup_article_url?.value)"
            >
              <template #prepend>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="文章标题">
            <el-input
              :value="siteConfig.startup_article_title?.value || ''"
              @input="(value) => updateSocialConfig('startup_article_title', value)"
              placeholder="创业启动文章的标题"
              style="width: 400px"
              @blur="updateConfig('startup_article_title', siteConfig.startup_article_title?.value)"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveAllConfigs">保存特色内容配置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 公开简历配置 -->
    <div class="config-section">
      <h3 class="config-title">公开简历配置</h3>
      <div class="config-form">
        <el-form label-width="120px">
          <el-form-item label="选择用户">
            <el-select
              v-model="publicResumeConfig.user_id"
              placeholder="选择要公开简历的用户"
              style="width: 400px"
              @change="handleUserChange"
              clearable
            >
              <el-option
                v-for="user in userList"
                :key="user.id"
                :label="`${user.display_name || user.username} - ${user.resume_title}`"
                :value="user.id"
              >
                <div class="user-option">
                  <div class="user-info">
                    <span class="user-name">{{ user.display_name || user.username }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                  <div class="resume-info">
                    <span class="resume-title">{{ user.resume_title }}</span>
                    <span class="resume-version">v{{ user.current_version }}</span>
                    <span class="resume-date">{{ formatDate(user.updated_at) }}</span>
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="选择版本" v-if="publicResumeConfig.user_id">
            <el-select
              v-model="publicResumeConfig.version"
              placeholder="选择要显示的版本"
              style="width: 300px"
              @change="handleVersionChange"
            >
              <el-option label="最新版本" value="latest">
                <div class="version-option">
                  <span class="version-label">最新版本</span>
                  <span class="version-desc">始终显示用户的最新简历</span>
                </div>
              </el-option>
              <el-option
                v-for="version in versionList"
                :key="version.version"
                :label="`v${version.version} - ${version.title}`"
                :value="version.version"
              >
                <div class="version-option">
                  <div class="version-header">
                    <span class="version-number">v{{ version.version }}</span>
                    <span class="version-title">{{ version.title }}</span>
                  </div>
                  <div class="version-meta">
                    <span class="version-date">{{ formatDate(version.created_at) }}</span>
                    <span v-if="version.created_by_name" class="version-author">by {{ version.created_by_name }}</span>
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item v-if="selectedUserResume">
            <div class="resume-preview">
              <h4>简历预览</h4>
              <div class="preview-info">
                <p><strong>标题:</strong> {{ selectedUserResume.title }}</p>
                <p><strong>版本:</strong> v{{ publicResumeConfig.version === 'latest' ? selectedUserResume.current_version : publicResumeConfig.version }}</p>
                <p><strong>更新时间:</strong> {{ formatDate(selectedUserResume.updated_at) }}</p>
              </div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="savePublicResumeConfig" :loading="savingConfig">保存公开简历配置</el-button>
            <el-button @click="clearPublicResumeConfig">清除配置</el-button>
            <el-button @click="previewPublicResume" v-if="publicResumeConfig.user_id">预览公开简历</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { showNotification } from '../../utils/notification'
import { Plus, Link } from '@element-plus/icons-vue'
import axios from '../../utils/axios'

const { t } = useI18n()

// 响应式数据
const siteConfig = ref({})
const configLoading = ref(false)
const userList = ref([])
const versionList = ref([])
const selectedUserResume = ref(null)
const savingConfig = ref(false)
const publicResumeConfig = ref({
  user_id: null,
  version: 'latest'
})

// 方法
const loadSiteConfig = async () => {
  try {
    configLoading.value = true
    const response = await axios.get('/api/config')
    siteConfig.value = response.data.configs
    
    // 加载公开简历配置
    if (siteConfig.value.public_resume_config?.value) {
      try {
        const config = JSON.parse(siteConfig.value.public_resume_config.value)
        publicResumeConfig.value = {
          user_id: config.user_id || null,
          version: config.version || 'latest'
        }
        if (publicResumeConfig.value.user_id) {
          await loadUserResume(publicResumeConfig.value.user_id)
        }
      } catch (parseErr) {
        console.error('解析公开简历配置失败:', parseErr)
      }
    }
  } catch (error) {
    console.error('获取站点配置失败:', error)
    showNotification.error(t('admin.site_config.messages.fetch_failed'))
  } finally {
    configLoading.value = false
  }
}

const updateConfig = async (key, value) => {
  try {
    await axios.put(`/api/config/${key}`, { value })
    showNotification.success(t('admin.site_config.messages.update_success'))
  } catch (error) {
    console.error('更新配置失败:', error)
    showNotification.error(t('admin.site_config.messages.update_failed'))
    // 重新加载配置以恢复原值
    loadSiteConfig()
  }
}

const updateSocialConfig = (key, value) => {
  if (!siteConfig.value[key]) {
    siteConfig.value[key] = { value: '', description: '', type: 'url' }
  }
  siteConfig.value[key].value = value
}

const saveAllConfigs = async () => {
  try {
    const configs = {}
    Object.keys(siteConfig.value).forEach(key => {
      configs[key] = siteConfig.value[key].value
    })

    await axios.put('/api/config', { configs })
    showNotification.success(t('admin.site_config.messages.save_success'))
  } catch (error) {
    console.error('保存配置失败:', error)
    showNotification.error(t('admin.site_config.messages.save_failed'))
  }
}

const beforeQRUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    showNotification.error(t('admin.site_config.messages.image_only'))
    return false
  }
  if (!isLt5M) {
    showNotification.error(t('admin.site_config.messages.file_too_large'))
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
      showNotification.success(t('admin.site_config.messages.upload_success'))
    }
    reader.readAsDataURL(uploadFile.file)
  } catch (error) {
    console.error('上传二维码失败:', error)
    showNotification.error(t('admin.site_config.messages.upload_failed'))
  }
}

// 暴露方法供父组件调用
defineExpose({
  loadSiteConfig
})

// 新增方法
const loadUserList = async () => {
  try {
    const response = await axios.get('/api/resumes/admin/users-with-resumes')
    userList.value = response.data.users
  } catch (error) {
    console.error('获取有简历的用户列表失败:', error)
    showNotification.error('获取有简历的用户列表失败')
  }
}

const loadUserResume = async (userId) => {
  try {
    const [resumeResponse, versionsResponse] = await Promise.all([
      axios.get(`/api/resumes/admin/user/${userId}`),
      axios.get(`/api/resumes/admin/user/${userId}/versions`)
    ])
    
    selectedUserResume.value = resumeResponse.data.resume
    versionList.value = versionsResponse.data.versions
  } catch (error) {
    console.error('获取用户简历失败:', error)
    selectedUserResume.value = null
    versionList.value = []
  }
}

const handleUserChange = async (userId) => {
  if (userId) {
    await loadUserResume(userId)
  } else {
    selectedUserResume.value = null
    versionList.value = []
  }
  publicResumeConfig.value.version = 'latest'
}

const handleVersionChange = (version) => {
  // 版本改变处理
}

const savePublicResumeConfig = async () => {
  if (!publicResumeConfig.value.user_id) {
    showNotification.error('请选择要公开的用户')
    return
  }
  
  try {
    savingConfig.value = true
    const configValue = JSON.stringify({
      user_id: publicResumeConfig.value.user_id,
      version: publicResumeConfig.value.version
    })
    
    await axios.put('/api/config/public_resume_config', { 
      value: configValue,
      description: '公开简历配置，指定要在公共页面显示的用户简历和版本',
      type: 'json'
    })
    showNotification.success('公开简历配置保存成功')
    
    // 重新加载配置
    await loadSiteConfig()
  } catch (error) {
    console.error('保存公开简历配置失败:', error)
    showNotification.error('保存公开简历配置失败')
  } finally {
    savingConfig.value = false
  }
}

const clearPublicResumeConfig = async () => {
  try {
    await axios.delete('/api/config/public_resume_config')
    publicResumeConfig.value = { user_id: null, version: 'latest' }
    selectedUserResume.value = null
    versionList.value = []
    showNotification.success('公开简历配置已清除')
  } catch (error) {
    console.error('清除公开简历配置失败:', error)
    showNotification.error('清除公开简历配置失败')
  }
}

const previewPublicResume = () => {
  window.open('/resume', '_blank')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(async () => {
  await loadSiteConfig()
  await loadUserList()
})
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

.resume-preview {
  background: var(--ai-bg-secondary);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--ai-border);
  
  h4 {
    margin: 0 0 12px 0;
    color: var(--ai-text-primary);
  }
  
  .preview-info {
    p {
      margin: 8px 0;
      color: var(--ai-text-regular);
      
      strong {
        color: var(--ai-text-primary);
      }
    }
  }
}

.user-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .user-info {
    display: flex;
    gap: 8px;
    align-items: center;
    
    .user-name {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    .user-email {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }
  
  .resume-info {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    
    .resume-title {
      color: var(--el-text-color-regular);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .resume-version {
      background: var(--el-fill-color-light);
      padding: 1px 4px;
      border-radius: 2px;
      color: var(--el-text-color-secondary);
    }
    
    .resume-date {
      color: var(--el-text-color-placeholder);
    }
  }
}

.version-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .version-label {
    font-weight: 500;
    color: var(--el-color-primary);
  }
  
  .version-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  
  .version-header {
    display: flex;
    gap: 8px;
    align-items: center;
    
    .version-number {
      background: var(--el-color-primary);
      color: white;
      padding: 1px 4px;
      border-radius: 2px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .version-title {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }
  
  .version-meta {
    display: flex;
    gap: 8px;
    font-size: 12px;
    
    .version-date {
      color: var(--el-text-color-secondary);
    }
    
    .version-author {
      color: var(--el-text-color-placeholder);
    }
  }
}
</style> 