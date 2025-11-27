<template>
  <main class="flex-grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
    <!-- Page Header -->
    <div class="mb-8 flex justify-between items-end border-b-4 border-black pb-4">
      <div class="flex items-center gap-4">
        <button 
          @click="goBack" 
          class="neo-btn bg-white px-4 py-2 hover:bg-gray-100"
        >
          <i class="fa-solid fa-arrow-left mr-2"></i>
          {{ $t('project_history.back_to_detail') }}
        </button>
        <div v-if="project">
          <h1 class="text-3xl font-black mb-2">{{ project.title }} - {{ t('project.progress_history') }}</h1>
          <div class="flex items-center gap-4 text-sm font-bold">
            <span>
              {{ $t('project_history.status') }}: 
              <span 
                class="px-2 py-1 border-2 border-black rounded"
                :class="getStatusBadgeClass(project.status)"
              >
                {{ getStatusText(project.status) }}
              </span>
            </span>
            <span>
              {{ $t('project_history.progress') }}: 
              <span class="font-mono text-neo-blue">{{ project.progress }}%</span>
            </span>
          </div>
        </div>
      </div>
      
      <button 
        v-if="canWrite"
        @click="showAddDialog" 
        class="neo-btn bg-neo-green text-black px-6 py-3 hover:bg-green-400"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        {{ $t('project_history.add_record') }}
      </button>
    </div>

    <!-- Filter Section -->
    <div class="neo-card p-4 mb-8 bg-white flex justify-between items-center">
      <div class="relative">
        <select 
          v-model="selectedType" 
          @change="loadHistories"
          class="appearance-none bg-gray-100 border-2 border-black px-4 py-2 pr-8 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white cursor-pointer"
        >
          <option value="">{{ $t('project_history.all_types') }}</option>
          <option value="progress_update">{{ $t('global_history.record_types.progress_update') }}</option>
          <option value="status_change">{{ $t('global_history.record_types.status_change') }}</option>
          <option value="progress_log">{{ $t('global_history.record_types.progress_log') }}</option>
          <option value="manual_note">{{ $t('global_history.record_types.manual_record') }}</option>
          <option value="milestone">{{ $t('global_history.record_types.milestone') }}</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black border-l-2 border-black bg-neo-yellow">
          <i class="fa-solid fa-caret-down text-xs"></i>
        </div>
      </div>
      
      <div class="font-bold text-gray-600">
        {{ $t('project_history.total_records').replace('{count}', pagination.total) }}
      </div>
    </div>

    <!-- History List -->
    <div v-if="histories.length > 0" class="mb-8">
      <div class="flex flex-col gap-4">
      <div 
        v-for="history in histories" 
        :key="history.id" 
        class="neo-card p-6 bg-white"
      >
        <div class="flex gap-4">
          <div 
            class="w-12 h-12 border-4 border-black rounded-lg flex items-center justify-center flex-shrink-0"
            :class="getTypeIconBgClass(history.type)"
          >
            <i :class="[getTypeIcon(history.type), 'text-xl']"></i>
          </div>
          
          <div class="flex-1">
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-xl font-black">{{ history.title }}</h3>
              <div class="flex items-center gap-3 text-xs font-bold text-gray-500">
                <span class="px-2 py-1 bg-gray-100 border border-black rounded">
                  {{ getTypeText(history.type) }}
                </span>
                <span>{{ history.creator_name || $t('project_history.system') }}</span>
                <span>{{ formatTime(history.created_at) }}</span>
              </div>
            </div>
          
            <div class="history-body">
              <div v-if="history.type === 'progress_update'" class="neo-card p-4 bg-gray-50 mb-4">
                <div class="flex items-center gap-4">
                  <div class="flex-1">
                    <div class="text-xs font-bold text-gray-500 mb-2">{{ $t('project_history.progress_change') }}</div>
                    <div class="flex items-center gap-3">
                      <div class="flex-1">
                        <div class="text-sm font-bold mb-1">{{ history.progress_before }}%</div>
                        <div class="h-3 border-2 border-black rounded-full bg-white overflow-hidden p-[1px]">
                          <div 
                            class="h-full bg-neo-blue rounded-full stripe-progress"
                            :style="{ width: history.progress_before + '%' }"
                          ></div>
                        </div>
                      </div>
                      <i class="fa-solid fa-arrow-right text-gray-500"></i>
                      <div class="flex-1">
                        <div class="text-sm font-bold mb-1">{{ history.progress_after }}%</div>
                        <div class="h-3 border-2 border-black rounded-full bg-white overflow-hidden p-[1px]">
                          <div 
                            class="h-full bg-neo-green rounded-full stripe-progress"
                            :style="{ width: history.progress_after + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="history.type === 'status_change'" class="neo-card p-4 bg-gray-50 mb-4">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold text-gray-500">{{ $t('project_history.status_change') }}</span>
                  <span 
                    class="px-3 py-1 text-xs font-bold border-2 border-black rounded"
                    :class="getStatusBadgeClass(history.status_before)"
                  >
                    {{ getStatusText(history.status_before) }}
                  </span>
                  <i class="fa-solid fa-arrow-right text-gray-500"></i>
                  <span 
                    class="px-3 py-1 text-xs font-bold border-2 border-black rounded"
                    :class="getStatusBadgeClass(history.status_after)"
                  >
                    {{ getStatusText(history.status_after) }}
                  </span>
                </div>
              </div>
              
              <div v-if="history.type === 'progress_log'" class="neo-card p-4 bg-blue-50 mb-4">
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-clipboard-list text-neo-blue"></i>
                  <span class="font-bold text-sm">{{ $t('project_history.project_progress_update') }}</span>
                </div>
                <div class="text-sm" v-html="renderMarkdown(history.content)"></div>
              </div>
              
              <div 
                v-if="history.type !== 'progress_update' && history.type !== 'status_change' && history.type !== 'progress_log'" 
                class="text-sm mb-4" 
                v-html="renderMarkdown(history.content)"
              ></div>
              
              <!-- Attachments -->
              <div v-if="history.attachments && history.attachments.length > 0" class="mb-4">
                <div class="text-xs font-bold text-gray-500 mb-2">{{ $t('project_history.attachments') }}</div>
                <div class="flex flex-wrap gap-3">
                  <div 
                    v-for="attachment in history.attachments" 
                    :key="attachment.id"
                    class="neo-card p-2 bg-gray-50"
                  >
                    <img 
                      v-if="attachment.type && attachment.type.startsWith('image/')"
                      :src="attachment.url" 
                      :alt="attachment.filename"
                      class="max-w-[200px] max-h-[150px] border-2 border-black rounded cursor-pointer hover:opacity-80"
                      @click="openImagePreview(attachment.url)"
                    />
                    <video 
                      v-else-if="attachment.type && attachment.type.startsWith('video/')"
                      :src="attachment.url" 
                      controls
                      class="max-w-[300px] border-2 border-black rounded"
                    ></video>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex gap-2 mt-4 pt-4 border-t-2 border-gray-100" v-if="canEdit(history)">
              <button 
                @click="editHistory(history)" 
                class="neo-btn bg-white px-4 py-2 text-sm hover:bg-gray-100"
              >
                <i class="fa-solid fa-edit mr-1"></i>
                {{ $t('project_history.edit') }}
              </button>
              <button 
                @click="deleteHistory(history)" 
                class="neo-btn bg-neo-red text-white px-4 py-2 text-sm hover:bg-red-500"
              >
                <i class="fa-solid fa-trash mr-1"></i>
                {{ $t('project_history.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <i class="fa-solid fa-history text-6xl text-gray-400 mb-4"></i>
      <h3 class="text-xl font-black mb-2">{{ $t('project_history.no_records') }}</h3>
      <p class="text-gray-600 mb-6">{{ $t('project_history.start_recording') }}</p>
      <button 
        v-if="canWrite" 
        @click="showAddDialog" 
        class="neo-btn bg-neo-green text-black px-6 py-3 hover:bg-green-400"
      >
        {{ $t('project_history.add_first_record') }}
      </button>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="flex justify-center mb-8">
      <div class="neo-card p-4 bg-white inline-flex items-center gap-4">
        <button 
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span class="font-mono font-bold">
          {{ pagination.page }} / {{ pagination.pages }}
        </span>
        <button 
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.pages"
          class="w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="showDialog"
      :title="editingHistory ? $t('project_history.edit_record') : $t('project_history.add_record_title')"
      width="700px"
      :before-close="closeDialog"
      class="history-dialog"
    >
      <form @submit.prevent="saveHistory">
        <div class="form-group mb-4">
          <label class="block text-sm font-bold mb-2">{{ $t('project_history.record_type') }}</label>
          <div class="relative">
            <select 
              v-model="historyForm.type" 
              required
              class="appearance-none bg-gray-100 border-2 border-black px-4 py-3 pr-8 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white cursor-pointer w-full"
            >
              <option value="manual_note">{{ $t('global_history.record_types.manual_record') }}</option>
              <option value="milestone">{{ $t('global_history.record_types.milestone') }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black border-l-2 border-black bg-neo-yellow">
              <i class="fa-solid fa-caret-down text-xs"></i>
            </div>
          </div>
        </div>
        
        <div class="form-group mb-4">
          <label class="block text-sm font-bold mb-2">{{ $t('project_history.title') }}</label>
          <input 
            v-model="historyForm.title" 
            type="text" 
            :placeholder="$t('project_history.title_placeholder')"
            required
            class="w-full bg-gray-100 border-2 border-black px-4 py-3 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
          />
        </div>
        
        <div class="form-group mb-4">
          <label class="block text-sm font-bold mb-2">{{ $t('project_history.content') }}</label>
          <MarkdownEditor 
            v-model="historyForm.content"
            :height="'300px'"
            :placeholder="$t('project_history.content_placeholder')"
            @upload-success="handleUploadSuccess"
          />
        </div>
        
        <div class="flex gap-4 justify-end mt-6">
          <button 
            type="button" 
            @click="closeDialog" 
            class="neo-btn bg-white px-6 py-3 hover:bg-gray-100"
          >
            {{ $t('project_history.cancel') }}
          </button>
          <button 
            type="submit" 
            :disabled="saving" 
            class="neo-btn bg-neo-green text-black px-6 py-3 hover:bg-green-400 disabled:opacity-50"
          >
            <i v-if="saving" class="fa-solid fa-spinner fa-spin mr-2"></i>
            {{ saving ? $t('project_history.saving') : $t('project_history.save') }}
          </button>
        </div>
      </form>
    </el-dialog>

    <!-- Image Preview -->
    <div 
      v-if="previewImage" 
      class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center cursor-pointer"
      @click="closeImagePreview"
    >
      <img :src="previewImage" :alt="$t('project_history.preview')" class="max-w-[90%] max-h-[90%] border-4 border-white" />
    </div>
  </main>
</template>

<script>
import { renderEnhancedMarkdown } from '@/utils/markdownRenderer';
import MarkdownEditor from '@/components/common/MarkdownEditor.vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import axios from '@/utils/axios';

export default {
  name: 'ProjectHistory',
  components: {
    MarkdownEditor
  },
  setup() {
    const { t } = useI18n();
    return { t };
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
      return renderEnhancedMarkdown(content);
    },
    
    openImagePreview(url) {
      this.previewImage = url;
    },
    
    closeImagePreview() {
      this.previewImage = null;
    },
    
    goBack() {
      this.$router.push(`/project/${this.projectId}`);
    },
    
    getTypeIcon(type) {
      const icons = {
        progress_update: 'fa-solid fa-chart-line',
        status_change: 'fa-solid fa-exchange-alt',
        manual_note: 'fa-solid fa-sticky-note',
        milestone: 'fa-solid fa-flag',
        progress_log: 'fa-solid fa-clipboard-list'
      };
      return icons[type] || 'fa-solid fa-sticky-note';
    },
    
    getTypeText(type) {
      const texts = {
        progress_update: this.t('global_history.record_types.progress_update'),
        status_change: this.t('global_history.record_types.status_change'),
        manual_note: this.t('global_history.record_types.manual_record'),
        milestone: this.t('global_history.record_types.milestone'),
        progress_log: this.t('global_history.record_types.progress_log')
      };
      return texts[type] || this.t('global_history.record_types.manual_record');
    },
    
    getStatusText(status) {
      const statusMap = {
        idea: 'brainstorming',
        planning: 'planning',
        development: 'development',
        testing: 'testing',
        deployed: 'deployed',
        paused: 'on_hold',
        completed: 'completed'
      };
      const translationKey = statusMap[status] || 'brainstorming';
      return this.t(`project.status_options.${translationKey}`);
    },
    
    getStatusBadgeClass(status) {
      const classMap = {
        idea: 'bg-gray-200 text-gray-800',
        planning: 'bg-blue-200 text-blue-800',
        development: 'bg-neo-purple text-white',
        testing: 'bg-red-200 text-red-800',
        completed: 'bg-neo-green text-black',
        deployed: 'bg-neo-blue text-white',
        paused: 'bg-gray-300 text-gray-800'
      };
      return classMap[status] || 'bg-gray-200 text-gray-800';
    },
    
    getTypeIconBgClass(type) {
      const classMap = {
        progress_update: 'bg-neo-green',
        status_change: 'bg-neo-yellow',
        manual_note: 'bg-neo-purple',
        milestone: 'bg-neo-red',
        progress_log: 'bg-neo-blue'
      };
      return classMap[type] || 'bg-gray-200';
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('zh-CN');
    }
  }
};
</script>

<style scoped>
.history-dialog {
  :deep(.el-dialog) {
    border: 4px solid black;
    border-radius: 0;
    box-shadow: 8px 8px 0 0 black;
  }

  :deep(.el-dialog__header) {
    text-align: center;
    padding: 24px 24px 0;
    border-bottom: 3px solid black;

    .el-dialog__title {
      font-weight: 900;
      font-size: 1.5rem;
      color: black;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--ai-border);
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
  border: 1px solid var(--ai-border);
  background: var(--ai-bg-primary);
  border-radius: 6px;
  color: var(--ai-text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--ai-bg-secondary);
  border-color: var(--ai-primary);
  color: var(--ai-primary);
}

.project-info h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--ai-text-primary);
}

.project-status {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  color: var(--ai-text-secondary);
}

.status-idea { color: var(--ai-text-secondary); }
.status-planning { color: var(--ai-warning); }
.status-development { color: var(--ai-primary); }
.status-testing { color: var(--ai-warning); }
.status-deployed { color: var(--ai-success); }
.status-paused { color: var(--ai-text-secondary); }
.status-completed { color: var(--ai-success); }

.progress {
  font-weight: 600;
  color: var(--ai-primary);
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
  background: var(--ai-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--el-color-primary-dark-2);
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--ai-bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--ai-border);
}

.filter-left select {
  padding: 8px 12px;
  border: 1px solid var(--ai-border);
  border-radius: 4px;
  background: var(--ai-bg-primary);
  color: var(--ai-text-primary);
}

.total-count {
  color: var(--ai-text-secondary);
  font-size: 14px;
}


.history-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--ai-bg-primary);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.history-item:hover {
  border-color: var(--ai-primary);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
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
  background: rgba(16, 185, 129, 0.1);
  color: var(--ai-success);
}

