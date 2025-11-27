<template>
  <div class="project-header ai-card">
    <div class="header-main">
      <div class="title-section">
        <h1 class="project-title">{{ project.title }}</h1>
        <p class="project-description">{{ project.description }}</p>
      </div>
      
      <div class="status-section">
        <el-tag :class="['status-tag', project.status]" size="large">
          {{ getStatusName(project.status) }}
        </el-tag>
        <el-tag :class="['priority-tag', project.priority]" size="large">
          {{ getPriorityName(project.priority) }}
        </el-tag>
      </div>
    </div>

    <!-- 项目元信息 -->
    <div class="project-meta">
      <div class="meta-item">
        <span class="meta-label">{{ $t('project.created_at') }}：</span>
        <span class="meta-value">{{ formatDate(project.created_at) }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">{{ $t('project.updated_at') }}：</span>
        <span class="meta-value">{{ formatDate(project.updated_at) }}</span>
      </div>
    </div>

    <!-- 项目链接 -->
    <div class="project-links">
      <!-- 进展历史链接（始终显示） -->
      <router-link 
        :to="`/project/${project.id}/history`"
        class="link-card history-link"
      >
        <div class="link-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="link-content">
          <div class="link-title">{{ $t('project.progress_history') }}</div>
          <div class="link-desc">{{ $t('project.view_development_timeline') }}</div>
        </div>
        <div class="link-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </router-link>

      <a 
        v-if="project.github_repo" 
        :href="project.github_repo" 
        target="_blank" 
        class="link-card github-link"
      >
        <div class="link-icon">
          <el-icon><Link /></el-icon>
        </div>
        <div class="link-content">
          <div class="link-title">{{ $t('project.github_repo') }}</div>
          <div class="link-desc">{{ $t('project.view_source_code') }}</div>
        </div>
        <div class="link-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </a>

      <a 
        v-for="(link, index) in demoLinks"
        :key="`demo-${index}`"
        :href="link.url" 
        target="_blank" 
        class="link-card demo-link"
      >
        <div class="link-icon">
          <el-icon><View /></el-icon>
        </div>
        <div class="link-content">
          <div class="link-title">{{ link.title }}</div>
          <div class="link-desc">{{ getDemoLinkDescription(link, demoLinks.length) }}</div>
        </div>
        <div class="link-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </a>
    </div>

    <!-- 技术栈 -->
    <div v-if="project.tech_stack && project.tech_stack.length" class="tech-stack">
      <h3>{{ $t('project.tech_stack_label') }}</h3>
      <div class="tech-tags">
        <el-tag 
          v-for="tech in project.tech_stack" 
          :key="tech" 
          class="tech-tag"
        >
          {{ tech }}
        </el-tag>
      </div>
    </div>

    <!-- 管理员操作 -->
    <div v-if="isAdmin" class="admin-actions">
      <el-button type="primary" @click="$emit('edit-project')">
        <el-icon><Edit /></el-icon>
        {{ $t('project.edit_project') }}
      </el-button>
      <el-button type="danger" @click="$emit('delete-project')">
        <el-icon><Delete /></el-icon>
        {{ $t('project.delete_project') }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { Clock, Link, View, ArrowRight, Edit, Delete } from '@element-plus/icons-vue'
import { parseDemoLinks, getDemoLinkTitle, getDemoLinkDescription } from '@/utils/demoLinks'

const { t } = useI18n()

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit-project', 'delete-project'])

// 解析演示链接
const demoLinks = computed(() => {
  const links = parseDemoLinks(props.project.demo_url)
  return links.map(link => ({
    ...link,
    title: getDemoLinkTitle(link)
  }))
})

const getStatusName = (status) => {
  const statusMap = {
    idea: 'brainstorming',
    planning: 'planning',
    development: 'development',
    testing: 'testing',
    completed: 'completed',
    deployed: 'deployed',
    maintenance: 'deployed'
  }
  const translationKey = statusMap[status] || 'brainstorming'
  return t(`project.status_options.${translationKey}`)
}

const getPriorityName = (priority) => {
  const priorityMap = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    urgent: 'urgent'
  }
  const translationKey = priorityMap[priority] || 'medium'
  return t(`project.priority_options.${translationKey}`)
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
.project-header {
  margin-bottom: 24px;
  padding: 32px;

  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .title-section {
      flex: 1;

      .project-title {
        font-size: 28px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--el-text-color-primary);
      }

      .project-description {
        font-size: 16px;
        color: var(--el-text-color-regular);
        margin: 0;
        line-height: 1.6;
      }
    }

    .status-section {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }
  }

  .project-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
    padding: 20px;
    background: var(--el-bg-color-page);
    border-radius: 8px;

    .meta-item {
      display: flex;
      align-items: center;

      .meta-label {
        font-weight: 500;
        color: var(--el-text-color-regular);
        margin-right: 8px;
      }

      .meta-value {
        color: var(--el-text-color-primary);
      }
    }
  }

  .project-links {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;

    .link-card {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 20px;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 10px;
        padding: 2px;
        background: linear-gradient(135deg, transparent, transparent);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: exclude;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        transition: all 0.3s ease;
      }

      .link-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        margin-right: 16px;
        font-size: 20px;
        transition: all 0.3s ease;
      }

      .link-content {
        flex: 1;

        .link-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
          transition: all 0.3s ease;
        }

        .link-desc {
          font-size: 14px;
          opacity: 0.8;
          transition: all 0.3s ease;
        }
      }

      .link-arrow {
        display: flex;
        align-items: center;
        font-size: 16px;
        opacity: 0.6;
        transform: translateX(-8px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      &.history-link {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, var(--ai-bg-primary) 100%);
        border-color: rgba(99, 102, 241, 0.2);

        &::before {
          background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
        }

        .link-icon {
          background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
          color: white;
        }

        .link-title {
          color: var(--ai-primary);
        }

        .link-desc {
          color: var(--ai-text-secondary);
        }

        .link-arrow {
          color: var(--ai-primary);
        }

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(99, 102, 241, 0.15);
          border-color: var(--ai-primary);

          &::before {
            background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
          }

          .link-icon {
            transform: scale(1.1);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
          }

          .link-arrow {
            opacity: 1;
            transform: translateX(0);
          }
        }
      }

      &.github-link {
        background: linear-gradient(135deg, rgba(107, 114, 126, 0.05) 0%, var(--ai-bg-primary) 100%);
        border-color: rgba(107, 114, 126, 0.2);

        &::before {
          background: linear-gradient(135deg, var(--ai-text-primary), var(--ai-text-secondary));
        }

        .link-icon {
          background: linear-gradient(135deg, var(--ai-text-primary), var(--ai-text-secondary));
          color: white;
        }

        .link-title {
          color: var(--ai-text-primary);
        }

        .link-desc {
          color: var(--ai-text-secondary);
        }

        .link-arrow {
          color: var(--ai-text-primary);
        }

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(107, 114, 126, 0.15);
          border-color: var(--ai-text-primary);

          &::before {
            background: linear-gradient(135deg, var(--ai-text-primary), var(--ai-text-secondary));
          }

          .link-icon {
            transform: scale(1.1);
            box-shadow: 0 8px 24px rgba(107, 114, 126, 0.3);
          }

          .link-arrow {
            opacity: 1;
            transform: translateX(0);
          }
        }
      }

      &.demo-link {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--ai-bg-primary) 100%);
        border-color: rgba(16, 185, 129, 0.2);

        &::before {
          background: linear-gradient(135deg, var(--ai-success), var(--ai-accent));
        }

        .link-icon {
          background: linear-gradient(135deg, var(--ai-success), var(--ai-accent));
          color: white;
        }

        .link-title {
          color: var(--ai-success);
        }

        .link-desc {
          color: var(--ai-text-secondary);
        }

        .link-arrow {
          color: var(--ai-success);
        }

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.15);
          border-color: var(--ai-success);

          &::before {
            background: linear-gradient(135deg, var(--ai-success), var(--ai-accent));
          }

          .link-icon {
            transform: scale(1.1);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
          }

          .link-arrow {
            opacity: 1;
            transform: translateX(0);
          }
        }
      }
    }
  }

  .tech-stack {
    margin-bottom: 24px;

    h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .tech-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .tech-tag {
        background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
        color: white;
        border: none;
      }
    }
  }

  .admin-actions {
    display: flex;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .project-header {
    padding: 20px;

    .header-main {
      flex-direction: column;
      gap: 16px;

      .status-section {
        align-self: flex-start;
      }
    }

    .project-meta {
      grid-template-columns: 1fr;
    }

    .project-links {
      flex-direction: column;

      .link-card {
        .link-icon {
          width: 40px;
          height: 40px;
          margin-right: 12px;
          font-size: 18px;
        }

        .link-content {
          .link-title {
            font-size: 15px;
          }

          .link-desc {
            font-size: 13px;
          }
        }
      }
    }

    .admin-actions {
      flex-direction: column;
    }
  }
}
</style>
