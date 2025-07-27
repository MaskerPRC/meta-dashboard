<template>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, VideoPlay } from '@element-plus/icons-vue'
import axios from '../../utils/axios'
import dayjs from 'dayjs'

const router = useRouter()

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
    ElMessage.error('获取评论列表失败')
  } finally {
    commentsLoading.value = false
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
    emit('stats-updated')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error(error.response?.data?.message || '删除评论失败')
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
}
</style> 