<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="$t('auth.profile_title')"
    width="500px"
    :before-close="handleClose"
    center
    :z-index="3000"
    :append-to-body="true"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    destroy-on-close
  >
    <div class="profile-dialog">
      <p class="profile-subtitle">{{ $t('auth.profile_subtitle') }}</p>
      
      <el-tabs v-model="activeTab" class="profile-tabs">
        <!-- 基本信息 -->
        <el-tab-pane :label="$t('auth.update_profile')" name="profile">
          <el-form 
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item :label="$t('auth.display_name')" prop="display_name">
              <el-input
                v-model="profileForm.display_name"
                :placeholder="$t('auth.display_name_placeholder')"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item :label="$t('auth.email')" prop="email">
              <el-input
                v-model="profileForm.email"
                :placeholder="$t('auth.email_placeholder')"
                type="email"
              />
            </el-form-item>
            
            <el-form-item :label="$t('auth.username')">
              <el-input
                :value="authStore.user?.username"
                disabled
                class="disabled-input"
              />
              <div class="form-tip">用户名不可修改</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 修改密码 -->
        <el-tab-pane :label="$t('auth.update_password')" name="password">
          <el-form 
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            class="password-form"
          >
            <el-form-item :label="$t('auth.current_password')" prop="current_password">
              <el-input
                v-model="passwordForm.current_password"
                :placeholder="$t('auth.current_password_placeholder')"
                type="password"
                show-password
              />
            </el-form-item>
            
            <el-form-item :label="$t('auth.new_password')" prop="new_password">
              <el-input
                v-model="passwordForm.new_password"
                :placeholder="$t('auth.new_password_placeholder')"
                type="password"
                show-password
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ $t('form.cancel') }}</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="authStore.loading"
        >
          {{ activeTab === 'profile' ? $t('auth.update_profile') : $t('auth.update_password') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()

// Props和Events
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// 当前活跃的标签页
const activeTab = ref('profile')

// 表单引用
const profileFormRef = ref()
const passwordFormRef = ref()

// 个人资料表单
const profileForm = reactive({
  display_name: '',
  email: ''
})

// 密码表单
const passwordForm = reactive({
  current_password: '',
  new_password: ''
})

// 个人资料验证规则
const profileRules = {
  display_name: [
    { required: true, message: '请输入显示名称', trigger: 'blur' },
    { min: 1, max: 50, message: '显示名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 密码验证规则
const passwordRules = {
  current_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 监听弹窗显示，初始化表单数据
watch(() => props.modelValue, (newVal) => {
  if (newVal && authStore.user) {
    profileForm.display_name = authStore.user.display_name || ''
    profileForm.email = authStore.user.email || ''
    activeTab.value = 'profile'
    
    // 重置密码表单
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    
    // 重置表单验证状态
    nextTick(() => {
      profileFormRef.value?.clearValidate()
      passwordFormRef.value?.clearValidate()
    })
  }
})

// 处理提交
const handleSubmit = async () => {
  if (activeTab.value === 'profile') {
    await handleProfileSubmit()
  } else {
    await handlePasswordSubmit()
  }
}

// 提交个人资料
const handleProfileSubmit = async () => {
  try {
    await profileFormRef.value.validate()
    
    const result = await authStore.updateProfile({
      display_name: profileForm.display_name,
      email: profileForm.email
    })
    
    if (result.success) {
      handleClose()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 提交密码修改
const handlePasswordSubmit = async () => {
  try {
    await passwordFormRef.value.validate()
    
    const result = await authStore.changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password
    })
    
    if (result.success) {
      passwordForm.current_password = ''
      passwordForm.new_password = ''
      passwordFormRef.value?.resetFields()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.profile-dialog {
  .profile-subtitle {
    color: var(--ai-text-secondary);
    margin-bottom: 20px;
    text-align: center;
  }
  
  .profile-tabs {
    :deep(.el-tabs__content) {
      padding-top: 20px;
    }
  }
  
  .profile-form,
  .password-form {
    .disabled-input {
      :deep(.el-input__wrapper) {
        background-color: var(--el-disabled-bg-color);
        cursor: not-allowed;
      }
    }
    
    .form-tip {
      font-size: 12px;
      color: var(--ai-text-secondary);
      margin-top: 5px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 暗色主题适配
html.dark {
  .profile-dialog {
    .profile-subtitle {
      color: var(--ai-text-secondary);
    }
  }
}
</style> 