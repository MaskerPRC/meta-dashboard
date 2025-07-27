<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="AI智能生成项目"
    width="800px"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <div class="ai-generate-container">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" style="margin-bottom: 30px">
        <el-step title="输入描述" description="描述您的项目想法" />
        <el-step title="AI生成" description="AI解析并生成项目结构" />
        <el-step title="预览确认" description="预览并确认生成的项目" />
      </el-steps>

      <!-- 第一步：文本输入 -->
      <div v-if="currentStep === 0" class="ai-step">
        <div class="step-title">请描述您想要创建的项目：</div>
        <el-form :model="form" label-position="top">
          <el-form-item label="项目描述（支持中英文，最多5000字符）">
            <el-input
              v-model="form.text"
              type="textarea"
              :rows="8"
              placeholder="例如：我想做一个在线图书管理系统，用户可以搜索图书、借阅图书、查看借阅历史。管理员可以添加新书、管理用户借阅记录。使用Vue.js前端，Node.js后端，MySQL数据库。"
              maxlength="5000"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="语言偏好">
            <el-radio-group v-model="form.language">
              <el-radio value="zh">中文</el-radio>
              <el-radio value="en">English</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <div class="ai-examples">
          <div class="examples-title">💡 示例描述：</div>
          <div class="examples-list">
            <el-tag
              v-for="example in examples"
              :key="example"
              class="example-tag"
              @click="form.text = example"
              style="cursor: pointer; margin: 5px;"
            >
              {{ example.slice(0, 30) }}...
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 第二步：AI生成中 -->
      <div v-if="currentStep === 1" class="ai-step">
        <div class="ai-loading">
          <el-icon class="is-loading" style="font-size: 48px; color: #409eff;"><Loading /></el-icon>
          <div class="loading-text">AI正在分析您的描述...</div>
          <div class="loading-progress">
            <el-progress
              :percentage="progress"
              :stroke-width="8"
              status="success"
              style="width: 300px; margin-top: 20px;"
            />
          </div>
        </div>
      </div>

      <!-- 第三步：预览确认 -->
      <div v-if="currentStep === 2" class="ai-step">
        <div class="step-title">AI生成的项目预览：</div>
        <div class="generated-project-preview">
          <el-card class="project-card">
            <template #header>
              <div class="card-header">
                <span class="project-title">{{ generatedProject.title }}</span>
                <el-tag type="success">AI生成</el-tag>
              </div>
            </template>

            <div class="project-details">
              <div class="detail-row">
                <span class="label">项目描述：</span>
                <span class="value">{{ generatedProject.description }}</span>
              </div>

              <div class="detail-row">
                <span class="label">状态：</span>
                <el-tag :type="getStatusTagType(generatedProject.status)">
                  {{ getStatusText(generatedProject.status) }}
                </el-tag>
              </div>

              <div class="detail-row">
                <span class="label">优先级：</span>
                <el-tag :type="getPriorityTagType(generatedProject.priority)">
                  {{ getPriorityText(generatedProject.priority) }}
                </el-tag>
              </div>

              <div class="detail-row" v-if="generatedProject.tech_stack?.length">
                <span class="label">技术栈：</span>
                <div class="tech-tags">
                  <el-tag
                    v-for="tech in generatedProject.tech_stack"
                    :key="tech"
                    size="small"
                    style="margin-right: 8px;"
                  >
                    {{ tech }}
                  </el-tag>
                </div>
              </div>

              <div class="detail-row" v-if="generatedProject.tags?.length">
                <span class="label">标签：</span>
                <div class="tag-list">
                  <el-tag
                    v-for="tag in generatedProject.tags"
                    :key="tag"
                    size="small"
                    type="info"
                    style="margin-right: 8px;"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>

              <div class="detail-row">
                <span class="label">项目内容：</span>
                <div class="content-preview">
                  {{ generatedProject.content }}
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button
          v-if="currentStep === 0"
          type="primary"
          :disabled="!form.text.trim()"
          @click="startGenerate"
        >
          开始生成
        </el-button>
        <el-button
          v-if="currentStep === 2"
          @click="currentStep = 0"
        >
          重新生成
        </el-button>
        <el-button
          v-if="currentStep === 2"
          type="primary"
          @click="saveProject"
        >
          创建项目
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElDialog, ElSteps, ElStep, ElForm, ElFormItem, ElInput, ElRadioGroup, ElRadio, ElButton, ElDivider, ElTag, ElProgress, ElAlert } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Loading } from '@element-plus/icons-vue'
import axios from '../../utils/axios'

// Props和Events
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'project-created'])

