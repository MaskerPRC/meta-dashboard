<template>
  <div class="attachments-section">
    <div class="attachments-header">
      <span class="attachments-title">{{ $t('comment.attachments') }}</span>
    </div>
    
    <!-- 图片附件 -->
    <div v-if="attachments.images.length > 0" class="attachment-group">
      <div class="attachment-label">
        <el-icon><Picture /></el-icon>
        {{ $t('comment.images') }} ({{ attachments.images.length }})
      </div>
      <div class="images-grid">
        <div 
          v-for="(image, index) in attachments.images" 
          :key="image.id"
          class="attachment-item"
        >
          <el-image
            :src="image.url"
            :preview-src-list="attachments.images.map(img => img.url)"
            class="attachment-image"
            fit="cover"
            preview-teleported
          />
          <div class="attachment-info">
            <span class="filename">{{ image.filename }}</span>
            <span class="filesize">({{ formatFileSize(image.size) }})</span>
          </div>
          <el-button 
            class="remove-btn"
            type="danger" 
            size="small" 
            circle
            @click="$emit('remove', 'images', index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 视频附件 -->
    <div v-if="attachments.videos.length > 0" class="attachment-group">
      <div class="attachment-label">
        <el-icon><VideoPlay /></el-icon>
        {{ $t('comment.videos') }} ({{ attachments.videos.length }})
      </div>
      <div class="videos-list">
        <div 
          v-for="(video, index) in attachments.videos" 
          :key="video.id"
          class="attachment-item video-item"
        >
          <div class="video-preview">
            <video 
              :src="video.url" 
              class="attachment-video"
              controls
              preload="metadata"
            ></video>
          </div>
          <div class="attachment-info">
            <span class="filename">{{ video.filename }}</span>
            <span class="filesize">({{ formatFileSize(video.size) }})</span>
          </div>
          <el-button 
            class="remove-btn"
            type="danger" 
            size="small" 
            circle
            @click="$emit('remove', 'videos', index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Picture, VideoPlay, Delete } from '@element-plus/icons-vue'

defineProps({
  attachments: {
    type: Object,
    required: true,
    default: () => ({ images: [], videos: [] })
  }
})

defineEmits(['remove'])

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>
.attachments-section {
  margin: 16px 0;
  padding: 16px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  
  .attachments-header {
    margin-bottom: 12px;
    
    .attachments-title {
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
  
  .attachment-group {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .attachment-label {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--el-text-color-regular);
      font-weight: 500;
    }
    
    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
    }
    
    .videos-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .attachment-item {
      position: relative;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      overflow: hidden;
      background: white;
      
      &:hover {
        .remove-btn {
          opacity: 1;
        }
      }
      
      .attachment-image {
        width: 100%;
        height: 80px;
        object-fit: cover;
      }
      
      .video-preview {
        .attachment-video {
          width: 100%;
          max-height: 200px;
        }
      }
      
      .attachment-info {
        padding: 8px;
        font-size: 12px;
        
        .filename {
          display: block;
          color: var(--el-text-color-regular);
          margin-bottom: 2px;
          word-break: break-all;
        }
        
        .filesize {
          color: var(--el-text-color-secondary);
        }
      }
      
      .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        opacity: 0;
        transition: opacity 0.2s;
        background: rgba(0, 0, 0, 0.5) !important;
        border: none !important;
        
        .el-icon {
          color: white;
        }
      }
    }
    
    .video-item {
      .attachment-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .filename {
          flex: 1;
          margin-bottom: 0;
          margin-right: 8px;
        }
      }
    }
  }
}
</style> 