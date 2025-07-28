<template>
  <div class="comments-section ai-card">
    <div class="comments-header">
      <h3 class="comments-title">
        <el-icon><ChatLineSquare /></el-icon>
        项目讨论 ({{ comments.length }})
      </h3>
    </div>

    <!-- 评论输入框 -->
    <CommentForm 
      v-if="authStore.isAuthenticated"
      v-model="newComment"
      :submitting="submitting"
      @submit="submitComment"
    />

    <!-- 登录提示 -->
    <div v-else class="login-hint">
      <el-icon><User /></el-icon>
      <span>请先<router-link to="/login">登录</router-link>后参与讨论</span>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="comments.length === 0" class="empty-comments">
        <el-icon><ChatDotSquare /></el-icon>
        <p>暂无评论，来发表第一条评论吧！</p>
      </div>

      <div v-else>
        <div 
          v-for="comment in comments" 
          :key="comment.id" 
          class="comment-item"
        >
          <div class="comment-avatar">
            <el-avatar :src="comment.user.avatar_url" :size="40">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>

          <div class="comment-content">
            <div class="comment-header">
              <span class="username">{{ comment.user.username }}</span>
              
              <!-- 评论有效性状态 (仅管理员可见) -->
              <el-tag 
                v-if="isAdmin && comment.validity_status && comment.validity_status !== 'pending'"
                :type="getValidityTagType(comment.validity_status)"
                size="small"
                class="validity-tag"
              >
                {{ getValidityStatusText(comment.validity_status) }}
              </el-tag>
              
              <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
              
              <!-- 操作菜单 -->
              <el-dropdown 
                v-if="canManageComment(comment)"
                trigger="click" 
                placement="bottom-end"
                @command="handleCommentAction"
              >
                <el-button size="small" text circle>
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

            <!-- 评论内容显示/编辑 -->
            <div v-if="editingComment !== comment.id" class="comment-body">
              <div 
                class="comment-text"
                v-html="renderMarkdown(comment.content)"
              ></div>
              
              <!-- 评论附件 -->
              <AttachmentPreview 
                v-if="hasCommentAttachments(comment)"
                :attachments="comment.attachments"
                readonly
              />
            </div>

            <!-- 编辑模式 -->
            <div v-else class="edit-mode">
                             <div class="edit-toolbar">
                 <el-button-group size="small">
                   <el-button 
                     :type="editEditMode === 'write' ? 'primary' : ''" 
                     @click="editEditMode = 'write'"
                   >
                     <el-icon><Edit /></el-icon>
                     {{ t('comment.write') }}
                   </el-button>
                   <el-button 
                     :type="editEditMode === 'preview' ? 'primary' : ''" 
                     @click="editEditMode = 'preview'"
                     :disabled="!editContent.trim()"
                   >
                     <el-icon><View /></el-icon>
                     {{ t('comment.preview') }}
                   </el-button>
                 </el-button-group>
               </div>
              
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
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from '../../utils/axios'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import CommentForm from './CommentForm.vue'
import AttachmentPreview from './AttachmentPreview.vue'
import {
  ChatLineSquare, User, ChatDotSquare, MoreFilled, 
  Edit, Delete, View
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
const { t } = useI18n()

// 计算属性
const isAdmin = computed(() => authStore.isAdmin)

// 响应式数据
const comments = ref([])
const loading = ref(false)
const submitting = ref(false)
const saving = ref(false)
const newComment = ref('')
const editingComment = ref(null)
const editContent = ref('')
const currentPage = ref(1)
const editEditMode = ref('write')

const pagination = reactive({
  total: 0,
  limit: 20,
  page: 1
})

// 计算属性
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
  
  const commentTime = dayjs(comment.created_at)
  const now = dayjs()
  return now.diff(commentTime, 'minute') <= 30
}

