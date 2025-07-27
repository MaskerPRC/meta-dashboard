<template>
  <div class="markdown-editor">
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button type="button" @click="insertBold" class="toolbar-btn" title="加粗">
          <i class="fas fa-bold"></i>
        </button>
        <button type="button" @click="insertItalic" class="toolbar-btn" title="斜体">
          <i class="fas fa-italic"></i>
        </button>
        <button type="button" @click="insertHeading" class="toolbar-btn" title="标题">
          <i class="fas fa-heading"></i>
        </button>
        <button type="button" @click="insertLink" class="toolbar-btn" title="链接">
          <i class="fas fa-link"></i>
        </button>
        <button type="button" @click="insertCode" class="toolbar-btn" title="代码">
          <i class="fas fa-code"></i>
        </button>
        <button type="button" @click="insertList" class="toolbar-btn" title="列表">
          <i class="fas fa-list"></i>
        </button>
      </div>
      
      <div class="toolbar-group">
        <button type="button" @click="triggerImageUpload" class="toolbar-btn" title="上传图片">
          <i class="fas fa-image"></i>
        </button>
        <button type="button" @click="triggerVideoUpload" class="toolbar-btn" title="上传视频">
          <i class="fas fa-video"></i>
        </button>
        <input 
          ref="imageInput" 
          type="file" 
          accept="image/*" 
          multiple 
          @change="handleImageUpload" 
          style="display: none"
        />
        <input 
          ref="videoInput" 
          type="file" 
          accept="video/*" 
          @change="handleVideoUpload" 
          style="display: none"
        />
      </div>
      
      <div class="toolbar-group">
        <button 
          type="button" 
          @click="togglePreview" 
          class="toolbar-btn"
          :class="{ active: showPreview }"
          title="预览"
        >
          <i class="fas fa-eye"></i>
        </button>
        <button type="button" @click="toggleFullscreen" class="toolbar-btn" title="全屏">
          <i class="fas fa-expand"></i>
        </button>
      </div>
    </div>
    
    <div class="editor-content" :class="{ fullscreen: isFullscreen }">
      <div class="editor-panes" :class="{ 'preview-mode': showPreview }">
        <div class="editor-pane" v-show="!showPreview || !isMobile">
          <textarea
            ref="textarea"
            v-model="content"
            @input="handleInput"
            @paste="handlePaste"
            @keydown="handleKeydown"
            :placeholder="placeholder"
            class="markdown-textarea"
          ></textarea>
        </div>
        
        <div class="preview-pane" v-show="showPreview">
          <div class="markdown-preview" v-html="renderedContent"></div>
        </div>
      </div>
    </div>
    
    <!-- 上传进度 -->
    <div v-if="uploadProgress.length > 0" class="upload-progress">
      <div 
        v-for="(progress, index) in uploadProgress" 
        :key="index" 
        class="progress-item"
      >
        <span>{{ progress.name }}</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progress.percent + '%' }"
          ></div>
        </div>
        <span>{{ progress.percent }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import axios from '@/utils/axios';

export default {
  name: 'MarkdownEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '在这里输入内容...'
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  emits: ['update:modelValue', 'upload-success', 'upload-error'],
  data() {
    return {
      content: this.modelValue,
      showPreview: false,
      isFullscreen: false,
      uploadProgress: [],
      isMobile: false
    };
  },
  computed: {
    renderedContent() {
      return marked(this.content);
    }
  },
  watch: {
    modelValue(newVal) {
      this.content = newVal;
    },
    content(newVal) {
      this.$emit('update:modelValue', newVal);
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    document.addEventListener('keydown', this.handleGlobalKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    document.removeEventListener('keydown', this.handleGlobalKeydown);
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
    
    handleInput() {
      this.$emit('update:modelValue', this.content);
    },
    
    handleKeydown(e) {
      // Ctrl/Cmd + B = 加粗
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.insertBold();
      }
      // Ctrl/Cmd + I = 斜体
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        this.insertItalic();
      }
      // Tab 键处理
      if (e.key === 'Tab') {
        e.preventDefault();
        this.insertAtCursor('  ');
      }
    },
    
    handleGlobalKeydown(e) {
      // Esc 退出全屏
      if (e.key === 'Escape' && this.isFullscreen) {
        this.toggleFullscreen();
      }
    },
    
    handlePaste(e) {
      const items = e.clipboardData.items;
      
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          this.uploadFile(file, 'image');
        }
      }
    },
    
    insertAtCursor(text) {
      const textarea = this.$refs.textarea;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      this.content = this.content.substring(0, start) + text + this.content.substring(end);
      
      this.$nextTick(() => {
        textarea.setSelectionRange(start + text.length, start + text.length);
        textarea.focus();
      });
    },
    
    wrapSelection(prefix, suffix = '') {
      const textarea = this.$refs.textarea;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = this.content.substring(start, end);
      
      const newText = prefix + selectedText + (suffix || prefix);
      this.content = this.content.substring(0, start) + newText + this.content.substring(end);
      
      this.$nextTick(() => {
        const newStart = start + prefix.length;
        const newEnd = newStart + selectedText.length;
        textarea.setSelectionRange(newStart, newEnd);
        textarea.focus();
      });
    },
    
    insertBold() {
      this.wrapSelection('**');
    },
    
    insertItalic() {
      this.wrapSelection('*');
    },
    
    insertHeading() {
      const textarea = this.$refs.textarea;
      const start = textarea.selectionStart;
      const lineStart = this.content.lastIndexOf('\n', start - 1) + 1;
      
      this.content = this.content.substring(0, lineStart) + '## ' + this.content.substring(lineStart);
      
      this.$nextTick(() => {
        textarea.setSelectionRange(start + 3, start + 3);
        textarea.focus();
      });
    },
    
    insertLink() {
      const url = prompt('请输入链接地址:');
      if (url) {
        const text = prompt('请输入链接文本:', 'Link');
        if (text) {
          this.insertAtCursor(`[${text}](${url})`);
        }
      }
    },
    
    insertCode() {
      this.wrapSelection('`');
    },
    
    insertList() {
      const textarea = this.$refs.textarea;
      const start = textarea.selectionStart;
      const lineStart = this.content.lastIndexOf('\n', start - 1) + 1;
      
      this.content = this.content.substring(0, lineStart) + '- ' + this.content.substring(lineStart);
      
      this.$nextTick(() => {
        textarea.setSelectionRange(start + 2, start + 2);
        textarea.focus();
      });
    },
    
    togglePreview() {
      this.showPreview = !this.showPreview;
    },
    
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      
      if (this.isFullscreen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    
    triggerImageUpload() {
      this.$refs.imageInput.click();
    },
    
    triggerVideoUpload() {
      this.$refs.videoInput.click();
    },
    
    handleImageUpload(e) {
      const files = e.target.files;
      for (let file of files) {
        this.uploadFile(file, 'image');
      }
      e.target.value = '';
    },
    
    handleVideoUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.uploadFile(file, 'video');
      }
      e.target.value = '';
    },
    
    async uploadFile(file, type) {
      const formData = new FormData();
      formData.append('files', file);
      
      // 添加上传进度
      const progressItem = {
        name: file.name,
        percent: 0
      };
      this.uploadProgress.push(progressItem);
      
      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            progressItem.percent = percentCompleted;
          }
        });
        
        if (response.data.data) {
          const { images, videos } = response.data.data;
          
          if (type === 'image' && images.length > 0) {
            const image = images[0];
            this.insertAtCursor(`![${image.filename}](${image.url})\n`);
            this.$emit('upload-success', { type: 'image', file: image });
          } else if (type === 'video' && videos.length > 0) {
            const video = videos[0];
            this.insertAtCursor(`\n<video controls width="100%" style="max-width: 600px;">\n  <source src="${video.url}" type="${video.type}">\n  您的浏览器不支持视频播放。\n</video>\n\n`);
            this.$emit('upload-success', { type: 'video', file: video });
          }
        }
        
      } catch (error) {
        console.error('文件上传失败:', error);
        this.$emit('upload-error', error);
        alert('文件上传失败: ' + (error.response?.data?.message || error.message));
      } finally {
        // 移除进度项
        const index = this.uploadProgress.indexOf(progressItem);
        if (index > -1) {
          this.uploadProgress.splice(index, 1);
        }
      }
    }
  }
};
</script>

