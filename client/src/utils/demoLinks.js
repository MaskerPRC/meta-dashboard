/**
 * 演示链接处理工具函数
 */

/**
 * 解析多行演示链接文本
 * @param {string} demoUrlText - 多行演示链接文本，用回车分割
 * @returns {Array} 返回解析后的链接数组
 */
export function parseDemoLinks(demoUrlText) {
  if (!demoUrlText || typeof demoUrlText !== 'string') {
    return []
  }
  
  return demoUrlText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((link, index) => {
      // 检查是否包含标题（格式：标题|链接 或 标题 - 链接）
      const titleSeparators = ['|', ' - ', ' — ']
      let title = `演示 ${index + 1}`
      let url = link
      
      for (const separator of titleSeparators) {
        if (link.includes(separator)) {
          const parts = link.split(separator)
          if (parts.length >= 2) {
            title = parts[0].trim()
            url = parts.slice(1).join(separator).trim()
            break
          }
        }
      }
      
      // 验证URL格式
      if (!isValidUrl(url)) {
        return null
      }
      
      return {
        title,
        url,
        index
      }
    })
    .filter(link => link !== null)
}

/**
 * 验证URL格式
 * @param {string} url - 要验证的URL
 * @returns {boolean} 是否为有效URL
 */
function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    // 如果不是完整的URL，检查是否以协议开头
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')
  }
}

/**
 * 格式化演示链接数组为多行文本
 * @param {Array} links - 链接数组
 * @returns {string} 多行文本
 */
export function formatDemoLinksToText(links) {
  if (!Array.isArray(links)) {
    return ''
  }
  
  return links
    .map(link => {
      if (typeof link === 'string') {
        return link
      }
      if (link.title && link.url) {
        return `${link.title}|${link.url}`
      }
      return link.url || ''
    })
    .filter(line => line.length > 0)
    .join('\n')
}

/**
 * 获取演示链接的显示标题
 * @param {Object} link - 链接对象
 * @returns {string} 显示标题
 */
export function getDemoLinkTitle(link) {
  if (link.title && link.title !== `演示 ${link.index + 1}`) {
    return link.title
  }
  return '在线演示'
}

/**
 * 获取演示链接的描述
 * @param {Object} link - 链接对象
 * @param {number} totalCount - 总链接数量
 * @returns {string} 描述文本
 */
export function getDemoLinkDescription(link, totalCount = 1) {
  if (totalCount === 1) {
    return '体验项目效果'
  }
  
  if (link.title && link.title !== `演示 ${link.index + 1}`) {
    return `体验 ${link.title}`
  }
  
  return `体验项目效果 ${link.index + 1}`
}
