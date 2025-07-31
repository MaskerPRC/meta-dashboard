<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="project ? t('project.edit_project') : t('admin.new_project')"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="top"
    >
      <!-- 第一行：项目基本信息 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item :label="t('project.form_labels.project_name')" prop="title">
            <el-input
              v-model="formData.title"
              :placeholder="t('project.placeholders.enter_project_name')"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item :label="t('project.status')" prop="status">
            <el-select v-model="formData.status" :placeholder="t('project.select_status')" style="width: 100%">
              <el-option :label="t('project.status_options.brainstorming')" value="idea" />
              <el-option :label="t('project.status_options.planning')" value="planning" />
              <el-option :label="t('project.status_options.development')" value="development" />
              <el-option :label="t('project.status_options.testing')" value="testing" />
              <el-option :label="t('project.status_options.deployed')" value="deployed" />
              <el-option :label="t('project.status_options.completed')" value="completed" />
              <el-option :label="t('project.status_options.on_hold')" value="paused" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item :label="t('project.priority')" prop="priority">
            <el-select v-model="formData.priority" :placeholder="t('project.select_priority')" style="width: 100%">
              <el-option :label="t('project.priority_options.low')" value="low" />
              <el-option :label="t('project.priority_options.medium')" value="medium" />
              <el-option :label="t('project.priority_options.high')" value="high" />
              <el-option :label="t('project.priority_options.urgent')" value="critical" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item :label="t('project.form_labels.progress_percentage')" prop="progress">
            <el-slider
              v-model="formData.progress"
              :min="0"
              :max="100"
              :step="5"
              show-input
              input-size="small"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

            <!-- 第二行：项目描述 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item :label="t('project.form_labels.project_description')" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              :placeholder="t('project.placeholders.enter_project_description')"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行：链接和时间 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item :label="t('project.form_labels.github_repo')">
            <el-input
              v-model="formData.github_repo"
              :placeholder="t('project.placeholders.github_repo_url')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item :label="t('project.form_labels.demo_link')">
            <el-input
              v-model="formData.demo_url"
              :placeholder="t('project.placeholders.demo_url')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item :label="t('project.form_labels.start_time')">
            <el-date-picker
              v-model="formData.start_date"
              type="date"
              :placeholder="t('project.placeholders.select_start_time')"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item :label="t('project.form_labels.expected_completion')">
            <el-date-picker
              v-model="formData.due_date"
              type="date"
              :placeholder="t('project.placeholders.select_completion_time')"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第四行：技术栈和标签 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="t('project.form_labels.tech_stack')">
            <div class="tag-input-container">
              <el-tag
                v-for="(tech, index) in formData.tech_stack"
                :key="tech"
                closable
                @close="removeTech(index)"
                class="tech-tag"
              >
                {{ tech }}
              </el-tag>
              <el-input
                v-if="showTechInput"
                ref="techInputRef"
                v-model="newTech"
                size="small"
                @keyup.enter="addTech"
                @blur="addTech"
                :placeholder="t('project.placeholders.add_tech_stack')"
                style="width: 100px"
              />
              <el-button
                v-else
                size="small"
                @click="showTechInput = true"
              >
                {{ t('project.actions_buttons.add_tech_stack') }}
              </el-button>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('project.form_labels.project_tags')">
            <div class="tag-input-container">
              <el-tag
                v-for="(tag, index) in formData.tags"
                :key="tag"
                closable
                @close="removeTag(index)"
                class="project-tag"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="showTagInput"
                ref="tagInputRef"
                v-model="newTag"
                size="small"
                @keyup.enter="addTag"
                @blur="addTag"
                :placeholder="t('project.placeholders.add_tag')"
                style="width: 80px"
              />
              <el-button
                v-else
                size="small"
                @click="showTagInput = true"
              >
                {{ t('project.actions_buttons.add_tag') }}
              </el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行：项目详细内容（全宽度） -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item :label="t('project.form_labels.project_content')" class="full-width-editor">
            <div class="content-editor">
              <!-- 编辑器工具栏 -->
              <div class="editor-toolbar">
                <el-button-group>
                  <el-button
                    :type="editorMode === 'edit' ? 'primary' : 'default'"
                    size="small"
                    @click="editorMode = 'edit'"
                  >
                    <el-icon><Edit /></el-icon>
                    {{ t('project.editor.edit_mode') }}
                  </el-button>
                  <el-button
                    :type="editorMode === 'preview' ? 'primary' : 'default'"
                    size="small"
                    @click="editorMode = 'preview'"
                  >
                    <el-icon><View /></el-icon>
                    {{ t('project.editor.preview_mode') }}
                  </el-button>
                  <el-button
                    :type="editorMode === 'split' ? 'primary' : 'default'"
                    size="small"
                    @click="editorMode = 'split'"
                  >
                    <el-icon><Operation /></el-icon>
                    {{ t('project.editor.split_mode') }}
                  </el-button>
                </el-button-group>

                <el-button size="small" @click="insertTemplate">
                  <el-icon><Document /></el-icon>
                  {{ t('project.editor.insert_template') }}
                </el-button>
                
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleFileChange"
                  accept="image/*,video/*"
                  style="display: inline-block; margin-left: 8px;"
                >
                  <el-button size="small" :loading="uploading">
                    <el-icon><Picture /></el-icon>
                    {{ t('project.attachments.upload') }}
                  </el-button>
                </el-upload>
              </div>

              <!-- 编辑器内容 -->
              <div class="editor-content" :class="editorMode">
                <!-- 编辑模式 -->
                <div v-if="editorMode === 'edit' || editorMode === 'split'" class="editor-panel">
                  <el-input
                    v-model="formData.content"
                    type="textarea"
                    :rows="18"
                    :placeholder="t('project.placeholders.enter_project_content')"
                    resize="none"
                    @paste="handlePaste"
                  />
                  
                  <!-- 附件预览区域 -->
                  <div v-if="hasAttachments" class="attachments-section">
                    <div class="section-title">{{ t('project.editor.attachments_added') }}</div>
                    <div class="attachments-grid">
                      <!-- 图片预览 -->
                      <div v-for="(image, index) in formData.attachments.images" :key="`img-${index}`" class="attachment-item image-item">
                        <img :src="image.url" :alt="image.filename" />
                        <div class="attachment-overlay">
                          <span class="filename">{{ image.filename }}</span>
                          <el-button type="danger" size="small" @click="removeAttachment('images', index)">
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </div>
                      </div>
                      
                      <!-- 视频预览 -->
                      <div v-for="(video, index) in formData.attachments.videos" :key="`vid-${index}`" class="attachment-item video-item">
                        <video :src="video.url" preload="metadata"></video>
                        <div class="attachment-overlay">
                          <span class="filename">{{ video.filename }}</span>
                          <el-button type="danger" size="small" @click="removeAttachment('videos', index)">
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 预览模式 -->
                <div v-if="editorMode === 'preview' || editorMode === 'split'" class="preview-panel">
                  <div class="markdown-preview" v-html="renderedContent"></div>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ t('project.actions_buttons.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ project ? t('project.actions_buttons.save') : t('project.actions_buttons.create') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { renderEnhancedMarkdown } from '@/utils/markdownRenderer'
import hljs from 'highlight.js'
import axios from '../../utils/axios'
import {
  Edit, View, Operation, Document, Picture, Delete
} from '@element-plus/icons-vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  project: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

// 响应式数据
const formRef = ref(null)
const techInputRef = ref(null)
const tagInputRef = ref(null)
const saving = ref(false)
const editorMode = ref('edit')
const uploading = ref(false)

const showTechInput = ref(false)
const newTech = ref('')
const showTagInput = ref(false)
const newTag = ref('')

const formData = reactive({
  title: '',
  description: '',
  status: 'idea',
  priority: 'medium',
  progress: 0,
  content: '',
  github_repo: '',
  demo_url: '',
  start_date: '',
  due_date: '',
  tech_stack: [],
  tags: [],
  attachments: { images: [], videos: [] }
})

const formRules = {
  title: [
    { required: true, message: t('project.validation.project_name_required'), trigger: 'blur' },
    { min: 2, max: 100, message: t('project.validation.project_name_length'), trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('project.validation.project_description_required'), trigger: 'blur' },
    { min: 10, max: 500, message: t('project.validation.project_description_length'), trigger: 'blur' }
  ],
  status: [
    { required: true, message: t('project.validation.status_required'), trigger: 'change' }
  ],
  priority: [
    { required: true, message: t('project.validation.priority_required'), trigger: 'change' }
  ]
}

// 计算属性
const renderedContent = computed(() => {
  if (!formData.content) return `<p class="empty-preview">${t('project.editor.empty_preview')}</p>`
  return renderEnhancedMarkdown(formData.content)
})

const hasAttachments = computed(() => {
  return formData.attachments.images.length > 0 || formData.attachments.videos.length > 0
})

// 方法
const resetForm = () => {
  Object.assign(formData, {
    title: '',
    description: '',
    status: 'idea',
    priority: 'medium',
    progress: 0,
    content: '',
    github_repo: '',
    demo_url: '',
    start_date: '',
    due_date: '',
    tech_stack: [],
    tags: [],
    attachments: { images: [], videos: [] }
  })

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 文件处理方法
const validateFile = (file) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const allowedVideoTypes = ['video/mp4', 'video/webm']
  
  if (file.type.startsWith('image/')) {
    if (!allowedImageTypes.includes(file.type)) {
      ElMessage.error(t('project.attachments.supported_image_formats'))
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      ElMessage.error(t('project.attachments.max_image_size'))
      return false
    }
  } else if (file.type.startsWith('video/')) {
    if (!allowedVideoTypes.includes(file.type)) {
      ElMessage.error(t('project.attachments.supported_video_formats'))
      return false
    }
    const isLt50M = file.size / 1024 / 1024 < 50
    if (!isLt50M) {
      ElMessage.error(t('project.attachments.max_video_size'))
      return false
    }
  } else {
    ElMessage.error(t('project.attachments.invalid_format'))
    return false
  }
  
  return true
}

const uploadFile = async (file) => {
  if (uploading.value) {
    ElMessage.warning(t('project.attachments.uploading'))
    return
  }
  
  if (!validateFile(file)) {
    return
  }
  
  try {
    uploading.value = true
    const uploadFormData = new FormData()
    uploadFormData.append('files', file)
    
    const response = await axios.post('/api/upload', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    const { images, videos, errors } = response.data.data
    
    if (errors.length > 0) {
      errors.forEach(error => {
        ElMessage.error(`${error.filename}: ${error.error}`)
      })
    }
    
    if (images.length > 0) {
      formData.attachments.images.push(...images)
      ElMessage.success(`${t('project.attachments.upload_success')} ${images.length} ${t('project.attachments.images')}`)
    }
    
    if (videos.length > 0) {
      formData.attachments.videos.push(...videos)
      ElMessage.success(`${t('project.attachments.upload_success')} ${videos.length} ${t('project.attachments.videos')}`)
    }
    
  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error(error.response?.data?.message || t('project.attachments.upload_failed'))
  } finally {
    uploading.value = false
  }
}

const handleFileChange = (file) => {
  uploadFile(file.raw)
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

const removeAttachment = (type, index) => {
  formData.attachments[type].splice(index, 1)
}

const loadProjectData = () => {
  if (props.project) {
    Object.assign(formData, {
      title: props.project.title || '',
      description: props.project.description || '',
      status: props.project.status || 'idea',
      priority: props.project.priority || 'medium',
      progress: props.project.progress || 0,
      content: props.project.content || '',
      github_repo: props.project.github_repo || '',
      demo_url: props.project.demo_url || '',
      start_date: props.project.start_date || '',
      due_date: props.project.due_date || '',
      tech_stack: props.project.tech_stack ? [...props.project.tech_stack] : [],
      tags: props.project.tags ? [...props.project.tags] : [],
      attachments: props.project.attachments ? {
        images: [...(props.project.attachments.images || [])],
        videos: [...(props.project.attachments.videos || [])]
      } : { images: [], videos: [] }
    })
  } else {
    resetForm()
  }
}

const addTech = async () => {
  if (newTech.value && !formData.tech_stack.includes(newTech.value)) {
    formData.tech_stack.push(newTech.value)
  }
  newTech.value = ''
  showTechInput.value = false
}

const removeTech = (index) => {
  formData.tech_stack.splice(index, 1)
}

const addTag = async () => {
  if (newTag.value && !formData.tags.includes(newTag.value)) {
    formData.tags.push(newTag.value)
  }
  newTag.value = ''
  showTagInput.value = false
}

const removeTag = (index) => {
  formData.tags.splice(index, 1)
}

const insertTemplate = () => {
  const template = t('project.template.default_content')
    .replace('{{github_repo}}', formData.github_repo || 'https://github.com/username/repo')
    .replace('{{demo_url}}', formData.demo_url || 'https://demo.example.com')
  
  formData.content = template
}

const handleSave = async () => {
  try {
    await formRef.value.validate()

    saving.value = true

    const data = { ...formData }

    let response
    if (props.project) {
      // 更新项目
      response = await axios.put(`/api/projects/${props.project.id}`, data)
    } else {
      // 创建项目
      response = await axios.post('/api/projects', data)
    }

    ElMessage.success(props.project ? t('project.messages.project_update_success') : t('project.messages.project_create_success'))
    emit('saved', response.data.project)
  } catch (error) {
    console.error('保存项目失败:', error)
    ElMessage.error(error.response?.data?.message || t('project.messages.save_project_failed'))
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

// 监听器
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadProjectData()
  }
})

watch(showTechInput, (newVal) => {
  if (newVal) {
    nextTick(() => {
      techInputRef.value?.focus()
    })
  }
})

watch(showTagInput, (newVal) => {
  if (newVal) {
    nextTick(() => {
      tagInputRef.value?.focus()
    })
  }
})
</script>

<style lang="scss" scoped>
.tag-input-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  .tech-tag, .project-tag {
    margin: 0;
  }
}

.content-editor {
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  overflow: hidden;
  width: 100%;

  .editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--ai-bg-secondary);
    border-bottom: 1px solid var(--ai-border);
  }

  .editor-content {
    &.edit {
      .editor-panel {
        width: 100%;
      }
    }

    &.preview {
      .preview-panel {
        width: 100%;
      }
    }

    &.split {
      display: flex;

      .editor-panel,
      .preview-panel {
        width: 50%;
      }

      .editor-panel {
        border-right: 1px solid var(--ai-border);
      }
    }

    .editor-panel {
      :deep(.el-textarea__inner) {
        border: none;
        border-radius: 0;
        resize: none;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.6;
      }
    }

    .preview-panel {
      padding: 16px;
      background: var(--ai-bg-primary);
      max-height: 450px;
      overflow-y: auto;

      .markdown-preview {
        line-height: 1.8;
        color: var(--ai-text-primary);

        .empty-preview {
          color: var(--ai-text-secondary);
          font-style: italic;
          text-align: center;
          padding: 40px 20px;
        }

        h1, h2, h3, h4, h5, h6 {
          margin: 1.5em 0 0.5em;
          font-weight: 600;
          line-height: 1.3;
          color: var(--ai-text-primary);
        }

        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.17em; }

        p {
          margin: 1em 0;
        }

        ul, ol {
          margin: 1em 0;
          padding-left: 2em;
        }

        blockquote {
          margin: 1em 0;
          padding: 0.5em 1em;
          border-left: 4px solid var(--ai-primary);
          background: var(--ai-bg-secondary);
          border-radius: 0 4px 4px 0;
        }

        code {
          background: var(--ai-bg-secondary);
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875em;
        }

        pre {
          background: var(--ai-bg-secondary);
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;

          code {
            background: none;
            padding: 0;
          }
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;

          th, td {
            border: 1px solid var(--ai-border);
            padding: 8px 12px;
            text-align: left;
          }

          th {
            background: var(--ai-bg-secondary);
            font-weight: 600;
          }
        }
      }
    }
  }
}


.full-width-editor {
  .content-editor {
    min-width: 100%;
  }

  .editor-content {
    min-height: 450px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.attachments-section {
  margin-top: 16px;
  border-top: 1px solid var(--ai-border);
  padding-top: 16px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--ai-text-primary);
    margin-bottom: 12px;
  }

  .attachments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    max-height: 200px;
    overflow-y: auto;
  }

  .attachment-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: var(--ai-bg-secondary);
    border: 1px solid var(--ai-border);
    aspect-ratio: 1;

    img, video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .attachment-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      opacity: 0;
      transition: opacity 0.2s;
      color: white;

      .filename {
        font-size: 12px;
        text-align: center;
        word-break: break-all;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    &:hover .attachment-overlay {
      opacity: 1;
    }
  }
}
</style>
