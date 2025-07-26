import { createI18n } from 'vue-i18n'
import zh from './zh.js'
import en from './en.js'

// 从localStorage获取语言设置，默认为中文
const getStoredLanguage = () => {
  const stored = localStorage.getItem('language')
  return stored || 'zh'
}

// 创建i18n实例
const i18n = createI18n({
  legacy: false, // 使用Composition API
  locale: getStoredLanguage(),
  fallbackLocale: 'zh',
  globalInjection: true, // 全局注入$t
  messages: {
    zh,
    en
  }
})

// 切换语言函数
export const switchLanguage = (lang) => {
  i18n.global.locale.value = lang
  localStorage.setItem('language', lang)
  
  // 更新HTML lang属性
  document.documentElement.lang = lang
  
  // 更新页面标题（如果需要）
  const route = window.location.pathname
  updatePageTitle(route, lang)
}

// 更新页面标题
const updatePageTitle = (route, lang) => {
  const titleMap = {
    '/': i18n.global.t('title.home'),
    '/projects': i18n.global.t('title.projects'),
    '/admin': i18n.global.t('title.admin'),
    '/login': i18n.global.t('title.login'),
    '/about': i18n.global.t('title.about')
  }
  
  const title = titleMap[route] || i18n.global.t('title.home')
  document.title = title
}

// 获取当前语言
export const getCurrentLanguage = () => {
  return i18n.global.locale.value
}

// 获取支持的语言列表
export const getSupportedLanguages = () => {
  return [
    { code: 'zh', name: '中文', nativeName: '中文' },
    { code: 'en', name: 'English', nativeName: 'English' }
  ]
}

export default i18n 