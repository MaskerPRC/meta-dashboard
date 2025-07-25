<template>
  <div class="comments-section ai-card">
    <div class="comments-header">
      <h3 class="comments-title">
        <el-icon><ChatLineSquare /></el-icon>
        项目讨论 ({{ comments.length }})
      </h3>
    </div>

    <!-- 评论输入框 -->
    <div v-if="authStore.isAuthenticated" class="comment-form">
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
                编写
              </el-button>
              <el-button 
                :type="editMode === 'preview' ? 'primary' : ''" 
                size="small"
                @click="editMode = 'preview'"
                :disabled="!newComment.trim()"
              >
                <el-icon><View /></el-icon>
                预览
              </el-button>
            </el-button-group>
          </div>
          <div class="toolbar-right">
            <el-dropdown trigger="click" placement="bottom-end">
              <el-button size="small" text>
                <el-icon><QuestionFilled /></el-icon>
                Markdown语法
              </el-button>
              <template #dropdown>
                <el-dropdown-menu class="markdown-help">
                  <div class="help-content">
                    <div class="help-item">
                      <code>**粗体**</code> → <strong>粗体</strong>
                    </div>
                    <div class="help-item">
                      <code>*斜体*</code> → <em>斜体</em>
                    </div>
                    <div class="help-item">
                      <code>`代码`</code> → <code>代码</code>
                    </div>
                    <div class="help-item">
                      <code>```代码块```</code>
                    </div>
                    <div class="help-item">
                      <code>[链接](URL)</code>
                    </div>
                    <div class="help-item">
                      <code>- 列表项</code>
                    </div>
                    <div class="help-item">
                      <code>&gt; 引用</code>
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
            v-model="newComment"
            type="textarea"
            :rows="5"
            placeholder="支持Markdown语法，分享您对这个AI项目的想法、建议或疑问..."
            maxlength="1000"
            show-word-limit
            resize="none"
            class="markdown-input"
          />
          
          <!-- 预览区域 -->
          <div 
            v-show="editMode === 'preview'" 
            class="markdown-preview"
            v-html="previewContent"
          ></div>
        </div>

        <div class="form-actions">
          <el-button 
            type="primary" 
            @click="submitComment"
            :loading="submitting"
            :disabled="!newComment.trim()"
          >
            <el-icon><ChatDotSquare /></el-icon>
            发表评论
          </el-button>
        </div>
      </div>
    </div>

    <!-- 未登录提示 -->
    <div v-else class="login-prompt">
      <el-alert
        title="登录后参与讨论"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <p>登录后可以评论和参与项目讨论</p>
          <el-button type="primary" size="small" @click="$router.push('/login')">
            立即登录
          </el-button>
        </template>
      </el-alert>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="comments.length === 0" class="empty-comments">
        <el-empty description="暂无评论，来发表第一条评论吧！" />
      </div>
      
      <div v-else>
        <div 
          v-for="comment in comments" 
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-avatar">
            <el-avatar :src="comment.user.avatar_url" :size="36">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">{{ comment.user.display_name || comment.user.username }}</span>
              <span class="comment-time">{{ formatCommentTime(comment.created_at) }}</span>
              
              <!-- 评论操作菜单 -->
              <el-dropdown 
                v-if="canManageComment(comment)"
                trigger="click"
                @command="handleCommentAction"
                class="comment-actions"
              >
                <el-button text size="small">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item 
                      v-if="canEditComment(comment)"
                      :command="`edit-${comment.id}`"
                    >
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :command="`delete-${comment.id}`"
                      class="danger-item"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            
            <!-- 评论正文 -->
            <div v-if="editingComment !== comment.id" class="comment-text">
              <div class="markdown-content" v-html="renderMarkdown(comment.content)"></div>
            </div>
            
            <!-- 编辑状态 -->
            <div v-else class="comment-edit">
              <!-- 编辑工具栏 -->
              <div class="edit-toolbar">
                <el-button-group size="small">
                  <el-button 
                    :type="editEditMode === 'write' ? 'primary' : ''" 
                    @click="editEditMode = 'write'"
                  >
                    <el-icon><Edit /></el-icon>
                    编写
                  </el-button>
                  <el-button 
                    :type="editEditMode === 'preview' ? 'primary' : ''" 
                    @click="editEditMode = 'preview'"
                    :disabled="!editContent.trim()"
                  >
                    <el-icon><View /></el-icon>
                    预览
                  </el-button>
                </el-button-group>
              </div>

              <!-- 编辑区域 -->
              <div class="edit-container">
                <el-input
                  v-show="editEditMode === 'write'"
                  v-model="editContent"
                  type="textarea"
                  :rows="4"
                  maxlength="1000"
                  show-word-limit
                  resize="none"
                  placeholder="支持Markdown语法..."
                />
                
                <!-- 编辑预览 -->
                <div 
                  v-show="editEditMode === 'preview'" 
                  class="edit-preview"
                  v-html="editPreviewContent"
                ></div>
              </div>

              <div class="edit-actions">
                <el-button size="small" @click="cancelEdit">取消</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="saveEdit(comment.id)"
                  :loading="saving"
                >
                  保存
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > pagination.limit" class="comments-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pagination.limit"
        :total="pagination.total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from '../../utils/axios'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import {
  ChatLineSquare, User, ChatDotSquare, MoreFilled, 
  Edit, Delete, View, QuestionFilled
} from '@element-plus/icons-vue'