.type-status_change .history-icon {
  background: rgba(245, 158, 11, 0.1);
  color: var(--ai-warning);
}

.type-manual_note .history-icon {
  background: rgba(99, 102, 241, 0.1);
  color: var(--ai-primary);
}

.type-milestone .history-icon {
  background: rgba(239, 68, 68, 0.1);
  color: var(--ai-error);
}

.type-progress_log .history-icon {
  background: rgba(59, 130, 246, 0.1);
  color: var(--el-color-primary);
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
  color: var(--ai-text-primary);
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--ai-text-secondary);
}

.history-type {
  padding: 2px 8px;
  background: var(--ai-bg-secondary);
  border-radius: 12px;
  font-size: 12px;
  color: var(--ai-text-secondary);
}

.progress-change,
.status-change,
.progress-log-display {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--ai-bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--ai-border);
}

.progress-log-display {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}

.progress-log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--el-color-primary);
  font-size: 14px;
}

.progress-log-content {
  line-height: 1.6;
  color: var(--ai-text-primary);
}

.progress-log-content :deep(p) {
  margin: 0 0 12px 0;
}

.progress-log-content :deep(p:last-child) {
  margin-bottom: 0;
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
  background: var(--ai-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--ai-primary);
  transition: width 0.3s ease;
}

