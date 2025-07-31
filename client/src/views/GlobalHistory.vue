<template>
  <div class="global-history">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('global_history.title') }}</h1>
      <p class="page-description">{{ $t('global_history.subtitle') }}</p>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-item">
        <label>{{ $t('global_history.filter_by_type') }}：</label>
        <el-select v-model="filterType" :placeholder="$t('global_history.all_types')" clearable @change="handleFilterChange">
          <el-option :label="$t('global_history.all_types')" value="" />
          <el-option :label="$t('global_history.record_types.progress_update')" value="progress_update" />
          <el-option :label="$t('global_history.record_types.status_change')" value="status_change" />
          <el-option :label="$t('global_history.record_types.manual_record')" value="manual_note" />
          <el-option :label="$t('global_history.record_types.milestone')" value="milestone" />
        </el-select>
      </div>
      <div class="filter-stats">
        <span v-if="pagination.total">{{ $t('form.total') }} {{ pagination.total }} {{ $t('global_history.records_count') }}</span>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-list" v-loading="loading">
      <el-empty v-if="!loading && histories.length === 0" :description="$t('message.no_data')" />
      
      <div v-else class="timeline">
        <div 
          v-for="history in histories" 
          :key="history.id" 
          class="timeline-item"
          @click="navigateToProject(history.project_id)"
        >
          <div class="timeline-marker" :class="getTypeClass(history.type)">
            <el-icon>
              <component :is="getTypeIcon(history.type)" />
            </el-icon>
          </div>
          
          <div class="timeline-content">
            <div class="content-header">
              <div class="project-info">
                <h3 class="project-name">{{ history.project_name || history.project_title }}</h3>
                <el-tag :type="getTypeTagType(history.type)" size="small">
                  {{ getTypeLabel(history.type) }}
                </el-tag>
              </div>
              <span class="timestamp">{{ formatDate(history.created_at) }}</span>
            </div>
            
            <div class="content-body">
              <h4 class="history-title">{{ history.title }}</h4>
              
              <!-- 进度更新特殊显示 -->
              <div v-if="history.type === 'progress_update'" class="progress-change">
                <div class="progress-comparison">
                  <div class="progress-item">
                    <span class="label">{{ $t('global_history.previous') }}:</span>
                    <el-progress :percentage="history.progress_before" :show-text="false" />
                    <span class="percentage">{{ history.progress_before }}%</span>
                  </div>
                  <el-icon class="arrow"><ArrowRight /></el-icon>
                  <div class="progress-item">
                    <span class="label">{{ $t('global_history.current') }}:</span>
                    <el-progress :percentage="history.progress_after" :show-text="false" />
                    <span class="percentage">{{ history.progress_after }}%</span>
                  </div>
                </div>
              </div>
              
              <!-- 状态变更特殊显示 -->
              <div v-else-if="history.type === 'status_change'" class="status-change">
                <div class="status-comparison">
                  <el-tag>{{ history.status_before }}</el-tag>
                  <el-icon class="arrow"><ArrowRight /></el-icon>
                  <el-tag type="success">{{ history.status_after }}</el-tag>
                </div>
              </div>
              
              <!-- 通用内容显示 -->
              <div v-else class="content-text" v-html="renderMarkdown(history.content)"></div>
              
              <!-- 附件显示 -->
              <div v-if="history.attachments && history.attachments.length > 0" class="attachments">
                <div class="attachment-list">
                  <div 
                    v-for="attachment in history.attachments" 
                    :key="attachment.url"
                    class="attachment-item"
                  >
                    <img 
                      v-if="attachment.type.startsWith('image/')"
                      :src="attachment.url" 
                      :alt="attachment.name"
                      class="attachment-image"
                      @click.stop=""
                    />
                    <video 
                      v-else-if="attachment.type.startsWith('video/')"
                      :src="attachment.url" 
                      controls
                      class="attachment-video"
                      @click.stop=""
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div class="content-footer">
              <span class="creator">{{ history.creator_name }}</span>
              <el-button type="primary" link @click.stop="navigateToProject(history.project_id)">
                <el-icon><View /></el-icon>
                {{ $t('project.view') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowRight, Clock, TrendCharts, DocumentAdd, Trophy, View } from '@element-plus/icons-vue'
import { renderEnhancedMarkdown } from '@/utils/markdownRenderer'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import axios from '../utils/axios'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()
const { t } = useI18n()

// 响应式数据
const histories = ref([])
const loading = ref(false)
const filterType = ref('')

// 分页数据
const currentPage = ref(1)
const pageSize = ref(20)
const pagination = reactive({
  total: 0,
  pages: 0
})

// 获取全局历史数据
const fetchGlobalHistory = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    if (filterType.value) {
      params.type = filterType.value
    }
    
    const response = await axios.get('/api/project-history/global/all', { params })
    histories.value = response.data.histories
    Object.assign(pagination, response.data.pagination)
  } catch (error) {
    console.error('获取全局历史失败:', error)
    ElMessage.error(t('message.error'))
  } finally {
    loading.value = false
  }
}

