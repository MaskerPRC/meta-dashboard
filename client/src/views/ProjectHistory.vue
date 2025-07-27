<template>
  <div class="project-history">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="back-btn">
          <i class="fas fa-arrow-left"></i>
          返回项目详情
        </button>
        <div class="project-info" v-if="project">
          <h1>{{ project.title }} - 进展历史</h1>
          <p class="project-status">
            状态: <span :class="`status-${project.status}`">{{ getStatusText(project.status) }}</span>
            进度: <span class="progress">{{ project.progress }}%</span>
          </p>
        </div>
      </div>
      
      <div class="header-actions" v-if="canWrite">
        <button @click="showAddDialog" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          添加进展记录
        </button>
      </div>
    </div>

    <!-- 筛选和统计 -->
    <div class="filter-section">
      <div class="filter-left">
        <select v-model="selectedType" @change="loadHistories">
          <option value="">所有类型</option>
          <option value="progress_update">进度更新</option>
          <option value="status_change">状态变更</option>
          <option value="manual_note">手动记录</option>
          <option value="milestone">里程碑</option>
        </select>
      </div>
      
      <div class="filter-right">
        <span class="total-count">共 {{ pagination.total }} 条记录</span>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-list" v-if="histories.length > 0">
      <div 
        v-for="history in histories" 
        :key="history.id" 
        class="history-item"
        :class="`type-${history.type}`"
      >
        <div class="history-icon">
          <i :class="getTypeIcon(history.type)"></i>
        </div>
        
        <div class="history-content">
          <div class="history-header">
            <h3 class="history-title">{{ history.title }}</h3>
            <div class="history-meta">
              <span class="history-type">{{ getTypeText(history.type) }}</span>
              <span class="history-author">{{ history.creator_name || '系统' }}</span>
              <span class="history-time">{{ formatTime(history.created_at) }}</span>
            </div>
          </div>
          
          <div class="history-body">
            <div v-if="history.type === 'progress_update'" class="progress-change">
              <div class="progress-bar-container">
                <span class="progress-label">进度变化:</span>
                <div class="progress-comparison">
                  <div class="progress-before">
                    <span>{{ history.progress_before }}%</span>
                    <div class="mini-progress-bar">
                      <div class="progress-fill" :style="{ width: history.progress_before + '%' }"></div>
                    </div>
                  </div>
                  <i class="fas fa-arrow-right progress-arrow"></i>
                  <div class="progress-after">
                    <span>{{ history.progress_after }}%</span>
                    <div class="mini-progress-bar">
                      <div class="progress-fill" :style="{ width: history.progress_after + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="history.type === 'status_change'" class="status-change">
              <div class="status-comparison">
                <span class="status-label">状态变化:</span>
                <span :class="`status-badge status-${history.status_before}`">
                  {{ getStatusText(history.status_before) }}
                </span>
                <i class="fas fa-arrow-right status-arrow"></i>
                <span :class="`status-badge status-${history.status_after}`">
                  {{ getStatusText(history.status_after) }}
                </span>
              </div>
            </div>
            
            <div class="content-text" v-html="renderMarkdown(history.content)"></div>
            
            <!-- 附件展示 -->
            <div v-if="history.attachments && history.attachments.length > 0" class="attachments">
              <h4>附件:</h4>
              <div class="attachment-list">
                <div 
                  v-for="attachment in history.attachments" 
                  :key="attachment.id"
                  class="attachment-item"
                >
                  <img 
                    v-if="attachment.type && attachment.type.startsWith('image/')"
                    :src="attachment.url" 
                    :alt="attachment.filename"
                    class="attachment-image"
                    @click="openImagePreview(attachment.url)"
                  />
                  <video 
                    v-else-if="attachment.type && attachment.type.startsWith('video/')"
                    :src="attachment.url" 
                    controls
                    class="attachment-video"
                  ></video>
                </div>
              </div>
            </div>
          </div>
          
          <div class="history-actions" v-if="canEdit(history)">
            <button @click="editHistory(history)" class="action-btn edit-btn">
              <i class="fas fa-edit"></i>
              编辑
            </button>
            <button @click="deleteHistory(history)" class="action-btn delete-btn">
              <i class="fas fa-trash"></i>
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <i class="fas fa-history empty-icon"></i>
      <h3>暂无进展记录</h3>
      <p>开始记录项目的每一步进展吧</p>
      <button v-if="canWrite" @click="showAddDialog" class="btn btn-primary">
        添加第一条记录
      </button>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.pages > 1" class="pagination-wrapper">
      <div class="pagination">
        <button 
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="page-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="page-info">
          {{ pagination.page }} / {{ pagination.pages }}
        </span>
        
        <button 
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.pages"
          class="page-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ editingHistory ? '编辑进展记录' : '添加进展记录' }}</h3>
          <button @click="closeDialog" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="dialog-body">
          <form @submit.prevent="saveHistory">
            <div class="form-group">
              <label>记录类型</label>
              <select v-model="historyForm.type" required>
                <option value="manual_note">手动记录</option>
                <option value="milestone">里程碑</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>标题</label>
              <input 
                v-model="historyForm.title" 
                type="text" 
                placeholder="请输入记录标题"
                required
              />
            </div>
            
            <div class="form-group">
              <label>内容（支持Markdown）</label>
              <MarkdownEditor 
                v-model="historyForm.content"
                :height="'300px'"
                placeholder="记录项目进展、遇到的问题、解决方案、心得体会等..."
                @upload-success="handleUploadSuccess"
              />
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeDialog" class="btn btn-secondary">
                取消
              </button>
              <button type="submit" :disabled="saving" class="btn btn-primary">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 图片预览 -->
    <div v-if="previewImage" class="image-preview-overlay" @click="closeImagePreview">
      <img :src="previewImage" alt="预览" class="preview-image" />
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import MarkdownEditor from '@/components/common/MarkdownEditor.vue';
import { useAuthStore } from '@/stores/auth';
import axios from '@/utils/axios';

