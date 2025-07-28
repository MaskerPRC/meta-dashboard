<template>
  <div class="tab-content">
    <div class="users-toolbar">
      <el-input
        v-model="userSearch"
        :placeholder="t('admin.users.search_placeholder')"
        style="width: 300px"
        clearable
        @input="handleUserSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="users-table-container">
      <el-table
        :data="filteredUsers"
        style="width: 100%"
        v-loading="usersLoading"
        :empty-text="t('admin.users.empty_text')"
      >
        <el-table-column prop="id" :label="t('admin.users.table_headers.id')" width="80" />

        <el-table-column prop="avatar_url" :label="t('admin.users.table_headers.avatar')" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.avatar_url" :size="40">
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>

        <el-table-column prop="username" :label="t('admin.users.table_headers.username')" min-width="120" />

        <el-table-column prop="display_name" :label="t('admin.users.table_headers.display_name')" min-width="120" />

        <el-table-column prop="email" :label="t('admin.users.table_headers.email')" min-width="180" />

        <el-table-column prop="phone" :label="t('admin.users.table_headers.phone')" width="120">
          <template #default="scope">
            {{ scope.row.phone || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="provider" :label="t('admin.users.table_headers.auth_method')" width="100">
          <template #default="scope">
            <el-tag
              :type="getProviderTagType(scope.row)"
              size="small"
            >
              {{ getProviderName(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="is_admin" :label="t('admin.users.table_headers.is_admin')" width="80">
          <template #default="scope">
            <el-switch
              v-model="scope.row.is_admin"
              @change="updateUserAdmin(scope.row)"
              :disabled="scope.row.id === authStore.user?.id"
            />
          </template>
        </el-table-column>

        <el-table-column prop="last_login" :label="t('admin.users.table_headers.last_login')" width="120">
          <template #default="scope">
            {{ scope.row.last_login ? formatDateTime(scope.row.last_login) : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="created_at" :label="t('admin.users.table_headers.created_at')" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column :label="t('admin.users.table_headers.actions')" width="160">
          <template #default="scope">
            <el-button
              v-if="isLocalUser(scope.row)"
              size="small"
              type="primary"
              @click="resetUserPassword(scope.row)"
            >
              {{ t('admin.users.actions.reset_password') }}
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteUser(scope.row)"
              :disabled="scope.row.id === authStore.user?.id"
            >
              {{ t('admin.users.actions.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, User } from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import axios from '../../utils/axios'
import dayjs from 'dayjs'

const { t } = useI18n()
const authStore = useAuthStore()

// 响应式数据
const users = ref([])
const usersLoading = ref(false)
const userSearch = ref('')
const isLoadingUsers = ref(false)

// 事件定义
const emit = defineEmits(['stats-updated'])

// 计算属性
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value

  const search = userSearch.value.toLowerCase()
  return users.value.filter(user =>
    user.username.toLowerCase().includes(search) ||
    user.display_name?.toLowerCase().includes(search) ||
    user.email?.toLowerCase().includes(search)
  )
})

// 方法
const fetchUsers = async () => {
  try {
    usersLoading.value = true
    isLoadingUsers.value = true
    const response = await axios.get('/api/admin/users')

    // 确保is_admin字段为布尔值（兼容性处理）
    users.value = response.data.users.map(user => ({
      ...user,
      is_admin: Boolean(user.is_admin)
    }))
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error(t('admin.users.messages.fetch_failed'))
  } finally {
    usersLoading.value = false
    // 延迟重置标记，确保数据已完全加载并渲染
    setTimeout(() => {
      isLoadingUsers.value = false
    }, 100)
  }
}

const handleUserSearch = () => {
  // 搜索逻辑在计算属性中处理
}

const updateUserAdmin = async (user) => {
  // 如果正在加载用户数据，不执行更新操作
  if (isLoadingUsers.value) {
    return
  }

  try {
    await axios.put(`/api/admin/users/${user.id}/admin`, {
      is_admin: user.is_admin
    })

    ElMessage.success(user.is_admin ? t('admin.users.messages.admin_grant_success') : t('admin.users.messages.admin_revoke_success'))
  } catch (error) {
    console.error('更新用户权限失败:', error)
    ElMessage.error(t('admin.users.messages.admin_update_failed'))
    // 恢复原值
    user.is_admin = !user.is_admin
  }
}

const getProviderName = (user) => {
  if (user.password_hash) return t('admin.users.auth_methods.local')
  if (user.github_id) return t('admin.users.auth_methods.github')
  if (user.google_id) return t('admin.users.auth_methods.google')
  if (user.wechat_id) return t('admin.users.auth_methods.wechat')
  return '未知'
}

const getProviderTagType = (user) => {
  if (user.password_hash) return ''
  if (user.github_id) return 'success'
  if (user.google_id) return 'warning'
  if (user.wechat_id) return 'success'
  return 'info'
}

const isLocalUser = (user) => {
  return Boolean(user.password_hash)
}

const resetUserPassword = async (user) => {
  try {
    await ElMessageBox.prompt(
      t('admin.users.messages.reset_password_prompt'),
      t('admin.users.messages.reset_password_title', { username: user.username }),
      {
        confirmButtonText: t('admin.users.messages.reset_password_confirm'),
        cancelButtonText: t('admin.users.messages.reset_password_cancel'),
        inputType: 'password',
        inputValidator: (value) => {
          if (!value || value.length < 6) {
            return t('admin.users.messages.reset_password_validation')
          }
          return true
        }
      }
    )
    .then(async ({ value }) => {
      await axios.put(`/api/admin/users/${user.id}/password`, {
        new_password: value
      })
      ElMessage.success(t('admin.users.messages.reset_password_success'))
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error(error.response?.data?.message || t('admin.users.messages.reset_password_failed'))
    }
  }
}

const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      t('admin.users.messages.delete_confirm', { username: user.username }),
      t('admin.users.messages.delete_title'),
      {
        confirmButtonText: t('admin.users.actions.delete'),
        cancelButtonText: t('form.cancel'),
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await axios.delete(`/api/admin/users/${user.id}`)

    // 从列表中移除用户
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }

    ElMessage.success(t('admin.users.messages.delete_success'))
    emit('stats-updated')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(error.response?.data?.message || t('admin.users.messages.delete_failed'))
    }
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 暴露方法供父组件调用
defineExpose({
  fetchUsers
})

// 生命周期
onMounted(fetchUsers)
</script>

<style lang="scss" scoped>
.users-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
}

.users-table-container {
  background: var(--ai-bg-primary);
  border-radius: 8px;
  overflow: hidden;
}
</style> 