<template>
  <div class="project-attachments ai-card">
    <h2>{{ $t('project.attachments.title') }}</h2>

    <!-- 图片展示 -->
    <div v-if="attachments.images.length > 0" class="attachments-section">
      <div class="images-grid">
        <div
          v-for="(image, index) in attachments.images"
          :key="`img-${index}`"
          class="image-item"
          @click="$emit('preview-image', image, index)"
        >
          <img :src="image.url" :alt="image.filename" />
          <div class="image-overlay">
            <span class="caption" :class="{ 'filename-fallback': !image.caption }">
              {{ image.caption || image.filename }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频展示 -->
    <div v-if="attachments.videos.length > 0" class="attachments-section">
      <div class="videos-grid">
        <div
          v-for="(video, index) in attachments.videos"
          :key="`vid-${index}`"
          class="video-item"
        >
          <video
            :src="video.url"
            controls
            preload="metadata"
            :poster="video.poster"
          >
            您的浏览器不支持视频播放。
          </video>
          <div class="video-info">
            <span class="filename">{{ video.filename }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  attachments: {
    type: Object,
    default: () => ({ images: [], videos: [] })
  }
})

defineEmits(['preview-image'])
</script>

<style lang="scss" scoped>
.project-attachments {
  margin-bottom: 24px;
  padding: 32px;

  h2 {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  h3 {
    color: var(--ai-text-secondary);
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
  }

  .attachments-section {
    margin-bottom: 32px;

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .image-item {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      aspect-ratio: 4/3;
      cursor: pointer;
      transition: transform 0.2s ease;
      border: 1px solid var(--ai-border);

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
        padding: 16px 12px 12px;
        color: white;

        .caption {
          font-size: 14px;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          word-break: break-all;

          &.filename-fallback {
            opacity: 0.8;
            font-style: italic;
            font-size: 13px;
          }
        }
      }
    }

    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .video-item {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--ai-border);
      background: var(--ai-bg-secondary);

      video {
        width: 100%;
        height: auto;
        max-height: 300px;
        display: block;
      }

      .video-info {
        padding: 12px 16px;
        background: var(--ai-bg-primary);
        border-top: 1px solid var(--ai-border);

        .filename {
          font-size: 14px;
          color: var(--ai-text-primary);
          font-weight: 500;
          word-break: break-all;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .project-attachments {
    padding: 20px;

    .attachments-section {
      .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }

      .videos-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  }
}
</style>
