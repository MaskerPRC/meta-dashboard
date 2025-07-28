<template>
  <div class="stats-section">
    <div class="stats-grid">
      <div class="stat-card ai-card">
        <div class="stat-icon projects">
          <el-icon size="32"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.totalProjects }}</div>
          <div class="stat-label">{{ $t('admin.stats.total_projects') }}</div>
        </div>
      </div>

      <div class="stat-card ai-card">
        <div class="stat-icon users">
          <el-icon size="32"><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.totalUsers }}</div>
          <div class="stat-label">{{ $t('admin.stats.total_users') }}</div>
        </div>
      </div>

      <div class="stat-card ai-card">
        <div class="stat-icon comments">
          <el-icon size="32"><ChatDotSquare /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.totalComments }}</div>
          <div class="stat-label">{{ $t('admin.stats.total_comments') }}</div>
        </div>
      </div>

      <div class="stat-card ai-card">
        <div class="stat-icon progress">
          <el-icon size="32"><ArrowUp /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.avgProgress }}%</div>
          <div class="stat-label">{{ $t('admin.stats.average_progress') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Document, User, ChatDotSquare, ArrowUp } from '@element-plus/icons-vue'
import axios from '../../utils/axios'

const { t } = useI18n()

const stats = reactive({
  totalProjects: 0,
  totalUsers: 0,
  totalComments: 0,
  avgProgress: 0
})

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/admin/stats')
    Object.assign(stats, response.data)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(fetchStats)

defineExpose({
  fetchStats
})
</script>

<style lang="scss" scoped>
.stats-section {
  margin-bottom: 32px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;

    .stat-card {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.projects {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        &.users {
          background: linear-gradient(135deg, #f093fb, #f5576c);
          color: white;
        }

        &.comments {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          color: white;
        }

        &.progress {
          background: linear-gradient(135deg, #43e97b, #38f9d7);
          color: white;
        }
      }

      .stat-info {
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--ai-text-primary);
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--ai-text-secondary);
        }
      }
    }
  }
}
</style> 