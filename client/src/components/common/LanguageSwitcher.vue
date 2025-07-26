<template>
  <el-dropdown 
    trigger="click" 
    @command="handleLanguageChange"
    class="language-switcher"
  >
    <el-button text class="language-btn">
      <el-icon><Globe /></el-icon>
      <span class="language-text">{{ currentLanguageName }}</span>
      <el-icon class="arrow-icon"><ArrowDown /></el-icon>
    </el-button>
    
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item 
          v-for="lang in supportedLanguages" 
          :key="lang.code"
          :command="lang.code"
          :class="{ 'is-active': currentLanguage === lang.code }"
        >
          <span class="language-option">
            {{ lang.nativeName }}
          </span>
          <el-icon v-if="currentLanguage === lang.code" class="check-icon">
            <Check />
          </el-icon>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Globe, ArrowDown, Check } from '@element-plus/icons-vue'
import { switchLanguage, getCurrentLanguage, getSupportedLanguages } from '../../locales/index.js'

const { t } = useI18n()

// 当前语言
const currentLanguage = computed(() => getCurrentLanguage())

// 支持的语言列表
const supportedLanguages = getSupportedLanguages()

// 当前语言显示名称
const currentLanguageName = computed(() => {
  const current = supportedLanguages.find(lang => lang.code === currentLanguage.value)
  return current ? current.nativeName : '中文'
})

// 处理语言切换
const handleLanguageChange = (langCode) => {
  if (langCode !== currentLanguage.value) {
    switchLanguage(langCode)
  }
}
</script>

<style scoped>
.language-switcher {
  margin-left: 8px;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  color: var(--el-text-color-primary);
  transition: all 0.3s ease;
}

.language-btn:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.language-text {
  font-size: 14px;
  font-weight: 500;
}

.arrow-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.language-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 100px;
}

.check-icon {
  color: var(--el-color-primary);
  font-size: 14px;
}

.is-active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .language-btn {
    color: var(--el-text-color-primary);
  }
  
  .language-btn:hover {
    background-color: var(--el-color-primary-dark-2);
  }
}
</style> 