.progress-arrow,
.status-arrow {
  color: var(--ai-text-secondary);
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

.status-badge.status-idea { 
  background: var(--ai-bg-secondary); 
  color: var(--ai-text-secondary); 
  border: 1px solid var(--ai-border);
}
.status-badge.status-planning { 
  background: rgba(245, 158, 11, 0.1); 
  color: var(--ai-warning); 
  border: 1px solid var(--ai-warning);
}
.status-badge.status-development { 
  background: rgba(99, 102, 241, 0.1); 
  color: var(--ai-primary); 
  border: 1px solid var(--ai-primary);
}
.status-badge.status-testing { 
  background: rgba(245, 158, 11, 0.1); 
  color: var(--ai-warning); 
  border: 1px solid var(--ai-warning);
}
.status-badge.status-deployed { 
  background: rgba(16, 185, 129, 0.1); 
  color: var(--ai-success); 
  border: 1px solid var(--ai-success);
}
.status-badge.status-paused { 
  background: var(--ai-bg-secondary); 
  color: var(--ai-text-secondary); 
  border: 1px solid var(--ai-border);
}
.status-badge.status-completed { 
  background: rgba(16, 185, 129, 0.1); 
  color: var(--ai-success); 
  border: 1px solid var(--ai-success);
}

.content-text {
  margin-bottom: 16px;
  line-height: 1.6;
  color: var(--ai-text-primary);
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
  color: var(--ai-text-primary);
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
  border: 1px solid var(--ai-border);
  background: var(--ai-bg-primary);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--ai-text-secondary);
}

.edit-btn:hover {
  border-color: var(--ai-primary);
  color: var(--ai-primary);
}

.delete-btn:hover {
  border-color: var(--ai-error);
  color: var(--ai-error);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--ai-text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--ai-border);
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: var(--ai-text-primary);
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
  border: 1px solid var(--ai-border);
  background: var(--ai-bg-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--ai-text-secondary);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--ai-primary);
  color: var(--ai-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 0 16px;
  font-size: 14px;
  color: var(--ai-text-secondary);
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
  background: var(--ai-bg-primary);
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--ai-border);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--ai-border);
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--ai-text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--ai-text-secondary);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--ai-bg-secondary);
  color: var(--ai-text-primary);
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
  color: var(--ai-text-primary);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--ai-border);
  border-radius: 4px;
  font-size: 14px;
  background: var(--ai-bg-primary);
  color: var(--ai-text-primary);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--ai-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary {
  background: var(--ai-text-secondary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--ai-text-primary);
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