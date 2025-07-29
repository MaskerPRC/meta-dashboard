/**
 * 微信浏览器检测和公众号相关工具函数
 */

/**
 * 检测是否在微信浏览器中
 * @returns {boolean} 是否在微信浏览器中
 */
export function isWechatBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
}

/**
 * 检测是否在微信内置浏览器中（排除企业微信等）
 * @returns {boolean} 是否在微信内置浏览器中
 */
export function isWechatMobileBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger') && !ua.includes('wxwork');
}

/**
 * 获取微信公众号授权URL
 * @param {string} appid 公众号AppID
 * @param {string} redirectUri 回调地址
 * @param {string} scope 授权作用域 snsapi_base|snsapi_userinfo
 * @param {string} state 状态参数
 * @returns {string} 授权URL
 */
export function getWechatMpAuthUrl(appid, redirectUri, scope = 'snsapi_userinfo', state = '') {
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
}

/**
 * 从URL中获取微信授权code
 * @returns {string|null} 授权code或null
 */
export function getWechatCodeFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
}

/**
 * 从URL中获取微信授权state
 * @returns {string|null} 状态参数或null
 */
export function getWechatStateFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('state');
}

/**
 * 清除URL中的微信授权参数
 */
export function clearWechatAuthParams() {
  const url = new URL(window.location);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  window.history.replaceState({}, document.title, url.toString());
}

/**
 * 检测当前URL是否包含微信授权回调参数
 * @returns {boolean} 是否包含授权参数
 */
export function hasWechatAuthParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('code') && urlParams.has('state');
}