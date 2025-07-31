import { marked } from 'marked'
import hljs from 'highlight.js'

// 配置 marked 的基本选项
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (__) {}
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

// 图片文件扩展名
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']

// 视频文件扩展名
const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v']

/**
 * 从URL中获取文件扩展名
 * @param {string} url - 文件URL
 * @returns {string} 文件扩展名（小写）
 */
function getFileExtension(url) {
  try {
    // 移除查询参数和锚点
    const cleanUrl = url.split('?')[0].split('#')[0]
    const parts = cleanUrl.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  } catch (error) {
    return ''
  }
}

/**
 * 判断URL是否为图片
 * @param {string} url - 文件URL
 * @returns {boolean}
 */
function isImageUrl(url) {
  const extension = getFileExtension(url)
  return imageExtensions.includes(extension)
}

/**
 * 判断URL是否为视频
 * @param {string} url - 文件URL
 * @returns {boolean}
 */
function isVideoUrl(url) {
  const extension = getFileExtension(url)
  return videoExtensions.includes(extension)
}

/**
 * 创建图片HTML标签
 * @param {string} title - 图片标题
 * @param {string} url - 图片URL
 * @param {Object} i18nTexts - 国际化文本
 * @returns {string} HTML字符串
 */
function createImageHtml(title, url, i18nTexts = {}) {
  return `<div class="markdown-media-container markdown-image-container">
    <img src="${url}" alt="${title}" title="${title}" class="markdown-image" loading="lazy" />
    ${title ? `<div class="markdown-media-caption">${title}</div>` : ''}
  </div>`
}

/**
 * 创建视频HTML标签
 * @param {string} title - 视频标题
 * @param {string} url - 视频URL
 * @param {Object} i18nTexts - 国际化文本
 * @returns {string} HTML字符串
 */
function createVideoHtml(title, url, i18nTexts = {}) {
  const videoNotSupported = i18nTexts.videoNotSupported || '您的浏览器不支持视频播放。'
  return `<div class="markdown-media-container markdown-video-container">
    <video controls class="markdown-video" preload="metadata">
      <source src="${url}" type="video/${getFileExtension(url)}">
      ${videoNotSupported}
    </video>
    ${title ? `<div class="markdown-media-caption">${title}</div>` : ''}
  </div>`
}

/**
 * 自定义markdown链接渲染器
 * @param {string} href - 链接地址
 * @param {string} title - 链接标题
 * @param {string} text - 链接文本
 * @param {Object} i18nTexts - 国际化文本
 * @returns {string} HTML字符串
 */
function customLinkRenderer(href, title, text, i18nTexts = {}) {
  // 安全检查：确保URL是有效的
  if (!href || typeof href !== 'string') {
    const invalidLink = i18nTexts.invalidLink || '无效链接'
    return `<span class="markdown-invalid-link">[${text}](${invalidLink})</span>`
  }

  // 检查是否为图片链接
  if (isImageUrl(href)) {
    return createImageHtml(text, href, i18nTexts)
  }

  // 检查是否为视频链接
  if (isVideoUrl(href)) {
    return createVideoHtml(text, href, i18nTexts)
  }

  // 普通链接，添加安全属性
  const titleAttr = title ? ` title="${title}"` : ''
  const isExternal = !href.startsWith('/') && !href.startsWith('#')
  const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
  
  return `<a href="${href}"${titleAttr}${externalAttrs}>${text}</a>`
}

/**
 * 安全处理HTML内容，移除危险标签
 * @param {string} html - HTML内容
 * @returns {string} 清理后的HTML
 */
function sanitizeHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

/**
 * 渲染增强的markdown内容
 * @param {string} content - markdown内容
 * @param {Object} options - 渲染选项
 * @param {Object} options.i18nTexts - 国际化文本
 * @param {string} options.i18nTexts.videoNotSupported - 视频不支持的文本
 * @param {string} options.i18nTexts.invalidLink - 无效链接的文本
 * @returns {string} 渲染后的HTML
 */
export function renderEnhancedMarkdown(content, options = {}) {
  if (!content || typeof content !== 'string') {
    return ''
  }

  try {
    // 提取国际化文本
    const i18nTexts = options.i18nTexts || {}
    
    // 创建marked实例并配置自定义渲染器
    const renderer = new marked.Renderer()
    
    // 自定义链接渲染器，传入国际化文本
    renderer.link = (href, title, text) => customLinkRenderer(href, title, text, i18nTexts)

    // 移除i18nTexts从options中，避免传递给marked
    const { i18nTexts: _, ...markedOptions } = options

    // 渲染markdown
    const html = marked(content, { 
      renderer,
      ...markedOptions 
    })

    // 安全清理HTML
    return sanitizeHtml(html)
  } catch (error) {
    console.error('Enhanced markdown渲染失败:', error)
    return content
  }
}

/**
 * 获取媒体文件信息
 * @param {string} url - 文件URL
 * @returns {Object} 媒体文件信息
 */
export function getMediaInfo(url) {
  return {
    isImage: isImageUrl(url),
    isVideo: isVideoUrl(url),
    extension: getFileExtension(url),
    isMedia: isImageUrl(url) || isVideoUrl(url)
  }
}

/**
 * 创建带有国际化支持的markdown渲染函数
 * @param {Function} t - Vue i18n的翻译函数
 * @returns {Function} 渲染函数
 */
export function createI18nMarkdownRenderer(t) {
  return (content, options = {}) => {
    const i18nTexts = {
      videoNotSupported: t('markdown.media.video_not_supported'),
      invalidLink: t('markdown.media.invalid_link'),
      imageLoadingError: t('markdown.media.image_loading_error'),
      videoLoadingError: t('markdown.media.video_loading_error'),
      ...options.i18nTexts
    }

    return renderEnhancedMarkdown(content, {
      ...options,
      i18nTexts
    })
  }
}

// 为了向后兼容，提供 renderMarkdown 别名
export const renderMarkdown = renderEnhancedMarkdown

export default {
  renderEnhancedMarkdown,
  renderMarkdown,
  getMediaInfo,
  isImageUrl,
  isVideoUrl,
  createI18nMarkdownRenderer
}