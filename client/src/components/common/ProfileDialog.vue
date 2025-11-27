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
    class="profile-dialog"
  >
    <div class="profile-content">
      <p class="text-center text-gray-600 mb-6 font-medium">{{ $t('auth.profile_subtitle') }}</p>
      
      <el-tabs v-model="activeTab" class="profile-tabs">
        <!-- 基本信息 -->
        <el-tab-pane :label="$t('auth.update_profile')" name="profile">
          <div class="tab-content-wrapper">
            <el-form 
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              class="profile-form"
            >
              <div class="form-group mb-4">
                <label class="block text-sm font-bold mb-2">{{ $t('auth.display_name') }}</label>
                <div class="relative">
                  <input
                    v-model="profileForm.display_name"
                    type="text"
                    :placeholder="$t('auth.display_name_placeholder')"
                    maxlength="50"
                    class="w-full bg-gray-100 border-2 border-black px-4 py-3 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                  />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                    {{ profileForm.display_name.length }}/50
                  </span>
                </div>
              </div>
              
              <div class="form-group mb-4">
                <label class="block text-sm font-bold mb-2">{{ $t('auth.email') }}</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  :placeholder="$t('auth.email_placeholder')"
                  class="w-full bg-gray-100 border-2 border-black px-4 py-3 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                />
              </div>
              
              <div class="form-group mb-4">
                <label class="block text-sm font-bold mb-2">{{ $t('auth.username') }}</label>
                <input
                  :value="authStore.user?.username"
                  disabled
                  class="w-full bg-gray-200 border-2 border-gray-400 px-4 py-3 rounded font-bold cursor-not-allowed"
                />
                <div class="text-xs text-gray-500 mt-1 font-bold">{{ $t('auth.username_immutable') }}</div>
              </div>
            </el-form>
          </div>
        </el-tab-pane>
        
        <!-- 修改密码 -->
        <el-tab-pane :label="$t('auth.update_password')" name="password">
          <div class="tab-content-wrapper">
            <el-form 
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              class="password-form"
            >
              <div class="form-group mb-4">
                <label class="block text-sm font-bold mb-2">{{ $t('auth.current_password') }}</label>
                <div class="relative">
                  <input
                    v-model="passwordForm.current_password"
                    type="password"
                    :placeholder="$t('auth.current_password_placeholder')"
                    class="w-full bg-gray-100 border-2 border-black px-4 py-3 pr-10 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                  />
                  <i class="fa-solid fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                </div>
              </div>
              
              <div class="form-group mb-4">
                <label class="block text-sm font-bold mb-2">{{ $t('auth.new_password') }}</label>
                <div class="relative">
                  <input
                    v-model="passwordForm.new_password"
                    type="password"
                    :placeholder="$t('auth.new_password_placeholder')"
                    class="w-full bg-gray-100 border-2 border-black px-4 py-3 pr-10 rounded font-bold focus:outline-none focus:ring-0 focus:bg-white"
                  />
                  <i class="fa-solid fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                </div>
              </div>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <template #footer>
      <div class="dialog-footer flex gap-4 justify-end">
        <button 
          @click="handleClose"
          class="neo-btn bg-white px-6 py-3 hover:bg-gray-100"
        >
          {{ $t('form.cancel') }}
        </button>
        <button 
          @click="handleSubmit"
          :disabled="authStore.loading"
          class="neo-btn bg-black text-white px-6 py-3 hover:bg-gray-800 disabled:opacity-50"
        >
          {{ activeTab === 'profile' ? $t('auth.update_profile') : $t('auth.update_password') }}
        </button>
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
    { required: true, message: t('auth.display_name_placeholder'), trigger: 'blur' },
    { min: 1, max: 50, message: t('auth.validation.display_name_length'), trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: t('auth.validation.email_invalid'), trigger: 'blur' }
  ]
}

// 密码验证规则
const passwordRules = {
  current_password: [
    { required: true, message: t('auth.current_password_placeholder'), trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: t('auth.new_password_placeholder'), trigger: 'blur' },
    { min: 6, message: t('auth.validation.password_min'), trigger: 'blur' }
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

  :deep(.el-dialog__footer) {
    padding: 20px 24px;
    border-top: 3px solid black;
  }
}

.profile-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-weight: 700;
    color: #666;
    border: 2px solid transparent;
    border-radius: 6px;
    margin-right: 4px;

    &.is-active {
      color: black;
      background: #f3f4f6;
      border-color: black;
    }
  }

  :deep(.el-tabs__active-bar) {
    display: none;
  }

  :deep(.el-tab-pane) {
    min-height: 300px;
  }
}

.tab-content-wrapper {
  padding: 0 20px;
  width: 100%;
}

.profile-form,
.password-form {
  padding: 0;
  margin: 0;
}
</style>
