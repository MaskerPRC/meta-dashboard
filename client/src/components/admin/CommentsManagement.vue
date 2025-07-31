<template>
  <div class="tab-content">
    <div class="comments-table-container">
      <el-table
        :data="comments"
        style="width: 100%"
        v-loading="commentsLoading"
        :empty-text="t('admin.comments.empty_text')"
      >
        <el-table-column prop="id" :label="t('admin.comments.table_headers.id')" width="80" />

        <el-table-column prop="project.title" :label="t('admin.comments.table_headers.project')" min-width="150">
          <template #default="scope">
            <el-link @click="viewProject(scope.row.project.id)" type="primary">
              {{ scope.row.project.title }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="user.username" :label="t('admin.comments.table_headers.user')" width="120" />

        <el-table-column prop="content" :label="t('admin.comments.table_headers.content')" min-width="300">
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
                    {{ t('admin.comments.attachment_labels.images') }} ({{ scope.row.attachments.images.length }})
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
                    {{ t('admin.comments.attachment_labels.videos') }} ({{ scope.row.attachments.videos.length }})
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

        <el-table-column :label="t('admin.comments.table_headers.validity_status')" width="150">
          <template #default="scope">
            <div class="validity-status">
              <el-tag 
                :type="getValidityTagType(scope.row.validity_status)"
                size="small"
              >
                {{ getValidityStatusText(scope.row.validity_status) }}
              </el-tag>
              <div v-if="scope.row.validity_score !== null" class="validity-score">
                分数: {{ scope.row.validity_score }}
              </div>
              <el-tooltip 
                v-if="scope.row.validity_reason" 
                :content="scope.row.validity_reason"
                placement="top"
              >
                <el-icon class="info-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" :label="t('admin.comments.table_headers.created_at')" width="120">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column :label="t('admin.comments.table_headers.actions')" width="150">
          <template #default="scope">
            <el-button
              size="small"
              type="warning"
              @click="revalidateComment(scope.row)"
              :loading="scope.row.revalidating"
            >
              {{ t('admin.comments.actions.revalidate') }}
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteComment(scope.row)"
            >
              {{ t('admin.comments.actions.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { showNotification } from '../../utils/notification'
import { Picture, VideoPlay, InfoFilled } from '@element-plus/icons-vue'
import axios from '../../utils/axios'
import dayjs from 'dayjs'

const router = useRouter()
const { t } = useI18n()

// 响应式数据
const comments = ref([])
const commentsLoading = ref(false)

// 事件定义
const emit = defineEmits(['stats-updated'])

// 方法
const fetchComments = async () => {
  try {
    commentsLoading.value = true
    const response = await axios.get('/api/admin/comments')
    comments.value = response.data.comments
  } catch (error) {
    console.error('获取评论列表失败:', error)
    showNotification.error(t('admin.comments.messages.fetch_failed'))
  } finally {
    commentsLoading.value = false
  }
}

const deleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm(
      t('admin.comments.messages.delete_confirm'),
      t('admin.comments.messages.delete_title'),
      {
        confirmButtonText: t('admin.comments.actions.delete'),
        cancelButtonText: t('form.cancel'),
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

    showNotification.success(t('admin.comments.messages.delete_success'))
    emit('stats-updated')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      showNotification.error(error.response?.data?.message || t('admin.comments.messages.delete_failed'))
    }
  }
}

const viewProject = (id) => {
  router.push(`/project/${id}`)
}

// 检查评论是否有附件
const hasAttachments = (comment) => {
  if (!comment.attachments) return false
  return (comment.attachments.images && comment.attachments.images.length > 0) ||
         (comment.attachments.videos && comment.attachments.videos.length > 0)
}

// 获取检测状态的标签类型
const getValidityTagType = (status) => {
  switch (status) {
    case 'valid': return 'success'
    case 'invalid': return 'danger'
    case 'pending': return 'info'
    case 'error': return 'warning'
    default: return 'info'
  }
}

// 获取检测状态的文本
const getValidityStatusText = (status) => {
  switch (status) {
    case 'valid': return '有效'
    case 'invalid': return '无效'
    case 'pending': return '待检测'
    case 'error': return '检测错误'
    default: return '未知'
  }
}

// 重新检测评论
const revalidateComment = async (comment) => {
  try {
    comment.revalidating = true
    const response = await axios.post(`/api/admin/comments/${comment.id}/revalidate`)
    
    // 更新评论的检测结果
    Object.assign(comment, {
      validity_status: response.data.validation.status,
      validity_score: response.data.validation.score,
      validity_reason: response.data.validation.reason,
      checked_at: response.data.validation.checked_at
    })
    
    showNotification.success('重新检测完成')
  } catch (error) {
    console.error('重新检测失败:', error)
    showNotification.error('重新检测失败: ' + (error.response?.data?.message || error.message))
  } finally {
    comment.revalidating = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDateTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 暴露方法供父组件调用
defineExpose({
  fetchComments
})

// 生命周期
onMounted(fetchComments)
</script>

<style lang="scss" scoped>
.comments-table-container {
  background: var(--ai-bg-primary);
  border-radius: 8px;
  overflow: hidden;

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

  .validity-status {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;

    .validity-score {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .info-icon {
      color: var(--el-color-info);
      cursor: help;
      font-size: 14px;
    }
  }
}
</style> 