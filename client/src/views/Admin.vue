<template>
  <div class="admin-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">{{ $t('admin.title') }}</h1>
          <p class="page-subtitle">{{ $t('admin.subtitle') }}</p>
        </div>
        <div class="header-actions">
          <el-button type="success" @click="showAIGenerate = true" style="margin-right: 12px">
            <el-icon><Document /></el-icon>
            AI智能生成项目
          </el-button>
          <el-button type="primary" @click="showCreateProject = true">
            <el-icon><Plus /></el-icon>
            {{ $t('admin.new_project') }}
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card ai-card">
            <div class="stat-icon projects">
              <el-icon size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalProjects }}</div>
              <div class="stat-label">{{ $t('admin.stats.total_projects') }}</div>
            </div>
          </div>

          <div class="stat-card ai-card">
            <div class="stat-icon users">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">{{ $t('admin.stats.total_users') }}</div>
            </div>
          </div>

          <div class="stat-card ai-card">
            <div class="stat-icon comments">
              <el-icon size="32"><ChatDotSquare /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalComments }}</div>
              <div class="stat-label">{{ $t('admin.stats.total_comments') }}</div>
            </div>
          </div>

                     <div class="stat-card ai-card">
             <div class="stat-icon progress">
               <el-icon size="32"><ArrowUp /></el-icon>
             </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.avgProgress }}%</div>
              <div class="stat-label">平均进度</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-layout">
        <div class="main-content">
          <!-- 标签页 -->
          <el-tabs v-model="activeTab" class="admin-tabs">
            <!-- 项目管理 -->
            <el-tab-pane :label="$t('admin.project_management')" name="projects">
              <div class="tab-content">
                <!-- 项目操作工具栏 -->
                <div class="projects-toolbar">
                  <div class="toolbar-left">
                    <el-input
                      v-model="projectSearch"
                      placeholder="搜索项目..."
                      style="width: 300px"
                      clearable
                      @input="handleProjectSearch"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>

                    <el-select
                      v-model="projectStatusFilter"
                      placeholder="状态筛选"
                      clearable
                      style="width: 140px"
                      @change="handleProjectFilter"
                    >
                      <el-option label="构思中" value="idea" />
                      <el-option label="规划中" value="planning" />
                      <el-option label="开发中" value="development" />
                      <el-option label="测试中" value="testing" />
                      <el-option label="已部署" value="deployed" />
                      <el-option label="已完成" value="completed" />
                      <el-option label="暂停中" value="paused" />
                    </el-select>
                  </div>

                  <div class="toolbar-right">
                    <el-button @click="exportProjects">
                      <el-icon><Download /></el-icon>
                      导出数据
                    </el-button>
                    <el-button type="danger" @click="handleBatchDelete">
                      <el-icon><Delete /></el-icon>
                      批量删除
                    </el-button>
                  </div>
                </div>

                <!-- 项目表格 -->
                <div class="projects-table-container">
                  <el-table
                    ref="projectsTableRef"
                    :data="filteredProjects"
                    style="width: 100%"
                    @selection-change="handleProjectSelectionChange"
                    v-loading="projectsLoading"
                    empty-text="暂无项目数据"
                  >
                    <el-table-column type="selection" width="55" />

                    <el-table-column prop="id" label="ID" width="80" />

                    <el-table-column prop="title" label="项目名称" min-width="200">
                      <template #default="scope">
                        <div class="project-title-cell">
                          <el-link @click="editProject(scope.row)" type="primary">
                            {{ scope.row.title }}
                          </el-link>
                          <p class="project-desc">{{ scope.row.description }}</p>
                        </div>
                      </template>
                    </el-table-column>

                    <el-table-column prop="status" label="状态" width="100">
                      <template #default="scope">
                        <el-tag :class="['status-tag', scope.row.status]" size="small">
                          {{ getStatusName(scope.row.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>

                    <el-table-column prop="priority" label="优先级" width="100">
                      <template #default="scope">
                        <el-tag :class="['priority-tag', scope.row.priority]" size="small">
                          {{ getPriorityName(scope.row.priority) }}
                        </el-tag>
                      </template>
                    </el-table-column>

                    <el-table-column prop="progress" label="进度" width="120">
                      <template #default="scope">
                        <el-progress
                          :percentage="scope.row.progress"
                          :stroke-width="6"
                          :show-text="true"
                          :format="(percentage) => `${percentage}%`"
                        />
                      </template>
                    </el-table-column>

                    <el-table-column prop="created_at" label="创建时间" width="120">
                      <template #default="scope">
                        {{ formatDate(scope.row.created_at) }}
                      </template>
                    </el-table-column>

                    <el-table-column label="操作" width="200">
                      <template #default="scope">
                        <el-button size="small" @click="editProject(scope.row)">
                          编辑
                        </el-button>
                        <el-button size="small" @click="viewProject(scope.row.id)">
                          查看
                        </el-button>
                        <el-button
                          size="small"
                          type="danger"
                          @click="deleteProject(scope.row)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-tab-pane>

            <!-- 用户管理 -->
            <el-tab-pane :label="$t('admin.user_management')" name="users">
              <div class="tab-content">
                <div class="users-toolbar">
                  <el-input
                    v-model="userSearch"
                    placeholder="搜索用户..."
                    style="width: 300px"
                    clearable
                    @input="handleUserSearch"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>

                <div class="users-table-container">
                  <el-table
                    :data="filteredUsers"
                    style="width: 100%"
                    v-loading="usersLoading"
                    empty-text="暂无用户数据"
                  >
                    <el-table-column prop="id" label="ID" width="80" />

                    <el-table-column prop="avatar_url" label="头像" width="80">
                      <template #default="scope">
                        <el-avatar :src="scope.row.avatar_url" :size="40">
                          <el-icon><User /></el-icon>
                        </el-avatar>
                      </template>
                    </el-table-column>

                    <el-table-column prop="username" label="用户名" min-width="120" />

                    <el-table-column prop="display_name" label="显示名称" min-width="120" />

                    <el-table-column prop="email" label="邮箱" min-width="180" />

                    <el-table-column prop="phone" label="手机号" width="120">
                      <template #default="scope">
                        {{ scope.row.phone || '-' }}
                      </template>
                    </el-table-column>

                    <el-table-column prop="provider" label="认证方式" width="100">
                      <template #default="scope">
                        <el-tag
                          :type="getProviderTagType(scope.row)"
                          size="small"
                        >
                          {{ getProviderName(scope.row) }}
                        </el-tag>
                      </template>
                    </el-table-column>

                    <el-table-column prop="is_admin" label="管理员" width="80">
                      <template #default="scope">
                        <el-switch
                          v-model="scope.row.is_admin"
                          @change="updateUserAdmin(scope.row)"
                          :disabled="scope.row.id === authStore.user?.id"
                        />
                      </template>
                    </el-table-column>

                    <el-table-column prop="last_login" label="最后登录" width="120">
                      <template #default="scope">
                        {{ scope.row.last_login ? formatDateTime(scope.row.last_login) : '-' }}
                      </template>
                    </el-table-column>

                    <el-table-column prop="created_at" label="注册时间" width="120">
                      <template #default="scope">
                        {{ formatDate(scope.row.created_at) }}
                      </template>
                    </el-table-column>

                    <el-table-column label="操作" width="160">
                      <template #default="scope">
                        <el-button
                          v-if="isLocalUser(scope.row)"
                          size="small"
                          type="primary"
                          @click="resetUserPassword(scope.row)"
                        >
                          重置密码
                        </el-button>
                        <el-button
                          size="small"
                          type="danger"
                          @click="deleteUser(scope.row)"
                          :disabled="scope.row.id === authStore.user?.id"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-tab-pane>

            <!-- 评论管理 -->
            <el-tab-pane :label="$t('admin.comment_management')" name="comments">
              <div class="tab-content">
                <div class="comments-table-container">
                  <el-table
                    :data="comments"
                    style="width: 100%"
                    v-loading="commentsLoading"
                    empty-text="暂无评论数据"
                  >
                    <el-table-column prop="id" label="ID" width="80" />

                    <el-table-column prop="project.title" label="项目" min-width="150">
                      <template #default="scope">
                        <el-link @click="viewProject(scope.row.project.id)" type="primary">
                          {{ scope.row.project.title }}
                        </el-link>
                      </template>
                    </el-table-column>

                    <el-table-column prop="user.username" label="用户" width="120" />

                    <el-table-column prop="content" label="评论内容" min-width="300">
                      <template #default="scope">
                        <div class="comment-content">
                          <!-- 文本内容 -->
                          <div v-if="scope.row.content" class="text-content">
                            {{ scope.row.content }}
                          </div>

                          <!-- 附件显示 -->
                          <div v-if="hasAttachments(scope.row)" class="attachments-preview">
                            <!-- 图片附件 -->
                            <div v-if="scope.row.attachments?.images?.length" class="images-preview">
                              <div class="attachment-label">
                                <el-icon><Picture /></el-icon>
                                图片 ({{ scope.row.attachments.images.length }})
                              </div>
                              <div class="images-grid">
                                <el-image
                                  v-for="image in scope.row.attachments.images.slice(0, 3)"
                                  :key="image.id"
                                  :src="image.url"
                                  :preview-src-list="scope.row.attachments.images.map(img => img.url)"
                                  class="preview-image"
                                  fit="cover"
                                  preview-teleported
                                />
                                <div v-if="scope.row.attachments.images.length > 3" class="more-images">
                                  +{{ scope.row.attachments.images.length - 3 }}
                                </div>
                              </div>
                            </div>

                            <!-- 视频附件 -->
                            <div v-if="scope.row.attachments?.videos?.length" class="videos-preview">
                              <div class="attachment-label">
                                <el-icon><VideoPlay /></el-icon>
                                视频 ({{ scope.row.attachments.videos.length }})
                              </div>
                              <div class="videos-list">
                                <div v-for="video in scope.row.attachments.videos" :key="video.id" class="video-item">
                                  <el-link :href="video.url" target="_blank" type="primary">
                                    {{ video.filename }}
                                  </el-link>
                                  <span class="file-size">({{ formatFileSize(video.size) }})</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </el-table-column>

                    <el-table-column prop="created_at" label="发布时间" width="120">
                      <template #default="scope">
                        {{ formatDateTime(scope.row.created_at) }}
                      </template>
                    </el-table-column>

                    <el-table-column label="操作" width="100">
                      <template #default="scope">
                        <el-button
                          size="small"
                          type="danger"
                          @click="deleteComment(scope.row)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-tab-pane>

            <!-- 站点配置 -->
            <el-tab-pane :label="$t('admin.config_management')" name="config">
              <div class="tab-content">
                <div class="config-section">
                  <h3 class="config-title">微信群二维码设置</h3>
                  <div class="config-form">
                    <el-form label-width="120px">
                      <el-form-item label="群二维码">
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
                                <span>更换二维码</span>
                              </div>
                            </div>
                            <div class="qr-placeholder" v-else>
                              <el-icon><Plus /></el-icon>
                              <span>上传微信群二维码</span>
                            </div>
                          </el-upload>
                        </div>
                      </el-form-item>

                      <el-form-item label="群标题">
                        <el-input
                          :value="siteConfig.wechat_group_title?.value || ''"
                          @input="(value) => { if (siteConfig.wechat_group_title) siteConfig.wechat_group_title.value = value }"
                          placeholder="请输入微信群标题"
                          style="width: 300px"
                          @blur="updateConfig('wechat_group_title', siteConfig.wechat_group_title?.value)"
                        />
                      </el-form-item>

                      <el-form-item label="群描述">
                        <el-input
                          type="textarea"
                          :value="siteConfig.wechat_group_description?.value || ''"
                          @input="(value) => { if (siteConfig.wechat_group_description) siteConfig.wechat_group_description.value = value }"
                          placeholder="请输入微信群描述"
                          :rows="3"
                          style="width: 400px"
                          @blur="updateConfig('wechat_group_description', siteConfig.wechat_group_description?.value)"
                        />
                      </el-form-item>

                      <el-form-item>
                        <el-button type="primary" @click="saveAllConfigs">保存所有配置</el-button>
                        <el-button @click="loadSiteConfig">重置</el-button>
                      </el-form-item>
                    </el-form>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 项目编辑/创建对话框 -->
    <ProjectEditDialog
      v-model="showCreateProject"
      :project="editingProject"
      @saved="handleProjectSaved"
    />

    <!-- AI项目生成对话框 -->
    <el-dialog
      v-model="showAIGenerate"
      title="AI智能生成项目"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="ai-generate-container">
        <!-- 步骤指示器 -->
        <el-steps :active="aiGenerateStep" finish-status="success" style="margin-bottom: 30px">
          <el-step title="输入描述" description="描述您的项目想法" />
          <el-step title="AI生成" description="AI解析并生成项目结构" />
          <el-step title="预览确认" description="预览并确认生成的项目" />
        </el-steps>

        <!-- 第一步：文本输入 -->
        <div v-if="aiGenerateStep === 0" class="ai-step">
          <div class="step-title">请描述您想要创建的项目：</div>
          <el-form :model="aiForm" label-position="top">
            <el-form-item label="项目描述（支持中英文，最多5000字符）">
              <el-input
                v-model="aiForm.text"
                type="textarea"
                :rows="8"
                placeholder="例如：我想做一个在线图书管理系统，用户可以搜索图书、借阅图书、查看借阅历史。管理员可以添加新书、管理用户借阅记录。使用Vue.js前端，Node.js后端，MySQL数据库。"
                maxlength="5000"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="语言偏好">
              <el-radio-group v-model="aiForm.language">
                <el-radio value="zh">中文</el-radio>
                <el-radio value="en">English</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>

          <div class="ai-examples">
            <div class="examples-title">💡 示例描述：</div>
            <div class="examples-list">
              <el-tag
                v-for="example in aiExamples"
                :key="example"
                class="example-tag"
                @click="aiForm.text = example"
                style="cursor: pointer; margin: 5px;"
              >
                {{ example.slice(0, 30) }}...
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 第二步：AI生成中 -->
        <div v-if="aiGenerateStep === 1" class="ai-step">
          <div class="ai-loading">
            <el-icon class="is-loading" style="font-size: 48px; color: #409eff;"><Loading /></el-icon>
            <div class="loading-text">AI正在分析您的描述...</div>
            <div class="loading-progress">
              <el-progress
                :percentage="aiProgress"
                :stroke-width="8"
                status="success"
                style="width: 300px; margin-top: 20px;"
              />
            </div>
          </div>
        </div>

        <!-- 第三步：预览确认 -->
        <div v-if="aiGenerateStep === 2" class="ai-step">
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
          <el-button @click="closeAIGenerate">取消</el-button>
          <el-button
            v-if="aiGenerateStep === 0"
            type="primary"
            :disabled="!aiForm.text.trim()"
            @click="startAIGenerate"
          >
            开始生成
          </el-button>
          <el-button
            v-if="aiGenerateStep === 2"
            @click="aiGenerateStep = 0"
          >
            重新生成
          </el-button>
          <el-button
            v-if="aiGenerateStep === 2"
            type="primary"
            @click="saveAIGeneratedProject"
          >
            创建项目
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectEditDialog from '../components/admin/ProjectEditDialog.vue'
import axios from '../utils/axios'
import dayjs from 'dayjs'
import {
  Plus, Document, User, ChatDotSquare, ArrowUp,
  Search, Download, Delete, Picture, VideoPlay, Loading
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('projects')
const showCreateProject = ref(false)
const editingProject = ref(null)

// AI生成相关
const showAIGenerate = ref(false)
const aiGenerateStep = ref(0)
const aiProgress = ref(0)
const aiForm = reactive({
  text: '',
  language: 'zh'
})
const generatedProject = ref({})
const aiExamples = ref([
  '我想做一个在线图书管理系统，用户可以搜索图书、借阅图书、查看借阅历史。管理员可以添加新书、管理用户借阅记录。使用Vue.js前端，Node.js后端，MySQL数据库。',
  '开发一个个人博客系统，支持文章发布、评论、标签分类。使用React和Express.js，包含用户注册登录功能。',
  '创建一个任务管理应用，团队成员可以创建任务、分配任务、跟踪进度。需要实时通知功能，使用WebSocket技术。',
  '建立一个电商平台，包含商品展示、购物车、订单管理、支付集成。支持移动端和PC端，使用微服务架构。',
  '设计一个在线学习平台，学生可以观看视频课程、完成作业、参与讨论。教师可以上传课程内容和管理学生。'
])

// 统计数据
const stats = reactive({
  totalProjects: 0,
  totalUsers: 0,
  totalComments: 0,
  avgProgress: 0
})

// 项目管理
const projects = ref([])
const projectsLoading = ref(false)
const projectSearch = ref('')
const projectStatusFilter = ref('')
const selectedProjects = ref([])

// 用户管理
const users = ref([])
const usersLoading = ref(false)
const userSearch = ref('')
const isLoadingUsers = ref(false) // 标记是否正在加载用户数据

// 评论管理
const comments = ref([])
const commentsLoading = ref(false)

// 站点配置管理
const siteConfig = ref({})
const configLoading = ref(false)

// 计算属性
const filteredProjects = computed(() => {
  let filtered = projects.value

  if (projectSearch.value) {
    const search = projectSearch.value.toLowerCase()
    filtered = filtered.filter(project =>
      project.title.toLowerCase().includes(search) ||
      project.description.toLowerCase().includes(search)
    )
  }

  if (projectStatusFilter.value) {
    filtered = filtered.filter(project => project.status === projectStatusFilter.value)
  }

  return filtered
})

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value

  const search = userSearch.value.toLowerCase()
  return users.value.filter(user =>
    user.username.toLowerCase().includes(search) ||
    user.display_name?.toLowerCase().includes(search) ||
    user.email?.toLowerCase().includes(search)
  )
})

// AI生成项目相关方法
const startAIGenerate = async () => {
  if (!aiForm.text.trim()) {
    ElMessage.warning('请输入项目描述')
    return
  }

  aiGenerateStep.value = 1
  aiProgress.value = 0

  // 模拟进度更新
  const progressInterval = setInterval(() => {
    aiProgress.value += 10
    if (aiProgress.value >= 90) {
      clearInterval(progressInterval)
    }
  }, 200)

  try {
    const response = await axios.post('/api/projects/ai-generate', {
      text: aiForm.text,
      language: aiForm.language
    })

    if (response.data.project) {
      generatedProject.value = response.data.project
      aiProgress.value = 100

      setTimeout(() => {
        aiGenerateStep.value = 2
        clearInterval(progressInterval)
      }, 500)
    }

    ElMessage.success('AI项目生成成功！')
  } catch (error) {
    console.error('AI生成失败:', error)
    ElMessage.error(error.response?.data?.message || 'AI生成失败，请稍后重试')
    aiGenerateStep.value = 0
    clearInterval(progressInterval)
  }
}

const saveAIGeneratedProject = async () => {
  try {
    const response = await axios.post('/api/projects', generatedProject.value)

    if (response.data.project) {
      ElMessage.success('项目创建成功！')
      closeAIGenerate()
      await fetchProjects() // 刷新项目列表
    }
  } catch (error) {
    console.error('保存项目失败:', error)
    ElMessage.error(error.response?.data?.message || '保存项目失败')
  }
}

const closeAIGenerate = () => {
  showAIGenerate.value = false
  aiGenerateStep.value = 0
  aiProgress.value = 0
  aiForm.text = ''
  aiForm.language = 'zh'
  generatedProject.value = {}
}

// 状态和优先级相关方法
const getStatusText = (status) => {
  const statusMap = {
    'idea': '构思中',
    'planning': '规划中',
    'development': '开发中',
    'testing': '测试中',
    'deployed': '已部署',
    'completed': '已完成',
    'paused': '暂停中'
  }
  return statusMap[status] || status
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
    'low': '低优先级',
    'medium': '中优先级',
    'high': '高优先级',
    'critical': '紧急'
  }
  return priorityMap[priority] || priority
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

// 方法
const fetchStats = async () => {
  try {
    const response = await axios.get('/api/admin/stats')
    Object.assign(stats, response.data)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchProjects = async () => {
  try {
    projectsLoading.value = true
    const response = await axios.get('/api/projects', {
      params: { limit: 1000 }
    })
    projects.value = response.data.projects
  } catch (error) {
    console.error('获取项目列表失败:', error)
    ElMessage.error('获取项目列表失败')
  } finally {
    projectsLoading.value = false
  }
}

const fetchUsers = async () => {
  try {
    usersLoading.value = true
    isLoadingUsers.value = true // 设置加载标记
    const response = await axios.get('/api/admin/users')

    // 确保is_admin字段为布尔值（兼容性处理）
    users.value = response.data.users.map(user => ({
      ...user,
      is_admin: Boolean(user.is_admin)
    }))
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    usersLoading.value = false
    // 延迟重置标记，确保数据已完全加载并渲染
    setTimeout(() => {
      isLoadingUsers.value = false
    }, 100)
  }
}

const fetchComments = async () => {
  try {
    commentsLoading.value = true
    const response = await axios.get('/api/admin/comments')
    comments.value = response.data.comments
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
  } finally {
    commentsLoading.value = false
  }
}

const handleProjectSearch = () => {
  // 搜索逻辑在计算属性中处理
}

const handleProjectFilter = () => {
  // 筛选逻辑在计算属性中处理
}

const handleUserSearch = () => {
  // 搜索逻辑在计算属性中处理
}

const handleProjectSelectionChange = (selection) => {
  selectedProjects.value = selection
}

const editProject = async (project = null) => {
  if (project) {
    try {
      // 获取完整的项目数据（包含详细内容）
      const response = await axios.get(`/api/projects/${project.id}`)
      editingProject.value = response.data
    } catch (error) {
      console.error('获取项目详情失败:', error)
      ElMessage.error('获取项目详情失败，请重试')
      return
    }
  } else {
    editingProject.value = null
  }
  showCreateProject.value = true
}

const viewProject = (id) => {
  router.push(`/project/${id}`)
}

const deleteProject = async (project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.title}" 吗？此操作不可恢复。`,
      '删除项目',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await axios.delete(`/api/projects/${project.id}`)

    // 从列表中移除项目
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value.splice(index, 1)
    }

    ElMessage.success('项目删除成功')
    await fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error)
      ElMessage.error(error.response?.data?.message || '删除项目失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedProjects.value.length === 0) {
    ElMessage.warning('请选择要删除的项目')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedProjects.value.length} 个项目吗？此操作不可恢复。`,
      '批量删除项目',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    const projectIds = selectedProjects.value.map(p => p.id)
    await axios.delete('/api/admin/projects/batch', {
      data: { ids: projectIds }
    })

    // 从列表中移除已删除的项目
    projects.value = projects.value.filter(p => !projectIds.includes(p.id))
    selectedProjects.value = []

    ElMessage.success('批量删除成功')
    await fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }
}

const exportProjects = async () => {
  try {
    const response = await axios.get('/api/admin/export/projects', {
      responseType: 'blob'
    })

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `projects_export_${dayjs().format('YYYY-MM-DD')}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败')
  }
}

