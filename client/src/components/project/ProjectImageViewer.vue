<template>
  <div v-if="show" class="image-viewer-overlay" @click="$emit('close')">
    <div class="image-viewer" @click.stop>
      <!-- 左箭头 -->
      <button 
        v-if="images.length > 1"
        class="image-nav-btn prev-btn" 
        @click="prevImage"
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>

      <!-- 图片容器 -->
      <div class="image-container">
        <img v-if="currentImage" :src="currentImage.url" :alt="currentImage.filename" />
      </div>

      <!-- 右箭头 -->
      <button 
        v-if="images.length > 1"
        class="image-nav-btn next-btn" 
        @click="nextImage"
      >
        <el-icon><ArrowRight /></el-icon>
      </button>

      <!-- 右上角关闭按钮 -->
      <button class="close-btn-top" @click="$emit('close')" title="关闭 (ESC)">
        <el-icon><Close /></el-icon>
      </button>

      <!-- 工具栏 -->
      <div class="image-viewer-toolbar">
        <div class="image-info">
          <span class="image-caption-text">{{ getDisplayName(currentImage) }}</span>
          <span class="image-counter">
            {{ currentImageIndex + 1 }} / {{ images.length }}
          </span>
        </div>
        <div class="toolbar-actions">
          <span class="help-text">ESC 或点击空白处关闭</span>
          <button class="close-btn" @click="$emit('close')" title="关闭">
            <el-icon><Close /></el-icon>
          </button>
        </div>
      </div>
    </div>
  </div>


</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight, Close } from '@element-plus/icons-vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  images: {
    type: Array,
    default: () => []
  },
  initialIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const currentImageIndex = ref(0)

const currentImage = computed(() => {
  if (!props.images?.length) return null
  return props.images[currentImageIndex.value]
})

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = props.images.length - 1
  }
}

const nextImage = () => {
  if (currentImageIndex.value < props.images.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

// 获取显示名称：优先显示caption，否则显示filename
const getDisplayName = (image) => {
  if (!image) return '未命名图片'
  // 在图片查看器中，如果没有caption就显示filename
  return image.caption || image.filename || '未命名图片'
}



// 键盘事件处理
const handleKeydown = (e) => {
  if (!props.show) return
  
  switch (e.key) {
    case 'Escape':
      emit('close')
      break
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

// 监听初始索引变化
watch(() => props.initialIndex, (newIndex) => {
  currentImageIndex.value = newIndex
}, { immediate: true })

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
  backdrop-filter: blur(5px);
}

.image-viewer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90vw;
  height: 90vh;
  cursor: default;

  .image-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: calc(100% - 120px);
    max-height: 100%;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
  }

  .close-btn-top {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    color: white;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 15;
    font-size: 20px;
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }
  }

  .image-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
    color: var(--el-text-color-primary);
    font-size: 18px;

    &:hover {
      background: white;
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    &.prev-btn {
      left: 20px;
    }

    &.next-btn {
      right: 20px;
    }
  }

  .image-viewer-toolbar {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(0, 0, 0, 0.8);
    padding: 12px 20px;
    border-radius: 25px;
    color: white;
    backdrop-filter: blur(10px);
    min-width: 400px;
    max-width: 90vw;

    .image-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .image-caption-text {
        font-size: 14px;
        font-weight: 500;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .image-counter {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .help-text {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        white-space: nowrap;
      }

      .close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .image-viewer {
    width: 95vw;
    height: 95vh;

    .close-btn-top {
      top: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      font-size: 18px;
    }

    .image-container {
      max-width: calc(100% - 40px);
    }

    .image-nav-btn {
      width: 40px;
      height: 40px;
      font-size: 16px;

      &.prev-btn {
        left: 10px;
      }

      &.next-btn {
        right: 10px;
      }
    }

    .image-viewer-toolbar {
      bottom: 10px;
      min-width: calc(100% - 40px);
      max-width: calc(100% - 40px);
      padding: 8px 16px;

      .image-info {
        .image-caption-text {
          max-width: 120px;
        }
      }

      .toolbar-actions {
        .help-text {
          display: none; // 移动端隐藏帮助文字
        }
      }
    }
  }
}


</style>
