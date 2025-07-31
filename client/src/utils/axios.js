import axios from 'axios'
import { showNotification } from './notification'

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  withCredentials: true, // 支持跨域session
  headers: {
    'Content-Type': 'application/json'
  }
})

// 设置全局默认配置，确保所有请求都携带cookie
axios.defaults.withCredentials = true

// 请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response
  },
  error => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          showNotification.error('登录状态已过期，请重新登录', '认证失败')
          break
        case 403:
          showNotification.error('您没有权限访问此资源', '权限不足')
          break
        case 404:
          showNotification.error('请求的资源不存在', '资源未找到')
          break
        case 500:
          showNotification.error('服务器内部错误，请稍后重试', '服务器错误')
          break
        default:
          showNotification.error(data?.message || '请求失败', '请求失败')
      }
    } else if (error.request) {
      showNotification.error('网络连接失败，请检查网络设置', '网络错误')
    } else {
      showNotification.error('请求配置错误', '配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance 