<template>
  <div class="notifications-container">
    <!-- Element Plus的通知组件会自动处理 -->
  </div>
</template>

<script setup>
// 这个组件主要用于全局通知配置
// Element Plus的ElNotification会自动在右下角显示通知
</script>

<style lang="scss">
// 自定义Element Plus通知样式
.el-notification {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--ai-border);
  backdrop-filter: blur(8px);
  margin-bottom: 16px;
  
  .el-notification__title {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 4px;
  }
  
  .el-notification__content {
    font-size: 14px;
    line-height: 1.5;
  }
  
  .el-notification__closeBtn {
    font-size: 16px;
    opacity: 0.6;
    transition: opacity 0.3s ease;
    
    &:hover {
      opacity: 1;
    }
  }
  
  // 成功通知样式
  &.el-notification--success {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-color: #22c55e;
    
    .el-notification__title {
      color: #15803d;
    }
    
    .el-notification__content {
      color: #166534;
    }
    
    .el-notification__icon {
      color: #22c55e;
    }
  }
  
  // 警告通知样式
  &.el-notification--warning {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-color: #f59e0b;
    
    .el-notification__title {
      color: #d97706;
    }
    
    .el-notification__content {
      color: #92400e;
    }
    
    .el-notification__icon {
      color: #f59e0b;
    }
  }
  
  // 错误通知样式
  &.el-notification--error {
    background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
    border-color: #ef4444;
    
    .el-notification__title {
      color: #dc2626;
    }
    
    .el-notification__content {
      color: #991b1b;
    }
    
    .el-notification__icon {
      color: #ef4444;
    }
  }
  
  // 信息通知样式
  &.el-notification--info {
    background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
    border-color: #3b82f6;
    
    .el-notification__title {
      color: #1d4ed8;
    }
    
    .el-notification__content {
      color: #1e40af;
    }
    
    .el-notification__icon {
      color: #3b82f6;
    }
  }
}

// 暗色主题适配
html.dark {
  .el-notification {
    background: var(--ai-bg-secondary) !important;
    border-color: var(--ai-border);
    
    .el-notification__title {
      color: var(--ai-text-primary);
    }
    
    .el-notification__content {
      color: var(--ai-text-secondary);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .el-notification {
    margin: 8px;
    max-width: calc(100vw - 32px);
    
    .el-notification__title {
      font-size: 15px;
    }
    
    .el-notification__content {
      font-size: 13px;
    }
  }
}
</style> 