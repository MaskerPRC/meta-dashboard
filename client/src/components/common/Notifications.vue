<template>
  <div class="notifications-container">
    <!-- Element Plus的消息组件会自动处理 -->
  </div>
</template>

<script setup>
// 这个组件主要用于全局消息配置
// Element Plus的ElMessage会自动处理消息显示
</script>

<style lang="scss">
// 自定义Element Plus消息样式
.el-message {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  &.el-message--success {
    background-color: #f0f9ff;
    border-color: #0ea5e9;
    color: #0c4a6e;
  }
  
  &.el-message--warning {
    background-color: #fffbeb;
    border-color: #f59e0b;
    color: #92400e;
  }
  
  &.el-message--error {
    background-color: #fef2f2;
    border-color: #ef4444;
    color: #991b1b;
  }
}
</style> 