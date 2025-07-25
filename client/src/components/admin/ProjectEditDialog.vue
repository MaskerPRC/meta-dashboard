<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="project ? '编辑项目' : '创建新项目'"
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
          <el-form-item label="项目名称" prop="title">
            <el-input
              v-model="formData.title"
              placeholder="请输入项目名称"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="项目状态" prop="status">
            <el-select v-model="formData.status" placeholder="选择项目状态" style="width: 100%">
              <el-option label="构思中" value="idea" />
              <el-option label="规划中" value="planning" />
              <el-option label="开发中" value="development" />
              <el-option label="测试中" value="testing" />
              <el-option label="已部署" value="deployed" />
              <el-option label="已完成" value="completed" />
              <el-option label="暂停中" value="paused" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="formData.priority" placeholder="选择优先级" style="width: 100%">
              <el-option label="低优先级" value="low" />
              <el-option label="中优先级" value="medium" />
              <el-option label="高优先级" value="high" />
              <el-option label="紧急" value="critical" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="进度百分比" prop="progress">
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
          <el-form-item label="项目描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入项目简短描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行：链接和时间 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="GitHub仓库">
            <el-input
              v-model="formData.github_repo"
              placeholder="https://github.com/username/repo"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="演示链接">
            <el-input
              v-model="formData.demo_url"
              placeholder="https://demo.example.com"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="formData.start_date"
              type="date"
              placeholder="选择开始时间"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="预期完成时间">
            <el-date-picker
              v-model="formData.due_date"
              type="date"
              placeholder="选择预期完成时间"
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
          <el-form-item label="技术栈">
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
                placeholder="添加技术栈"
                style="width: 100px"
              />
              <el-button
                v-else
                size="small"
                @click="showTechInput = true"
              >
                + 添加技术栈
              </el-button>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目标签">
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
                placeholder="添加标签"
                style="width: 80px"
              />
              <el-button
                v-else
                size="small"
                @click="showTagInput = true"
              >
                + 添加标签
              </el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行：项目详细内容（全宽度） -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="项目详细内容" class="full-width-editor">
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
                    编辑
                  </el-button>
                  <el-button
                    :type="editorMode === 'preview' ? 'primary' : 'default'"
                    size="small"
                    @click="editorMode = 'preview'"
                  >
                    <el-icon><View /></el-icon>
                    预览
                  </el-button>
                  <el-button
                    :type="editorMode === 'split' ? 'primary' : 'default'"
                    size="small"
                    @click="editorMode = 'split'"
                  >
                    <el-icon><Operation /></el-icon>
                    分屏
                  </el-button>
                </el-button-group>

                <el-button size="small" @click="insertTemplate">
                  <el-icon><Document /></el-icon>
                  插入模板
                </el-button>
              </div>

              <!-- 编辑器内容 -->
              <div class="editor-content" :class="editorMode">
                <!-- 编辑模式 -->
                <div v-if="editorMode === 'edit' || editorMode === 'split'" class="editor-panel">
                  <el-input
                    v-model="formData.content"
                    type="textarea"
                    :rows="18"
                    placeholder="请输入项目详细内容，支持Markdown格式..."
                    resize="none"
                  />
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
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ project ? '保存' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import hljs from 'highlight.js'
import axios from '../../utils/axios'
import {
  Edit, View, Operation, Document
} from '@element-plus/icons-vue'

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
  tags: []
})

const formRules = {
  title: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 100, message: '项目名称长度应在2-100个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { min: 10, max: 500, message: '项目描述长度应在10-500个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择项目状态', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 计算属性
const renderedContent = computed(() => {
  if (!formData.content) return '<p class="empty-preview">暂无内容</p>'

  // 配置marked
  marked.setOptions({
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value
        } catch (err) {}
      }
      return hljs.highlightAuto(code).value
    },
    breaks: true,
    gfm: true
  })

  return marked(formData.content)
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
    tags: []
  })

  if (formRef.value) {
    formRef.value.clearValidate()
  }
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
      tags: props.project.tags ? [...props.project.tags] : []
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
  const template = `# 项目简介

简要描述这个AI项目的功能和目标。

## 项目背景

- 为什么要做这个项目？
- 解决了什么问题？

## 主要功能

- [ ] 功能1
- [ ] 功能2
- [ ] 功能3

## 技术亮点

- 使用了哪些AI技术？
- 有哪些创新点？

## 开发过程

### 第一阶段：构思和设计
- 需求分析
- 技术选型
- 原型设计

### 第二阶段：开发实现
- 核心功能开发
- AI模型集成
- 测试优化

### 第三阶段：部署上线
- 部署配置
- 性能调优
- 用户反馈

## 遇到的挑战

- 技术挑战1及解决方案
- 技术挑战2及解决方案

## 收获与反思

- 学到了什么？
- 下次可以怎么改进？

## 相关链接

- [源码仓库](${formData.github_repo || 'https://github.com/username/repo'})
- [在线演示](${formData.demo_url || 'https://demo.example.com'})
`
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

    ElMessage.success(props.project ? '项目更新成功' : '项目创建成功')
    emit('saved', response.data.project)
  } catch (error) {
    console.error('保存项目失败:', error)
    ElMessage.error(error.response?.data?.message || '保存项目失败')
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
</style>
