import { ElNotification } from 'element-plus'

// 统一的通知函数
export const showNotification = {
  success: (message, title = '成功') => {
    ElNotification({
      title,
      message,
      type: 'success',
      position: 'top-left',
      duration: 3000,
      showClose: true
    })
  },

  error: (message, title = '错误') => {
    ElNotification({
      title,
      message,
      type: 'error',
      position: 'top-left',
      duration: 4000,
      showClose: true
    })
  },

  warning: (message, title = '警告') => {
    ElNotification({
      title,
      message,
      type: 'warning',
      position: 'top-left',
      duration: 3500,
      showClose: true
    })
  },

  info: (message, title = '信息') => {
    ElNotification({
      title,
      message,
      type: 'info',
      position: 'top-left',
      duration: 3000,
      showClose: true
    })
  }
}

// 兼容原有的 ElMessage 调用方式
export const ElMessage = showNotification