const updateUserAdmin = async (user) => {
  // 如果正在加载用户数据，不执行更新操作
  if (isLoadingUsers.value) {
    return
  }

  try {
    await axios.put(`/api/admin/users/${user.id}/admin`, {
      is_admin: user.is_admin
    })

    ElMessage.success(`${user.is_admin ? '授予' : '取消'}管理员权限成功`)
  } catch (error) {
    console.error('更新用户权限失败:', error)
    ElMessage.error('更新用户权限失败')
    // 恢复原值
    user.is_admin = !user.is_admin
  }
}

const deleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？此操作不可恢复。',
      '删除评论',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await axios.delete(`/api/admin/comments/${comment.id}`)

    // 从列表中移除评论
    const index = comments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      comments.value.splice(index, 1)
    }

    ElMessage.success('评论删除成功')
    await fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error(error.response?.data?.message || '删除评论失败')
    }
  }
}

const handleProjectSaved = async (project) => {
  if (editingProject.value) {
    // 更新现有项目
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = { ...project }
    }
  } else {
    // 添加新项目
    projects.value.unshift(project)
  }

  showCreateProject.value = false
  editingProject.value = null
  await fetchStats()
}

const getStatusName = (status) => {
  const names = {
    idea: '构思中',
    planning: '规划中',
    development: '开发中',
    testing: '测试中',
    deployed: '已部署',
    completed: '已完成',
    paused: '暂停中'
  }
  return names[status] || '未知'
}