// 方法
const renderMarkdown = (content) => {
  if (!content) return ''
  
  try {
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

// 获取检测状态的标签类型
const getValidityTagType = (status) => {
  switch (status) {
    case 'valid': return 'success'
    case 'invalid': return 'warning'  // 客户端用warning，避免太刺眼
    case 'error': return 'info'
    default: return 'info'
  }
}

// 获取检测状态的文本
const getValidityStatusText = (status) => {
  switch (status) {
    case 'valid': return '✓ 有价值'
    case 'invalid': return '! 待改进'
    case 'error': return '检测异常'
    default: return ''
  }
}

const formatTime = (time) => {
  return dayjs(time).fromNow()
}

const hasCommentAttachments = (comment) => {
  if (!comment.attachments) return false
  return (comment.attachments.images && comment.attachments.images.length > 0) ||
         (comment.attachments.videos && comment.attachments.videos.length > 0)
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

const submitComment = async (data) => {
  try {
    submitting.value = true
    const response = await axios.post('/api/comments', {
      project_id: props.projectId,
      content: data.content,
      attachments: data.attachments
    })
    
    comments.value.unshift(response.data.comment)
    newComment.value = ''
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
  editEditMode.value = 'write'
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
    
    const index = comments.value.findIndex(c => c.id === commentId)
    if (index !== -1) {
      comments.value[index] = response.data.comment
    }
    
    cancelEdit()
    ElMessage.success('评论修改成功')
  } catch (error) {
    console.error('修改评论失败:', error)
    ElMessage.error(error.response?.data?.message || '修改评论失败')
  } finally {
    saving.value = false
  }
}

const deleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？此操作无法撤销。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await axios.delete(`/api/comments/${comment.id}`)
    
    const index = comments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      comments.value.splice(index, 1)
      pagination.total--
    }
    
    ElMessage.success('评论删除成功')
  } catch (error) {
    if (error === 'cancel') return
    console.error('删除评论失败:', error)
    ElMessage.error(error.response?.data?.message || '删除评论失败')
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchComments()
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
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
      
      .el-icon {
        color: var(--el-color-primary);
      }
    }
  }
  
  .login-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 24px;
    background: var(--el-bg-color-page);
    border: 1px dashed var(--el-border-color);
    border-radius: 8px;
    color: var(--el-text-color-secondary);
    margin-bottom: 32px;
    
    a {
      color: var(--el-color-primary);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .comments-list {
    .loading-container {
      padding: 20px 0;
    }
    
    .empty-comments {
      text-align: center;
      padding: 60px 20px;
      color: var(--el-text-color-secondary);
      
      .el-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      p {
        font-size: 16px;
        margin: 0;
      }
    }
    
    .comment-item {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
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
          
          .username {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
          
          .validity-tag {
            font-size: 10px;
            margin-left: 8px;
          }
          
          .comment-time {
            color: var(--el-text-color-secondary);
            font-size: 12px;
          }
          
          .el-dropdown {
            margin-left: auto;
          }
        }
        
        .comment-body {
          .comment-text {
            color: var(--el-text-color-regular);
            line-height: 1.6;
            margin-bottom: 12px;
            
            :deep(p) {
              margin: 0 0 8px 0;
              
              &:last-child {
                margin-bottom: 0;
              }
            }
            
            :deep(pre) {
              background: var(--el-bg-color-page);
              padding: 12px;
              border-radius: 4px;
              overflow-x: auto;
              margin: 8px 0;
            }
            
            :deep(code) {
              background: var(--el-bg-color-page);
              padding: 2px 4px;
              border-radius: 2px;
              font-size: 0.9em;
            }
            
            :deep(blockquote) {
              border-left: 4px solid var(--el-color-primary);
              padding-left: 12px;
              margin: 8px 0;
              color: var(--el-text-color-secondary);
            }
          }
        }
        
        .edit-mode {
          .edit-toolbar {
            margin-bottom: 12px;
          }
          
          .edit-container {
            margin-bottom: 12px;
            
            .edit-preview {
              min-height: 100px;
              padding: 12px;
              border: 1px solid var(--el-border-color);
              border-radius: 4px;
              background-color: var(--el-bg-color-page);
              
              .preview-empty {
                color: var(--el-text-color-placeholder);
                text-align: center;
                margin: 20px 0;
              }
            }
          }
          
          .edit-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          }
        }
      }
    }
  }
  
  .comments-pagination {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }
}

:deep(.danger-item) {
  color: var(--el-color-danger) !important;
}
</style> 