// 响应式数据
const currentStep = ref(0)
const progress = ref(0)
const form = reactive({
  text: '',
  language: 'zh'
})
const generatedProject = ref({})

const examples = ref([
  '我想做一个在线图书管理系统，用户可以搜索图书、借阅图书、查看借阅历史。管理员可以添加新书、管理用户借阅记录。使用Vue.js前端，Node.js后端，MySQL数据库。',
  '开发一个个人博客系统，支持文章发布、评论、标签分类。使用React和Express.js，包含用户注册登录功能。',
  '创建一个任务管理应用，团队成员可以创建任务、分配任务、跟踪进度。需要实时通知功能，使用WebSocket技术。',
  '建立一个电商平台，包含商品展示、购物车、订单管理、支付集成。支持移动端和PC端，使用微服务架构。',
  '设计一个在线学习平台，学生可以观看视频课程、完成作业、参与讨论。教师可以上传课程内容和管理学生。'
])

const { t } = useI18n()

// 方法
const startGenerate = async () => {
  if (!form.text.trim()) {
    ElMessage.warning('请输入项目描述')
    return
  }

  currentStep.value = 1
  progress.value = 0

  // 模拟进度更新
  const progressInterval = setInterval(() => {
    progress.value += 10
    if (progress.value >= 90) {
      clearInterval(progressInterval)
    }
  }, 200)

  try {
    const response = await axios.post('/api/projects/ai-generate', {
      text: form.text,
      language: form.language
    })

    if (response.data.project) {
      generatedProject.value = response.data.project
      progress.value = 100

      setTimeout(() => {
        currentStep.value = 2
        clearInterval(progressInterval)
      }, 500)
    }

    ElMessage.success('AI项目生成成功！')
  } catch (error) {
    console.error('AI生成失败:', error)
    ElMessage.error(error.response?.data?.message || 'AI生成失败，请稍后重试')
    currentStep.value = 0
    clearInterval(progressInterval)
  }
}

const saveProject = async () => {
  try {
    const response = await axios.post('/api/projects', generatedProject.value)

    if (response.data.project) {
      ElMessage.success('项目创建成功！')
      emit('project-created', response.data.project)
      closeDialog()
    }
  } catch (error) {
    console.error('保存项目失败:', error)
    ElMessage.error(error.response?.data?.message || '保存项目失败')
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
  currentStep.value = 0
  progress.value = 0
  form.text = ''
  form.language = 'zh'
  generatedProject.value = {}
}

// 状态和优先级相关方法
const getStatusText = (status) => {
  const statusMap = {
    'idea': 'brainstorming',
    'planning': 'planning',
    'development': 'development',
    'testing': 'testing',
    'deployed': 'deployed',
    'completed': 'completed',
    'paused': 'on_hold'
  }
  const translationKey = statusMap[status] || 'brainstorming'
  return t(`project.status_options.${translationKey}`)
}

const getStatusTagType = (status) => {
  const typeMap = {
    'idea': 'info',
    'planning': 'warning',
    'development': 'primary',
    'testing': 'success',
    'deployed': 'success',
    'completed': 'success',
    'paused': 'danger'
  }
  return typeMap[status] || 'info'
}

const getPriorityText = (priority) => {
  const priorityMap = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'critical': 'urgent'
  }
  const translationKey = priorityMap[priority] || 'medium'
  return t(`project.priority_options.${translationKey}`)
}

const getPriorityTagType = (priority) => {
  const typeMap = {
    'low': 'info',
    'medium': 'warning',
    'high': 'danger',
    'critical': 'danger'
  }
  return typeMap[priority] || 'info'
}
</script>

<style lang="scss" scoped>
.ai-generate-container {
  padding: 20px 24px;
}

.ai-step {
  min-height: 300px;
}

.step-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.ai-examples {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.examples-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 16px;
}

.examples-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.example-tag {
  transition: all 0.3s;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.example-tag:hover {
  background-color: #409eff;
  color: white;
  transform: translateY(-1px);
}

.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-text {
  font-size: 16px;
  color: #606266;
  margin-top: 20px;
}

.loading-progress {
  margin-top: 20px;
}

.generated-project-preview {
  margin-top: 24px;
}

.project-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
}

.project-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.project-details {
  padding: 0 24px 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.detail-row .label {
  font-weight: 600;
  color: #606266;
  width: 100px;
  flex-shrink: 0;
}

.detail-row .value {
  color: #303133;
  flex: 1;
}

.tech-tags, .tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.content-preview {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  white-space: pre-wrap;
  line-height: 1.6;
  max-height: 200px;
  overflow-y: auto;
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 