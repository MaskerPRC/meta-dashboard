require('dotenv').config();
const OSS = require('ali-oss');

// 阿里云OSS配置
const ossConfig = {
  region: process.env.ALICLOUD_OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.ALICLOUD_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALICLOUD_ACCESS_KEY_SECRET,
  bucket: process.env.ALICLOUD_OSS_BUCKET || 'meta-dashboard',
  secure: true, // 使用HTTPS
  endpoint: process.env.ALICLOUD_OSS_ENDPOINT || undefined // 可选：自定义域名
};

// 创建OSS客户端
function createOSSClient() {
  if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret) {
    console.warn('⚠️ 阿里云OSS配置不完整，文件上传功能将不可用');
    return null;
  }
  
  try {
    const client = new OSS(ossConfig);
    console.log('✅ 阿里云OSS客户端初始化成功');
    return client;
  } catch (error) {
    console.error('❌ 阿里云OSS客户端初始化失败:', error);
    return null;
  }
}

// 文件配置
const fileConfig = {
  // 支持的图片格式
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  
  // 支持的视频格式
  allowedVideoTypes: ['video/mp4', 'video/webm'],
  
  // 文件大小限制 (bytes)
  maxImageSize: 5 * 1024 * 1024,  // 5MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  
  // 上传路径配置
  uploadPaths: {
    images: 'comments/images/',
    videos: 'comments/videos/',
    thumbnails: 'comments/thumbnails/'
  }
};

// 验证文件类型和大小
function validateFile(file, type) {
  if (!file) {
    return { valid: false, error: '文件不能为空' };
  }
  
  const isImage = type === 'image';
  const allowedTypes = isImage ? fileConfig.allowedImageTypes : fileConfig.allowedVideoTypes;
  const maxSize = isImage ? fileConfig.maxImageSize : fileConfig.maxVideoSize;
  
  // 检查文件类型
  if (!allowedTypes.includes(file.mimetype)) {
    return { 
      valid: false, 
      error: `不支持的${isImage ? '图片' : '视频'}格式，支持格式：${allowedTypes.join(', ')}` 
    };
  }
  
  // 检查文件大小
  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / 1024 / 1024);
    return { 
      valid: false, 
      error: `${isImage ? '图片' : '视频'}大小不能超过${sizeMB}MB` 
    };
  }
  
  return { valid: true };
}

// 生成文件名
function generateFileName(originalName, type) {
  const { v4: uuidv4 } = require('uuid');
  const ext = originalName.split('.').pop().toLowerCase();
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // 只取UUID的第一部分
  
  return `${timestamp}-${uuid}.${ext}`;
}

// 获取文件存储路径
function getUploadPath(type) {
  return fileConfig.uploadPaths[type] || 'comments/files/';
}

module.exports = {
  createOSSClient,
  ossConfig,
  fileConfig,
  validateFile,
  generateFileName,
  getUploadPath
}; 