// 启用相对时间插件
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (__) {}
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true
  }
})

const authStore = useAuthStore()

// 响应式数据
const comments = ref([])
const loading = ref(false)
const submitting = ref(false)
const saving = ref(false)
const newComment = ref('')
const editingComment = ref(null)
const editContent = ref('')
const currentPage = ref(1)

// Markdown 编辑相关状态
const editMode = ref('write') // 'write' | 'preview'
const editEditMode = ref('write') // 编辑评论时的模式

const pagination = reactive({
  total: 0,
  limit: 20,
  page: 1
})

// 计算属性
const previewContent = computed(() => {
  if (!newComment.value.trim()) return '<p class="preview-empty">暂无内容</p>'
  return renderMarkdown(newComment.value)
})

const editPreviewContent = computed(() => {
  if (!editContent.value.trim()) return '<p class="preview-empty">暂无内容</p>'
  return renderMarkdown(editContent.value)
})

const canManageComment = (comment) => {
  return authStore.isAuthenticated && (
    authStore.isAdmin || 
    comment.user.id === authStore.user?.id
  )
}

const canEditComment = (comment) => {
  if (!authStore.isAuthenticated) return false
  if (authStore.isAdmin) return true
  if (comment.user.id !== authStore.user?.id) return false
  
  // 评论发布30分钟内可以编辑
  const commentTime = dayjs(comment.created_at)
  const now = dayjs()
  return now.diff(commentTime, 'minute') <= 30
}

// 方法
const renderMarkdown = (content) => {
  if (!content) return ''
  
  try {
    // 基本的安全过滤，防止XSS
    const sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    
    return marked(sanitized)
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return content
  }
}