const getPriorityName = (priority) => {
  const names = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急'
  }
  return names[priority] || '中'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 检查评论是否有附件
const hasAttachments = (comment) => {
  if (!comment.attachments) return false
  return (comment.attachments.images && comment.attachments.images.length > 0) ||
         (comment.attachments.videos && comment.attachments.videos.length > 0)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 用户管理相关方法
const getProviderName = (user) => {
  if (user.password_hash) return '本地账户'
  if (user.github_id) return 'GitHub'
  if (user.google_id) return 'Google'
  if (user.wechat_id) return '微信'
  return '未知'
}

const getProviderTagType = (user) => {
  if (user.password_hash) return ''
  if (user.github_id) return 'success'
  if (user.google_id) return 'warning'
  if (user.wechat_id) return 'success'
  return 'info'
}

const isLocalUser = (user) => {
  return Boolean(user.password_hash)
}

const resetUserPassword = async (user) => {
  try {
    await ElMessageBox.prompt(
      '请输入新密码（至少6位）：',
      `重置用户 ${user.username} 的密码`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputValidator: (value) => {
          if (!value || value.length < 6) {
            return '密码长度至少6位'
          }
          return true
        }
      }
    )
    .then(async ({ value }) => {
      await axios.put(`/api/admin/users/${user.id}/password`, {
        new_password: value
      })
      ElMessage.success('密码重置成功')
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error(error.response?.data?.message || '重置密码失败')
    }
  }
}

const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
      '删除用户',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await axios.delete(`/api/admin/users/${user.id}`)

    // 从列表中移除用户
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }

    ElMessage.success('用户删除成功')
    await fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(error.response?.data?.message || '删除用户失败')
    }
  }
}