<style scoped>
.markdown-editor {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #495057;
  font-size: 14px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #e9ecef;
  color: #212529;
}

.toolbar-btn.active {
  background: #007bff;
  color: white;
}

.editor-content {
  position: relative;
}

.editor-content.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: white;
}

.editor-panes {
  display: flex;
  min-height: v-bind(height);
}

.editor-panes.preview-mode .editor-pane {
  width: 50%;
}

.editor-panes.preview-mode .preview-pane {
  width: 50%;
  border-left: 1px solid #e1e5e9;
}

.editor-pane {
  flex: 1;
}

.markdown-textarea {
  width: 100%;
  height: 100%;
  min-height: v-bind(height);
  border: none;
  outline: none;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: transparent;
}

.preview-pane {
  display: none;
  overflow-y: auto;
  background: #fafbfc;
}

.editor-panes.preview-mode .preview-pane {
  display: block;
}

.markdown-preview {
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  margin: 0 0 16px 0;
  font-weight: 600;
}

.markdown-preview :deep(p) {
  margin: 0 0 16px 0;
}

.markdown-preview :deep(pre) {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 0 0 16px 0;
}

.markdown-preview :deep(code) {
  background: #f6f8fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}

.markdown-preview :deep(video) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}

.upload-progress {
  padding: 12px;
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-panes.preview-mode .editor-pane {
    display: none;
  }
  
  .editor-panes.preview-mode .preview-pane {
    width: 100%;
    border-left: none;
  }
  
  .toolbar-group {
    gap: 2px;
  }
  
  .toolbar-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

/* 全屏模式 */
.editor-content.fullscreen .editor-panes {
  min-height: calc(100vh - 53px); /* 减去工具栏高度 */
}

.editor-content.fullscreen .markdown-textarea {
  min-height: calc(100vh - 53px);
}
</style> 