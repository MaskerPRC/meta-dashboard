<template>
  <WechatGroupDialog
    v-model="showDialog"
    @joined="handleJoined"
    @later="handleLater"
  />
</template>

<script setup>
import { ref } from 'vue'
import WechatGroupDialog from './WechatGroupDialog.vue'

// 弹窗显示状态
const showDialog = ref(false)

// 显示弹窗的方法
const showWechatGroupDialog = () => {
  // 检查是否之前已经处理过
  const hasHandled = localStorage.getItem('wechat_group_dialog_handled')
  if (hasHandled) {
    return
  }
  
  // 延迟一点显示，让登录成功的消息先显示
  setTimeout(() => {
    showDialog.value = true
  }, 1500)
}

// 处理用户已加入群聊
const handleJoined = () => {
  localStorage.setItem('wechat_group_dialog_handled', 'joined')
  localStorage.setItem('wechat_group_dialog_time', Date.now().toString())
}

// 处理用户选择稍后再说
const handleLater = () => {
  localStorage.setItem('wechat_group_dialog_handled', 'later')
  localStorage.setItem('wechat_group_dialog_time', Date.now().toString())
}

// 重置状态（用于测试或重新显示）
const resetDialogStatus = () => {
  localStorage.removeItem('wechat_group_dialog_handled')
  localStorage.removeItem('wechat_group_dialog_time')
}

// 检查是否应该重新显示（比如距离上次拒绝已经过了一周）
const shouldShowAgain = () => {
  const lastTime = localStorage.getItem('wechat_group_dialog_time')
  const status = localStorage.getItem('wechat_group_dialog_handled')
  
  if (!lastTime || status === 'joined') {
    return false
  }
  
  // 如果是稍后再说，7天后可以重新显示
  if (status === 'later') {
    const daysPassed = (Date.now() - parseInt(lastTime)) / (1000 * 60 * 60 * 24)
    return daysPassed >= 7
  }
  
  return false
}

// 检查并可能显示弹窗
const checkAndShowDialog = () => {
  if (shouldShowAgain()) {
    resetDialogStatus()
    showWechatGroupDialog()
  } else if (!localStorage.getItem('wechat_group_dialog_handled')) {
    showWechatGroupDialog()
  }
}

// 暴露方法给父组件使用
defineExpose({
  showWechatGroupDialog: checkAndShowDialog,
  resetDialogStatus
})
</script>