// 站点配置相关方法
const loadSiteConfig = async () => {
  try {
    configLoading.value = true
    const response = await axios.get('/api/config')
    siteConfig.value = response.data.configs
  } catch (error) {
    console.error('获取站点配置失败:', error)
    ElMessage.error('获取站点配置失败')
  } finally {
    configLoading.value = false
  }
}

const updateConfig = async (key, value) => {
  try {
    await axios.put(`/api/config/${key}`, { value })
    ElMessage.success('配置更新成功')
  } catch (error) {
    console.error('更新配置失败:', error)
    ElMessage.error('更新配置失败')
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
    ElMessage.success('所有配置保存成功')
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  }
}

const beforeQRUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
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
      ElMessage.success('二维码上传成功')
    }
    reader.readAsDataURL(uploadFile.file)
  } catch (error) {
    console.error('上传二维码失败:', error)
    ElMessage.error('上传二维码失败')
  }
}

// 生命周期
onMounted(async () => {
  // 获取数据
  await Promise.all([
    fetchStats(),
    fetchProjects(),
    fetchUsers(),
    fetchComments(),
    loadSiteConfig()
  ])

  // 检查是否有编辑项目的查询参数
  if (route.query.edit) {
    const projectId = parseInt(route.query.edit)
    await nextTick()
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      await editProject(project)
    }
  }
})
</script>

