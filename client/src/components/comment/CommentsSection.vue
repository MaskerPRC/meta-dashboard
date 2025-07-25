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
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="分享您对这个AI项目的想法、建议或疑问..."
          maxlength="1000"
          show-word-limit
          resize="none"
        />
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
              {{ comment.content }}
            </div>
            
            <!-- 编辑状态 -->
            <div v-else class="comment-edit">
              <el-input
                v-model="editContent"
                type="textarea"
                :rows="3"
                maxlength="1000"
                show-word-limit
                resize="none"
              />
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
import {
  ChatLineSquare, User, ChatDotSquare, MoreFilled, 
  Edit, Delete
} from '@element-plus/icons-vue'

// 启用相对时间插件
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

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

const pagination = reactive({
  total: 0,
  limit: 20,
  page: 1
})

// 计算属性
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
}

const cancelEdit = () => {
  editingComment.value = null
  editContent.value = ''
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
          white-space: pre-wrap;
        }
        
        .comment-edit {
          .edit-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 12px;
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
</style> 