export default {
  name: 'ProjectHistory',
  components: {
    MarkdownEditor
  },
  data() {
    return {
      project: null,
      histories: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
      },
      selectedType: '',
      loading: false,
      saving: false,
      showDialog: false,
      editingHistory: null,
      historyForm: {
        type: 'manual_note',
        title: '',
        content: '',
        attachments: []
      },
      previewImage: null
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    },
    projectId() {
      return this.$route.params.id;
    },
    canWrite() {
      return this.authStore.isAuthenticated;
    },
    canEdit() {
      return (history) => {
        if (!this.authStore.isAuthenticated) return false;
        return this.authStore.user.is_admin || history.created_by === this.authStore.user.id;
      };
    }
  },
  async created() {
    await this.loadProject();
    await this.loadHistories();
  },
  methods: {
    async loadProject() {
      try {
        const response = await axios.get(`/api/projects/${this.projectId}`);
        this.project = response.data;
      } catch (error) {
        console.error('加载项目信息失败:', error);
        this.$router.push('/projects');
      }
    },
    
    async loadHistories() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        };
        
        if (this.selectedType) {
          params.type = this.selectedType;
        }
        
        const response = await axios.get(`/api/project-history/${this.projectId}`, { params });
        this.histories = response.data.histories;
        this.pagination = response.data.pagination;
      } catch (error) {
        console.error('加载历史记录失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.pagination.pages) {
        this.pagination.page = page;
        this.loadHistories();
      }
    },
    
    showAddDialog() {
      this.editingHistory = null;
      this.historyForm = {
        type: 'manual_note',
        title: '',
        content: '',
        attachments: []
      };
      this.showDialog = true;
    },
    
    editHistory(history) {
      this.editingHistory = history;
      this.historyForm = {
        type: history.type,
        title: history.title,
        content: history.content,
        attachments: [...(history.attachments || [])]
      };
      this.showDialog = true;
    },
    
    closeDialog() {
      this.showDialog = false;
      this.editingHistory = null;
    },
    
    async saveHistory() {
      if (!this.historyForm.title.trim() || !this.historyForm.content.trim()) {
        alert('请填写标题和内容');
        return;
      }
      
      this.saving = true;
      try {
        const data = {
          project_id: this.projectId,
          type: this.historyForm.type,
          title: this.historyForm.title,
          content: this.historyForm.content,
          attachments: this.historyForm.attachments
        };
        
        if (this.editingHistory) {
          await axios.put(`/api/project-history/${this.editingHistory.id}`, data);
        } else {
          await axios.post('/api/project-history', data);
        }
        
        this.closeDialog();
        await this.loadHistories();
      } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败: ' + (error.response?.data?.message || error.message));
      } finally {
        this.saving = false;
      }
    },
    
    async deleteHistory(history) {
      if (!confirm('确定要删除这条记录吗？此操作不可恢复。')) {
        return;
      }
      
      try {
        await axios.delete(`/api/project-history/${history.id}`);
        await this.loadHistories();
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败: ' + (error.response?.data?.message || error.message));
      }
    },
    
    handleUploadSuccess(uploadResult) {
      this.historyForm.attachments.push(uploadResult.file);
    },
    
    renderMarkdown(content) {
      return marked(content);
    },
    
    openImagePreview(url) {
      this.previewImage = url;
    },
    
    closeImagePreview() {
      this.previewImage = null;
    },
    
    goBack() {
      this.$router.push(`/projects/${this.projectId}`);
    },
    
    getTypeIcon(type) {
      const icons = {
        progress_update: 'fas fa-chart-line',
        status_change: 'fas fa-exchange-alt',
        manual_note: 'fas fa-sticky-note',
        milestone: 'fas fa-flag'
      };
      return icons[type] || 'fas fa-sticky-note';
    },
    
    getTypeText(type) {
      const texts = {
        progress_update: '进度更新',
        status_change: '状态变更',
        manual_note: '手动记录',
        milestone: '里程碑'
      };
      return texts[type] || '记录';
    },
    
    getStatusText(status) {
      const texts = {
        idea: '构思中',
        planning: '规划中',
        development: '开发中',
        testing: '测试中',
        deployed: '已部署',
        paused: '暂停',
        completed: '已完成'
      };
      return texts[status] || status;
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('zh-CN');
    }
  }
};
</script>

