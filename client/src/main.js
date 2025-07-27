import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import i18n from './locales'
import './style/global.scss'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
app.use(pinia)
app.use(i18n)
app.use(router)
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000,
})

// 应用启动时检查认证状态
const authStore = useAuthStore()
authStore.checkAuthStatus().then(() => {
  app.mount('#app')
}) 