<style lang="scss" scoped>
.admin-page {
  min-height: calc(100vh - 70px);
  background: var(--ai-bg-secondary);

  .container {
    padding: 40px 20px;
    max-width: 1400px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;

    .header-content {
      .page-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 8px;
        color: var(--ai-text-primary);
      }

      .page-subtitle {
        font-size: 1.125rem;
        color: var(--ai-text-secondary);
        margin: 0;
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .page-title {
        font-size: 2rem !important;
      }
    }
  }

  .stats-section {
    margin-bottom: 32px;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;

      .stat-card {
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.projects {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
          }

          &.users {
            background: linear-gradient(135deg, #f093fb, #f5576c);
            color: white;
          }

          &.comments {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            color: white;
          }

          &.progress {
            background: linear-gradient(135deg, #43e97b, #38f9d7);
            color: white;
          }
        }

        .stat-info {
          .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--ai-text-primary);
            line-height: 1;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 0.875rem;
            color: var(--ai-text-secondary);
          }
        }
      }
    }
  }

  .content-layout {
    .main-content {
      .admin-tabs {
        background: var(--ai-bg-primary);
        border-radius: 12px;
        padding: 24px;
        border: 1px solid var(--ai-border);

        .tab-content {
          margin-top: 20px;
        }
      }
    }
  }

  .projects-toolbar,
  .users-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .toolbar-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      gap: 12px;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 12px;

      .toolbar-left,
      .toolbar-right {
        width: 100%;
        justify-content: center;
      }
    }
  }

  .projects-table-container,
  .users-table-container,
  .comments-table-container {
    background: var(--ai-bg-primary);
    border-radius: 8px;
    overflow: hidden;

    .project-title-cell {
      .project-desc {
        font-size: 0.875rem;
        color: var(--ai-text-secondary);
        margin: 4px 0 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .comment-content {
      max-width: 300px;
      line-height: 1.5;

      .text-content {
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .attachments-preview {
        .attachment-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-bottom: 6px;
        }

        .images-preview {
          margin-bottom: 8px;

          .images-grid {
            display: flex;
            gap: 6px;
            align-items: center;

            .preview-image {
              width: 40px;
              height: 40px;
              border-radius: 4px;
              border: 1px solid var(--el-border-color-lighter);
            }

            .more-images {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              background: var(--el-bg-color-page);
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px solid var(--el-border-color-lighter);
            }
          }
        }

        .videos-preview {
          .videos-list {
            .video-item {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 4px;

              .file-size {
                font-size: 12px;
                color: var(--el-text-color-secondary);
              }
            }
          }
        }
      }
    }
  }

  // 站点配置样式
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
}
/* AI生成对话框样式 */
.ai-generate-container {
  padding: 20px 0;
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
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.examples-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
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
  margin-top: 20px;
}

.project-card {
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.project-details {
  padding: 16px 0;
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