<style scoped>
.project-history {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.header-left {
  flex: 1;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin-bottom: 16px;
  border: 1px solid #e1e5e9;
  background: white;
  border-radius: 6px;
  color: #495057;
  text-decoration: none;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
}

.project-info h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #212529;
}

.project-status {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  color: #6c757d;
}

.status-idea { color: #6c757d; }
.status-planning { color: #fd7e14; }
.status-development { color: #007bff; }
.status-testing { color: #ffc107; color: #000; }
.status-deployed { color: #198754; }
.status-paused { color: #6c757d; }
.status-completed { color: #198754; }

.progress {
  font-weight: 600;
  color: #007bff;
}

.header-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-left select {
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  background: white;
}

.total-count {
  color: #6c757d;
  font-size: 14px;
}

.history-list {
  space-y: 16px;
}

.history-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.history-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.history-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 16px;
}

.type-progress_update .history-icon {
  background: #e3f2fd;
  color: #1976d2;
}

.type-status_change .history-icon {
  background: #fff3e0;
  color: #f57c00;
}

.type-manual_note .history-icon {
  background: #f3e5f5;
  color: #7b1fa2;
}

.type-milestone .history-icon {
  background: #e8f5e8;
  color: #388e3c;
}

.history-content {
  flex: 1;
}

.history-header {
  margin-bottom: 12px;
}

.history-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #6c757d;
}

.history-type {
  padding: 2px 8px;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 12px;
}

.progress-change,
.status-change {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.progress-comparison {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.progress-before,
.progress-after {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-progress-bar {
  width: 60px;
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

.progress-arrow,
.status-arrow {
  color: #6c757d;
}

.status-comparison {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-idea { background: #f8f9fa; color: #6c757d; }
.status-badge.status-planning { background: #fff3cd; color: #856404; }
.status-badge.status-development { background: #cce5ff; color: #004085; }
.status-badge.status-testing { background: #fff3cd; color: #856404; }
.status-badge.status-deployed { background: #d4edda; color: #155724; }
.status-badge.status-paused { background: #f8f9fa; color: #6c757d; }
.status-badge.status-completed { background: #d4edda; color: #155724; }

.content-text {
  margin-bottom: 16px;
  line-height: 1.6;
}

.content-text :deep(p) {
  margin-bottom: 12px;
}

.content-text :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}

.content-text :deep(video) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}

.attachments {
  margin-top: 16px;
}

.attachments h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #495057;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.attachment-image {
  max-width: 200px;
  max-height: 150px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}

.attachment-image:hover {
  transform: scale(1.05);
}

.attachment-video {
  max-width: 300px;
  border-radius: 6px;
}

.history-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.delete-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #dee2e6;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.empty-state p {
  margin: 0 0 24px 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e1e5e9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #007bff;
  color: #007bff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 0 16px;
  font-size: 14px;
  color: #6c757d;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dialog {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #212529;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #545862;
}

/* 图片预览 */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-history {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .history-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .history-meta {
    flex-wrap: wrap;
  }
  
  .progress-comparison,
  .status-comparison {
    flex-wrap: wrap;
  }
}
</style> 