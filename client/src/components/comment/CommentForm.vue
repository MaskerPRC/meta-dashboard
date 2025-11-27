<template>
  <div class="comment-form">
    <div class="user-avatar">
      <el-avatar :src="authStore.user?.avatar_url" :size="40">
        <el-icon><User /></el-icon>
      </el-avatar>
    </div>
    <div class="form-content">
      <!-- 编辑器工具栏 -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <el-button-group>
                         <el-button 
               :type="editMode === 'write' ? 'primary' : ''" 
               size="small"
               @click="editMode = 'write'"
             >
               <el-icon><Edit /></el-icon>
               {{ t('comment.write') }}
             </el-button>
             <el-button 
               :type="editMode === 'preview' ? 'primary' : ''" 
               size="small"
               @click="editMode = 'preview'"
               :disabled="!modelValue.trim()"
             >
               <el-icon><View /></el-icon>
               {{ t('comment.preview') }}
             </el-button>
          </el-button-group>
          
          <!-- 粘贴提示 -->
          <div class="paste-hint">
            <el-text size="small" type="info">
              <el-icon><Upload /></el-icon>
                             {{ t('comment.paste_support') }}
            </el-text>
          </div>
        </div>
        <div class="toolbar-right">
          <el-dropdown trigger="click" placement="bottom-end">
            <el-button size="small" text>
              <el-icon><QuestionFilled /></el-icon>
              {{ t('comment.markdown_syntax') }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu class="markdown-help">
                <div class="help-content">
                  <div class="help-item">
                    <code>**{{ t('comment.markdown.bold') }}**</code> → <strong>{{ t('comment.markdown.bold') }}</strong>
                  </div>
                  <div class="help-item">
                    <code>*{{ t('comment.markdown.italic') }}*</code> → <em>{{ t('comment.markdown.italic') }}</em>
                  </div>
                  <div class="help-item">
                    <code>`{{ t('comment.markdown.code') }}`</code> → <code>{{ t('comment.markdown.code') }}</code>
                  </div>
                  <div class="help-item">
                    <code>```{{ t('comment.markdown.code_block') }}```</code>
                  </div>
                  <div class="help-item">
                    <code>[{{ t('comment.markdown.link') }}](URL)</code>
                  </div>
                  <div class="help-item">
                    <code>- {{ t('comment.markdown.list_item') }}</code>
                  </div>
                  <div class="help-item">
                    <code>&gt; {{ t('comment.markdown.quote') }}</code>
                  </div>
                </div>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 编辑区域 -->
      <div class="editor-container">
        <el-input
          v-show="editMode === 'write'"
          :model-value="modelValue"
          @update:model-value="$emit('update:modelValue', $event)"
          type="textarea"
          :rows="5"
                     :placeholder="t('comment.paste_hint')"
          maxlength="1000"
          show-word-limit
          resize="none"
          class="markdown-input"
          @paste="handlePaste"
        />
        
        <!-- 预览区域 -->
        <div 
          v-show="editMode === 'preview'" 
          class="markdown-preview"
          v-html="previewContent"
        ></div>
      </div>

      <!-- 附件预览 -->
      <AttachmentPreview 
        v-if="hasAttachmentsToSubmit()"
        :attachments="attachments"
        @remove="removeAttachment"
      />

      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="submitting"
          :disabled="!modelValue.trim() && !hasAttachmentsToSubmit()"
        >
          {{ t('comment.submit') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
import { showNotification } from '../../utils/notification'
import axios from '../../utils/axios'
import AttachmentPreview from './AttachmentPreview.vue'
import { renderEnhancedMarkdown } from '../../utils/markdownRenderer'
import {
  User, Edit, View, Upload, QuestionFilled
} from '@element-plus/icons-vue'



const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const authStore = useAuthStore()
const { t } = useI18n()

// 响应式数据
const editMode = ref('write')
const uploading = ref(false)
const attachments = ref({ images: [], videos: [] })

// 计算属性
const previewContent = computed(() => {
  if (!props.modelValue.trim()) return `<p class="preview-empty">${t('comment.no_content')}</p>`
  return renderMarkdown(props.modelValue)
})

// 方法
const renderMarkdown = (content) => {
  return renderEnhancedMarkdown(content)
}

const hasAttachmentsToSubmit = () => {
  return attachments.value.images.length > 0 || attachments.value.videos.length > 0
}

const handlePaste = async (event) => {
  const items = event.clipboardData?.items
  if (!items) return
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    
    if (item.type.indexOf('image') !== -1) {
      event.preventDefault()
      const file = item.getAsFile()
      if (file) {
        await uploadFile(file)
      }
    } else if (item.kind === 'file') {
      event.preventDefault()
      const file = item.getAsFile()
      if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
        await uploadFile(file)
      }
    }
  }
}

const uploadFile = async (file) => {
  if (uploading.value) {
    showNotification.warning(t('comment.uploading'))
    return
  }
  
  if (!validateFile(file)) {
    return
  }
  
  try {
    uploading.value = true
    const formData = new FormData()
    formData.append('files', file)
    
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    const { images, videos, errors } = response.data.data
    
    if (errors.length > 0) {
      errors.forEach(error => {
        showNotification.error(`${error.filename}: ${error.error}`)
      })
    }
    
    if (images.length > 0) {
      attachments.value.images.push(...images)
      showNotification.success(t('comment.upload_success.images', { count: images.length }))
    }
    
    if (videos.length > 0) {
      attachments.value.videos.push(...videos)
      showNotification.success(t('comment.upload_success.videos', { count: videos.length }))
    }
    
  } catch (error) {
    console.error('文件上传失败:', error)
    showNotification.error(error.response?.data?.message || t('comment.errors.upload_failed'))
  } finally {
    uploading.value = false
  }
}

const validateFile = (file) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const allowedVideoTypes = ['video/mp4', 'video/webm']
  
  if (file.type.startsWith('image/')) {
    if (!allowedImageTypes.includes(file.type)) {
      showNotification.error(t('comment.errors.image_format'))
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      showNotification.error(t('comment.errors.image_size'))
      return false
    }
  } else if (file.type.startsWith('video/')) {
    if (!allowedVideoTypes.includes(file.type)) {
      showNotification.error(t('comment.errors.video_format'))
      return false
    }
    const isLt50M = file.size / 1024 / 1024 < 50
    if (!isLt50M) {
      showNotification.error(t('comment.errors.video_size'))
      return false
    }
  } else {
    showNotification.error(t('comment.errors.file_type'))
    return false
  }
  
  return true
}