// 处理筛选变更
const handleFilterChange = () => {
  currentPage.value = 1
  fetchGlobalHistory()
}

// 处理分页变更
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchGlobalHistory()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchGlobalHistory()
}

// 跳转到项目详情
const navigateToProject = (projectId) => {
  router.push(`/project/${projectId}`)
}

// 获取类型样式类
const getTypeClass = (type) => {
  const typeClasses = {
    'progress_update': 'progress',
    'status_change': 'status',
    'manual_note': 'note',
    'milestone': 'milestone'
  }
  return typeClasses[type] || 'note'
}

// 获取类型图标
const getTypeIcon = (type) => {
  const typeIcons = {
    'progress_update': TrendCharts,
    'status_change': ArrowRight,
    'manual_note': DocumentAdd,
    'milestone': Trophy
  }
  return typeIcons[type] || DocumentAdd
}

// 获取类型标签类型
const getTypeTagType = (type) => {
  const tagTypes = {
    'progress_update': 'success',
    'status_change': 'warning',
    'manual_note': 'info',
    'milestone': 'danger'
  }
  return tagTypes[type] || 'info'
}

// 获取类型标签文本
const getTypeLabel = (type) => {
  const typeMap = {
    'progress_update': 'progress_update',
    'status_change': 'status_change',
    'manual_note': 'manual_record',
    'milestone': 'milestone'
  }
  const translationKey = typeMap[type] || 'manual_record'
  return t(`global_history.record_types.${translationKey}`)
}

// 格式化日期
const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

// 渲染Markdown
const renderMarkdown = (content) => {
  return renderEnhancedMarkdown(content)
}

// 生命周期
onMounted(() => {
  fetchGlobalHistory()
})
</script>

<style scoped>
.global-history {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--ai-text-primary);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: var(--ai-text-secondary);
  margin: 0;
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

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-weight: 500;
  color: var(--ai-text-primary);
}

.filter-stats {
  color: var(--ai-text-secondary);
  font-size: 14px;
}

.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--ai-border);
}

.timeline-item {
  position: relative;
  margin-bottom: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
}



.timeline-marker {
  position: absolute;
  left: 12px;
  top: 20px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  border: 2px solid var(--ai-bg-primary);
}

.timeline-marker.progress {
  background: var(--ai-success);
  color: white;
}

.timeline-marker.status {
  background: var(--ai-warning);
  color: white;
}

.timeline-marker.note {
  background: var(--ai-primary);
  color: white;
}

.timeline-marker.milestone {
  background: var(--ai-error);
  color: white;
}

.timeline-content {
  margin-left: 60px;
  background: var(--ai-bg-primary);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--ai-border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--ai-text-primary);
  margin: 0;
}

.timestamp {
  font-size: 14px;
  color: var(--ai-text-secondary);
  flex-shrink: 0;
}

.content-body {
  margin-bottom: 16px;
}

.history-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--ai-text-primary);
  margin: 0 0 12px 0;
}

.progress-change {
  margin-top: 12px;
}

.progress-comparison {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
}

.progress-item .label {
  font-size: 14px;
  color: var(--ai-text-secondary);
  min-width: 40px;
}

.progress-item .percentage {
  font-size: 14px;
  font-weight: 500;
  color: var(--ai-text-primary);
  min-width: 40px;
}

.arrow {
  color: var(--ai-text-secondary);
  flex-shrink: 0;
}

.status-change {
  margin-top: 12px;
}

.status-comparison {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.content-text {
  line-height: 1.6;
  color: var(--ai-text-primary);
}

.content-text :deep(p) {
  margin: 0 0 12px 0;
}

.content-text :deep(p:last-child) {
  margin-bottom: 0;
}

.content-text :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}

.attachments {
  margin-top: 16px;
}

.attachment-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.attachment-item {
  border-radius: 6px;
  overflow: hidden;
}

.attachment-image,
.attachment-video {
  max-width: 200px;
  max-height: 120px;
  object-fit: cover;
  border-radius: 6px;
}

.content-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--ai-border);
}

.creator {
  font-size: 14px;
  color: var(--ai-text-secondary);
}

.pagination-wrapper {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .global-history {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .timeline::before {
    left: 16px;
  }
  
  .timeline-marker {
    left: 4px;
  }
  
  .timeline-content {
    margin-left: 44px;
    padding: 16px;
  }
  
  .content-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .progress-comparison {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .progress-item {
    min-width: auto;
  }
  
  .content-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style> 