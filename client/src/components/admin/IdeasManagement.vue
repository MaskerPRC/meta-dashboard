<template>
  <div class="tab-content">
    <!-- 想法操作工具栏 -->
    <div class="ideas-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="ideaSearch"
          placeholder="搜索想法标题或描述..."
          style="width: 300px"
          clearable
          @input="handleIdeaSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="ideaStatusFilter"
          placeholder="状态筛选"
          clearable
          style="width: 140px"
          @change="handleIdeaFilter"
        >
          <el-option label="待审核" value="pending" />
          <el-option label="已采纳" value="adopted" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>

        <el-select
          v-model="sortBy"
          placeholder="排序方式"
          style="width: 140px"
          @change="fetchIdeas"
        >
          <el-option label="投票数" value="vote_count" />
          <el-option label="创建时间" value="created_at" />
          <el-option label="标题" value="title" />
        </el-select>

        <el-button @click="toggleSortOrder">
          <el-icon v-if="sortOrder === 'desc'"><ArrowDown /></el-icon>
          <el-icon v-else><ArrowUp /></el-icon>
          {{ sortOrder === 'desc' ? '降序' : '升序' }}
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-button @click="exportIdeas">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedIdeas.length === 0">
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedIdeas.length }})
        </el-button>
      </div>
    </div>

    <!-- 想法表格 -->
    <div class="ideas-table-container">
      <el-table
        ref="ideasTableRef"
        :data="filteredIdeas"
        style="width: 100%"
        @selection-change="handleIdeaSelectionChange"
        v-loading="ideasLoading"
        empty-text="暂无想法数据"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="想法标题" min-width="200">
          <template #default="scope">
            <div class="idea-title-cell">
              <el-link @click="viewIdeaDetail(scope.row)" type="primary">
                {{ scope.row.title }}
              </el-link>
              <p class="idea-desc">{{ scope.row.description }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="author_name" label="提交者" width="120">
          <template #default="scope">
            <div class="author-cell">
              <el-avatar :size="30" :src="scope.row.author_avatar" />
              <span class="author-name">{{ scope.row.author_name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :class="['status-tag', scope.row.status]" size="small">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vote_count" label="投票数" width="100">
          <template #default="scope">
            <div class="vote-cell">
              <el-icon><Star /></el-icon>
              <span>{{ scope.row.vote_count || 0 }}</span>
              <small>({{ scope.row.voters_count || 0 }}人)</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" @click="viewIdeaDetail(scope.row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>

              <template v-if="scope.row.status === 'pending'">
                <el-button size="small" type="success" @click="adoptIdea(scope.row)">
                  <el-icon><Check /></el-icon>
                  采纳
                </el-button>
                <el-button size="small" type="warning" @click="rejectIdea(scope.row)">
                  <el-icon><Close /></el-icon>
                  拒绝
                </el-button>
              </template>

              <template v-if="scope.row.status === 'adopted'">
                <el-button
                  size="small"
                  type="primary"
                  @click="transformToProject(scope.row)"
                  :disabled="Boolean(scope.row.project_id)"
                >
                  <el-icon><MagicStick /></el-icon>
                  {{ scope.row.project_id ? '已转化' : 'AI转化' }}
                </el-button>
              </template>

              <el-button size="small" type="danger" @click="deleteIdea(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalIdeas"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 想法详情对话框 -->
    <el-dialog
      v-model="ideaDetailDialogVisible"
      title="想法详情"
      width="70%"
      :before-close="closeIdeaDetailDialog"
    >
      <div v-if="selectedIdea" class="idea-detail">
        <div class="idea-header">
          <h2>{{ selectedIdea.title }}</h2>
          <div class="idea-meta">
            <el-tag :class="['status-tag', selectedIdea.status]">
              {{ getStatusName(selectedIdea.status) }}
            </el-tag>
            <span class="vote-info">
              <el-icon><Star /></el-icon>
              {{ selectedIdea.vote_count || 0 }} 票 ({{ selectedIdea.voters_count || 0 }} 人投票)
            </span>
          </div>
        </div>

        <div class="idea-content">
          <div class="description-section">
            <h4>描述</h4>
            <p>{{ selectedIdea.description }}</p>
          </div>

          <div v-if="selectedIdea.content" class="content-section">
            <h4>详细内容</h4>
            <div class="markdown-content" v-html="renderMarkdown(selectedIdea.content)"></div>
          </div>

          <div class="author-section">
            <h4>提交者信息</h4>
            <div class="author-info">
              <el-avatar :size="40" :src="selectedIdea.author_avatar" />
              <div class="author-details">
                <div class="author-name">{{ selectedIdea.author_name }}</div>
                <div class="submit-time">提交时间：{{ formatDate(selectedIdea.created_at) }}</div>
              </div>
            </div>
          </div>

          <div v-if="selectedIdea.adopted_by" class="adoption-section">
            <h4>采纳信息</h4>
            <p>采纳人：{{ selectedIdea.adopter_name }}</p>
            <p>采纳时间：{{ formatDate(selectedIdea.adopted_at) }}</p>
          </div>

          <div v-if="selectedIdea.project_id" class="project-section">
            <h4>关联项目</h4>
            <p>项目标题：{{ selectedIdea.project_title }}</p>
            <el-button type="primary" size="small" @click="viewProject(selectedIdea.project_id)">
              查看项目
            </el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeIdeaDetailDialog">关闭</el-button>

          <template v-if="selectedIdea && selectedIdea.status === 'pending'">
            <el-button type="success" @click="adoptIdea(selectedIdea)">
              <el-icon><Check /></el-icon>
              采纳想法
            </el-button>
            <el-button type="warning" @click="rejectIdea(selectedIdea)">
              <el-icon><Close /></el-icon>
              拒绝想法
            </el-button>
          </template>

          <template v-if="selectedIdea && selectedIdea.status === 'adopted' && !selectedIdea.project_id">
            <el-button type="primary" @click="transformToProject(selectedIdea)">
              <el-icon><MagicStick /></el-icon>
              AI转化为项目
            </el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <!-- 拒绝想法对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝想法"
      width="500px"
    >
      <div class="reject-form">
        <p>确定要拒绝想法 "{{ rejectingIdea?.title }}" 吗？</p>
        <el-form>
          <el-form-item label="拒绝原因">
            <el-input
              v-model="rejectReason"
              type="textarea"
              :rows="4"
              placeholder="请输入拒绝原因（可选）"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelReject">取消</el-button>
          <el-button type="warning" @click="confirmReject">
            确认拒绝
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Download, Delete, View, Check, Close, MagicStick,
  Star, ArrowDown, ArrowUp
} from '@element-plus/icons-vue'
import axios from '../../utils/axios'
import { renderMarkdown } from '../../utils/markdownRenderer'

// 响应式数据
const ideas = ref([])
const ideasLoading = ref(false)
const ideaSearch = ref('')
const ideaStatusFilter = ref('')
const sortBy = ref('vote_count')
const sortOrder = ref('desc')
const selectedIdeas = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const totalIdeas = ref(0)

// 对话框状态
const ideaDetailDialogVisible = ref(false)
const selectedIdea = ref(null)
const rejectDialogVisible = ref(false)
const rejectingIdea = ref(null)
const rejectReason = ref('')

// 计算属性
const filteredIdeas = computed(() => {
  let filtered = ideas.value

  // 搜索过滤
  if (ideaSearch.value) {
    const searchTerm = ideaSearch.value.toLowerCase()
    filtered = filtered.filter(idea =>
      idea.title.toLowerCase().includes(searchTerm) ||
      idea.description.toLowerCase().includes(searchTerm)
    )
  }

  // 状态过滤
  if (ideaStatusFilter.value) {
    filtered = filtered.filter(idea => idea.status === ideaStatusFilter.value)
  }

  return filtered
})

// 方法
const fetchIdeas = async () => {
  ideasLoading.value = true
  try {
    const response = await axios.get('/api/ideas', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        sortBy: sortBy.value,
        order: sortOrder.value,
        status: 'all'
      }
    })

    ideas.value = response.data.ideas
    totalIdeas.value = response.data.pagination.count
  } catch (error) {
    console.error('获取想法列表失败:', error)
    ElMessage.error('获取想法列表失败')
  } finally {
    ideasLoading.value = false
  }
}

const handleIdeaSearch = () => {
  // 搜索在客户端过滤，不需要重新请求
}

const handleIdeaFilter = () => {
  // 状态过滤在客户端过滤，不需要重新请求
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  fetchIdeas()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchIdeas()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchIdeas()
}

const handleIdeaSelectionChange = (selection) => {
  selectedIdeas.value = selection
}

const viewIdeaDetail = async (idea) => {
  try {
    const response = await axios.get(`/api/ideas/${idea.id}`)
    selectedIdea.value = response.data.idea
    ideaDetailDialogVisible.value = true
  } catch (error) {
    console.error('获取想法详情失败:', error)
    ElMessage.error('获取想法详情失败')
  }
}

const closeIdeaDetailDialog = () => {
  ideaDetailDialogVisible.value = false
  selectedIdea.value = null
}

const adoptIdea = async (idea) => {
  try {
    await ElMessageBox.confirm(
      `确定要采纳想法 "${idea.title}" 吗？`,
      '确认采纳',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await axios.post(`/api/ideas/${idea.id}/adopt`)
    ElMessage.success('想法采纳成功')

    // 刷新列表
    fetchIdeas()

    // 如果详情对话框开着，也更新
    if (selectedIdea.value && selectedIdea.value.id === idea.id) {
      viewIdeaDetail(idea)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('采纳想法失败:', error)
      ElMessage.error('采纳想法失败')
    }
  }
}

const rejectIdea = (idea) => {
  rejectingIdea.value = idea
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const cancelReject = () => {
  rejectDialogVisible.value = false
  rejectingIdea.value = null
  rejectReason.value = ''
}

const confirmReject = async () => {
  try {
    await axios.post(`/api/ideas/${rejectingIdea.value.id}/reject`, {
      reason: rejectReason.value
    })

    ElMessage.success('想法已拒绝')
    rejectDialogVisible.value = false

    // 刷新列表
    fetchIdeas()

    // 如果详情对话框开着，也更新
    if (selectedIdea.value && selectedIdea.value.id === rejectingIdea.value.id) {
      viewIdeaDetail(rejectingIdea.value)
    }

    rejectingIdea.value = null
    rejectReason.value = ''
  } catch (error) {
    console.error('拒绝想法失败:', error)
    ElMessage.error('拒绝想法失败')
  }
}

const transformToProject = async (idea) => {
  try {
    await ElMessageBox.confirm(
      `确定要将想法 "${idea.title}" 转化为AI项目吗？这个过程可能需要一些时间。`,
      '确认AI转化',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.info('正在进行AI转化，请稍等...')

    const response = await axios.post(`/api/ideas/${idea.id}/transform-to-project`)

    ElMessage.success(`AI转化成功！项目ID: ${response.data.project_id}`)

    // 刷新列表
    fetchIdeas()

    // 如果详情对话框开着，也更新
    if (selectedIdea.value && selectedIdea.value.id === idea.id) {
      viewIdeaDetail(idea)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('AI转化失败:', error)
      ElMessage.error('AI转化失败: ' + (error.response?.data?.message || error.message))
    }
  }
}

const deleteIdea = async (idea) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除想法 "${idea.title}" 吗？此操作不可逆。`,
      '确认删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    // 这里需要实现删除API
    // await axios.delete(`/api/ideas/${idea.id}`)
    ElMessage.success('想法已删除')
    fetchIdeas()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除想法失败:', error)
      ElMessage.error('删除想法失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedIdeas.value.length === 0) {
    ElMessage.warning('请选择要删除的想法')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIdeas.value.length} 个想法吗？此操作不可逆。`,
      '确认批量删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    // 这里需要实现批量删除API
    ElMessage.success(`已删除 ${selectedIdeas.value.length} 个想法`)
    selectedIdeas.value = []
    fetchIdeas()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

const exportIdeas = () => {
  // 实现导出功能
  ElMessage.info('导出功能开发中...')
}

const viewProject = (projectId) => {
  // 跳转到项目详情页
  window.open(`/project/${projectId}`, '_blank')
}

const getStatusName = (status) => {
  const statusMap = {
    pending: '待审核',
    adopted: '已采纳',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchIdeas()
})
</script>

<style lang="scss" scoped>
.tab-content {
  padding: 20px;
}

.ideas-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;

  .toolbar-left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .toolbar-right {
    display: flex;
    gap: 12px;
  }
}

.ideas-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.idea-title-cell {
  .idea-desc {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #666;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.author-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .author-name {
    font-size: 13px;
  }
}

.vote-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;

  small {
    color: #666;
  }
}

.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.status-tag {
  &.pending {
    background-color: #ffd04b;
    color: #ad6800;
  }

  &.adopted {
    background-color: #67c23a;
    color: white;
  }

  &.rejected {
    background-color: #f56c6c;
    color: white;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.idea-detail {
  .idea-header {
    border-bottom: 1px solid #eee;
    padding-bottom: 16px;
    margin-bottom: 20px;

    h2 {
      margin: 0 0 8px 0;
    }

    .idea-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .vote-info {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #666;
      }
    }
  }

  .idea-content {
    .description-section,
    .content-section,
    .author-section,
    .adoption-section,
    .project-section {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 8px 0;
        color: #333;
      }
    }

    .markdown-content {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #409eff;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .author-details {
        .author-name {
          font-weight: 500;
        }

        .submit-time {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }
}

.reject-form {
  p {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .ideas-toolbar {
    flex-direction: column;
    gap: 12px;

    .toolbar-left,
    .toolbar-right {
      width: 100%;
      justify-content: space-between;
    }
  }

  .action-buttons {
    .el-button {
      padding: 4px 8px;
      font-size: 12px;
    }
  }
}
</style>