const removeAttachment = (type, index) => {
  attachments.value[type].splice(index, 1)
}

const handleSubmit = () => {
  emit('submit', {
    content: props.modelValue.trim(),
    attachments: attachments.value
  })
  
  // 清空表单
  emit('update:modelValue', '')
  attachments.value = { images: [], videos: [] }
  editMode.value = 'write'
}

// 暴露方法给父组件
defineExpose({
  clearForm() {
    emit('update:modelValue', '')
    attachments.value = { images: [], videos: [] }
    editMode.value = 'write'
  }
})
</script>

<style lang="scss" scoped>
.comment-form {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  
  .user-avatar {
    flex-shrink: 0;
  }
  
  .form-content {
    flex: 1;
    
    .editor-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding: 8px 0;
      
      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .paste-hint {
          margin-left: 16px;
          opacity: 0.7;
          
          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
    
    .editor-container {
      margin-bottom: 16px;
      
      .markdown-input {
        :deep(.el-textarea__inner) {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          line-height: 1.6;
          resize: none;
        }
      }
      
      .markdown-preview {
        min-height: 120px;
        padding: 12px;
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
        background-color: var(--el-bg-color-page);
        
        .preview-empty {
          color: var(--el-text-color-placeholder);
          text-align: center;
          margin: 40px 0;
        }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
  }
}

.markdown-help {
  .help-content {
    padding: 8px;
    max-width: 300px;
    
    .help-item {
      margin: 8px 0;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      
      code {
        background: var(--el-bg-color);
        padding: 2px 4px;
        border-radius: 2px;
        font-size: 11px;
      }
    }
  }
}
</style> 