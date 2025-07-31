import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { showNotification } from '../utils/notification'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'AI项目看板 - 一年100个AI产品挑战' }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/Projects.vue'),
    meta: { title: 'AI项目列表' }
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: () => import('../views/ProjectDetail.vue'),
    meta: { title: '项目详情' }
  },
  {
    path: '/ideas',
    name: 'Ideas',
    component: () => import('../views/Ideas.vue'),
    meta: { title: '想法征集' }
  },
  {
    path: '/idea/:id',
    name: 'IdeaDetail',
    component: () => import('../views/IdeaDetail.vue'),
    meta: { title: '想法详情' }
  },
  {
    path: '/project/:id/history',
    name: 'ProjectHistory',
    component: () => import('../views/ProjectHistory.vue'),
    meta: { title: '项目进展历史' }
  },
  {
    path: '/global-history',
    name: 'GlobalHistory',
    component: () => import('../views/GlobalHistory.vue'),
    meta: { title: '全局项目进展' }
  },
  {
    path: '/resume',
    name: 'PublicResume',
    component: () => import('../views/PublicResume.vue'),
    meta: { title: '简历' }
  },
  {
    path: '/my-resume',
    name: 'MyResume',
    component: () => import('../views/Resume.vue'),
    meta: { 
      title: '编辑简历',
      requiresAuth: true
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { 
      title: '管理后台',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: '关于挑战' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - AI项目看板` : 'AI项目看板'
  
  // 记录之前的认证状态
  const wasAuthenticated = authStore.isAuthenticated
  
  // 如果还没有检查过身份验证状态，先检查
  if (!authStore.hasCheckedAuth) {
    await authStore.checkAuthStatus()
  }
  
  // 检查是否刚刚完成登录（第三方登录成功的情况）
  if (!wasAuthenticated && authStore.isAuthenticated && !from.name) {
    // 如果之前未登录，现在已登录，且没有来源页面（直接访问），说明是第三方登录回调
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('userLoggedIn', { 
        detail: { user: authStore.user, isThirdPartyLogin: true } 
      }))
    }, 1500)
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
          showNotification.warning('请先登录后再访问此页面', '需要登录')
    next('/login')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
          showNotification.error('您没有管理员权限，无法访问此页面', '权限不足')
    next('/')
    return
  }
  
  next()
})

export default router 