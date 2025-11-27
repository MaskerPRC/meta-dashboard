<template>
  <el-dropdown 
    trigger="click" 
    @command="handleLanguageChange"
    class="language-switcher"
  >
    <button class="neo-language-btn">
      <i class="fa-solid fa-globe text-lg"></i>
      <span class="language-text">{{ currentLanguageName }}</span>
      <i class="fa-solid fa-chevron-down text-xs"></i>
    </button>
    
    <template #dropdown>
      <el-dropdown-menu class="neo-dropdown-menu">
        <el-dropdown-item 
          v-for="lang in supportedLanguages" 
          :key="lang.code"
          :command="lang.code"
          :class="{ 'is-active': currentLanguage === lang.code }"
        >
          <span class="language-option">
            {{ lang.nativeName }}
          </span>
          <i v-if="currentLanguage === lang.code" class="fa-solid fa-check check-icon"></i>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { switchLanguage, getCurrentLanguage, getSupportedLanguages } from '../../locales/index.js'

const { t } = useI18n()

// 当前语言
const currentLanguage = computed(() => getCurrentLanguage())

// 支持的语言列表
const supportedLanguages = getSupportedLanguages()

// 当前语言显示名称
const currentLanguageName = computed(() => {
  const current = supportedLanguages.find(lang => lang.code === currentLanguage.value)
  return current ? current.nativeName : t('language.chinese')
})

// 处理语言切换
const handleLanguageChange = (langCode) => {
  if (langCode !== currentLanguage.value) {
    switchLanguage(langCode)
  }
}
</script>

<style lang="scss" scoped>
.language-switcher {
  margin-left: 0;
}

.neo-language-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 2px solid black;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  color: black;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: 2px 2px 0 0 black;

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 0 black;
    background: #f3f4f6;
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 0 black;
  }
}

.language-text {
  font-size: 14px;
  font-weight: 700;
}

:deep(.neo-dropdown-menu) {
  border: 3px solid black;
  border-radius: 0;
  box-shadow: 4px 4px 0 0 black;
  padding: 4px;
  background: white;

  .el-dropdown-menu__item {
    padding: 10px 16px;
    font-weight: 700;
    border-radius: 0;
    margin-bottom: 2px;

    &:hover {
      background: #f3f4f6;
    }

    &.is-active {
      background: #fef3c7;
      color: black;
    }
  }
}

.language-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 100px;
}

.check-icon {
  color: black;
  font-size: 14px;
  font-weight: 700;
}
</style> 