const fetchComments = async () => {
  try {
    loading.value = true
    const response = await axios.get(`/api/comments/project/${props.projectId}`, {
      params: {
        page: currentPage.value,
        limit: pagination.limit
      }
    })
    
    comments.value = response.data.comments
    pagination.total = response.data.pagination.total
    pagination.page = response.data.pagination.page
  } catch (error) {
    console.error('获取评论失败:', error)
    ElMessage.error('获取评论失败')
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  
  try {
    submitting.value = true
    const response = await axios.post('/api/comments', {
      project_id: props.projectId,
      content: newComment.value.trim()
    })
    
    // 添加新评论到列表顶部
    comments.value.unshift(response.data.comment)
    newComment.value = ''
    editMode.value = 'write' // 重置编辑模式
    pagination.total++
    
    ElMessage.success('评论发表成功')
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error(error.response?.data?.message || '发表评论失败')
  } finally {
    submitting.value = false
  }
}

const handleCommentAction = (command) => {
  const [action, commentId] = command.split('-')
  const comment = comments.value.find(c => c.id === parseInt(commentId))
  
  if (action === 'edit') {
    startEdit(comment)
  } else if (action === 'delete') {
    deleteComment(comment)
  }
}

const startEdit = (comment) => {
  editingComment.value = comment.id
  editContent.value = comment.content
  editEditMode.value = 'write' // 重置编辑模式
}

const cancelEdit = () => {
  editingComment.value = null
  editContent.value = ''
  editEditMode.value = 'write'
}

const saveEdit = async (commentId) => {
  if (!editContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  
  try {
    saving.value = true
    const response = await axios.put(`/api/comments/${commentId}`, {
      content: editContent.value.trim()
    })
    
    // 更新评论内容
    const comment = comments.value.find(c => c.id === commentId)
    if (comment) {
      comment.content = response.data.comment.content
    }
    
    editingComment.value = null
    editContent.value = ''
    ElMessage.success('评论更新成功')
  } catch (error) {
    console.error('更新评论失败:', error)
    ElMessage.error(error.response?.data?.message || '更新评论失败')
  } finally {
    saving.value = false
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
    
    await axios.delete(`/api/comments/${comment.id}`)
    
    // 从列表中移除评论
    const index = comments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      comments.value.splice(index, 1)
      pagination.total--
    }
    
    ElMessage.success('评论删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error(error.response?.data?.message || '删除评论失败')
    }
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchComments()
}

const formatCommentTime = (time) => {
  const commentTime = dayjs(time)
  const now = dayjs()
  
  if (now.diff(commentTime, 'day') < 7) {
    return commentTime.fromNow()
  } else {
    return commentTime.format('YYYY-MM-DD HH:mm')
  }
}

// 生命周期
onMounted(() => {
  fetchComments()
})
</script>

<style lang="scss" scoped>
.comments-section {
  padding: 32px;
  
  .comments-header {
    margin-bottom: 24px;
    
    .comments-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: var(--ai-text-primary);
    }
  }
  
  .comment-form {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
    
    .user-avatar {
      flex-shrink: 0;
    }
    
    .form-content {
      flex: 1;
      
      .editor-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding: 8px 12px;
        background: var(--el-bg-color-page);
        border: 1px solid var(--el-border-color);
        border-radius: 6px 6px 0 0;
        border-bottom: none;
        
        .toolbar-left {
          display: flex;
          align-items: center;
        }
        
        .toolbar-right {
          display: flex;
          align-items: center;
        }
      }
      
      .editor-container {
        position: relative;
        border: 1px solid var(--el-border-color);
        border-radius: 0 0 6px 6px;
        overflow: hidden;
        
        .markdown-input {
          :deep(.el-textarea__inner) {
            border: none;
            border-radius: 0;
            font-family: 'Fira Code', 'Consolas', monospace;
            line-height: 1.6;
          }
        }
        
        .markdown-preview {
          min-height: 120px;
          padding: 12px;
          background: white;
          line-height: 1.6;
          
          .preview-empty {
            color: var(--el-text-color-placeholder);
            font-style: italic;
            margin: 0;
          }
        }
      }
      
      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
      }
    }
  }
  
  .login-prompt {
    margin-bottom: 32px;
    
    :deep(.el-alert__content) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      p {
        margin: 0;
      }
    }
  }
  
  .comments-list {
    .loading-container {
      padding: 20px 0;
    }
    
    .empty-comments {
      text-align: center;
      padding: 40px 20px;
    }
    
    .comment-item {
      display: flex;
      gap: 12px;
      padding: 20px 0;
      border-bottom: 1px solid var(--ai-border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .comment-avatar {
        flex-shrink: 0;
      }
      
      .comment-content {
        flex: 1;
        
        .comment-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .comment-author {
            font-weight: 600;
            color: var(--ai-text-primary);
          }
          
          .comment-time {
            font-size: 0.875rem;
            color: var(--ai-text-secondary);
          }
          
          .comment-actions {
            margin-left: auto;
          }
        }
        
        .comment-text {
          color: var(--ai-text-primary);
          line-height: 1.6;
          
          .markdown-content {
            line-height: 1.6;
          }
        }
        
        .comment-edit {
          .edit-toolbar {
            margin-bottom: 8px;
          }
          
          .edit-container {
            border: 1px solid var(--el-border-color);
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 12px;
            
            .el-textarea {
              :deep(.el-textarea__inner) {
                border: none;
                border-radius: 0;
                font-family: 'Fira Code', 'Consolas', monospace;
                line-height: 1.6;
              }
            }
            
            .edit-preview {
              min-height: 100px;
              padding: 12px;
              background: white;
              line-height: 1.6;
              
              .preview-empty {
                color: var(--el-text-color-placeholder);
                font-style: italic;
                margin: 0;
              }
            }
          }
          
          .edit-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
          }
        }
      }
    }
  }
  
  .comments-pagination {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--ai-border);
  }
}

// 危险操作样式
:deep(.danger-item) {
  color: var(--el-color-danger);
  
  &:hover {
    background-color: var(--el-color-danger-light-9);
  }
}

// Markdown帮助下拉菜单样式
:deep(.markdown-help) {
  .help-content {
    padding: 12px;
    max-width: 250px;
    
    .help-item {
      margin-bottom: 8px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      code {
        background: var(--el-bg-color-page);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Fira Code', monospace;
        font-size: 11px;
      }
    }
  }
}

// Markdown内容样式
.markdown-content {
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin: 16px 0 8px 0;
    font-weight: 600;
    line-height: 1.25;
  }
  
  :deep(h1) { font-size: 1.5em; }
  :deep(h2) { font-size: 1.3em; }
  :deep(h3) { font-size: 1.1em; }
  :deep(h4) { font-size: 1em; }
  :deep(h5) { font-size: 0.9em; }
  :deep(h6) { font-size: 0.8em; }
  
  :deep(p) {
    margin: 8px 0;
    line-height: 1.6;
  }
  
  :deep(ul), :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
    
    li {
      margin: 4px 0;
    }
  }
  
  :deep(blockquote) {
    margin: 12px 0;
    padding: 8px 16px;
    border-left: 4px solid var(--ai-primary);
    background: var(--el-bg-color-page);
    border-radius: 0 4px 4px 0;
    
    p {
      margin: 0;
      color: var(--el-text-color-regular);
    }
  }
  
  :deep(code) {
    background: var(--el-bg-color-page);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9em;
    color: var(--el-color-danger);
  }
  
  :deep(pre) {
    background: var(--el-bg-color-page);
    padding: 12px;
    border-radius: 6px;
    margin: 12px 0;
    overflow-x: auto;
    border: 1px solid var(--el-border-color-lighter);
    
    code {
      background: none;
      padding: 0;
      color: inherit;
      font-size: 0.9em;
      line-height: 1.5;
    }
  }
  
  :deep(a) {
    color: var(--ai-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  :deep(strong) {
    font-weight: 600;
  }
  
  :deep(em) {
    font-style: italic;
  }
  
  :deep(table) {
    border-collapse: collapse;
    margin: 12px 0;
    width: 100%;
    
    th, td {
      border: 1px solid var(--el-border-color);
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background: var(--el-bg-color-page);
      font-weight: 600;
    }
  }
  
  :deep(hr) {
    border: none;
    border-top: 1px solid var(--el-border-color);
    margin: 16px 0;
  }
  
  // 第一个和最后一个元素的边距调整
  :deep(*:first-child) {
    margin-top: 0;
  }
  
  :deep(*:last-child) {
    margin-bottom: 0;
  }
}
</style> 