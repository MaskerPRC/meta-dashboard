const { createOSSClient, validateFile, generateFileName, getUploadPath } = require('../config/cos');
const { v4: uuidv4 } = require('uuid');

// OSS客户端实例
let ossClient = null;

// 初始化OSS客户端
function initOSSClient() {
  if (!ossClient) {
    ossClient = createOSSClient();
  }
  return ossClient;
}

// 上传图片到OSS
async function uploadImage(file) {
  const client = initOSSClient();
  if (!client) {
    throw new Error('OSS服务未配置');
  }
  
  // 验证文件
  const validation = validateFile(file, 'image');
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  try {
    // 生成文件名
    const fileName = generateFileName(file.originalname, 'images');
    const uploadPath = getUploadPath('images') + fileName;
    
    // 上传到OSS
    const result = await client.put(uploadPath, file.buffer);
    
    return {
      id: uuidv4(),
      filename: file.originalname,
      url: result.url,
      size: file.size,
      type: file.mimetype,
      width: null, // 可以后续添加图片尺寸检测
      height: null
    };
  } catch (error) {
    console.error('图片上传失败:', error);
    throw new Error('图片上传失败：' + error.message);
  }
}

// 上传视频到OSS
async function uploadVideo(file) {
  const client = initOSSClient();
  if (!client) {
    throw new Error('OSS服务未配置');
  }
  
  // 验证文件
  const validation = validateFile(file, 'video');
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  try {
    // 生成文件名
    const fileName = generateFileName(file.originalname, 'videos');
    const uploadPath = getUploadPath('videos') + fileName;
    
    // 上传视频到OSS
    const result = await client.put(uploadPath, file.buffer);
    
    // 生成缩略图（如果需要的话）
    let thumbnailUrl = null;
    try {
      thumbnailUrl = await generateVideoThumbnail(file, client);
    } catch (thumbError) {
      console.warn('生成视频缩略图失败:', thumbError);
    }
    
    return {
      id: uuidv4(),
      filename: file.originalname,
      url: result.url,
      thumbnail: thumbnailUrl,
      size: file.size,
      type: file.mimetype,
      duration: null // 可以后续添加视频时长检测
    };
  } catch (error) {
    console.error('视频上传失败:', error);
    throw new Error('视频上传失败：' + error.message);
  }
}

// 生成视频缩略图（简化版，仅返回null）
async function generateVideoThumbnail(file, client) {
  // 暂时返回null，后续可以实现ffmpeg缩略图生成
  return null;
}

// 批量上传文件
async function uploadFiles(files) {
  const results = {
    images: [],
    videos: [],
    errors: []
  };
  
  if (!files || files.length === 0) {
    return results;
  }
  
  for (const file of files) {
    try {
      if (file.mimetype.startsWith('image/')) {
        const result = await uploadImage(file);
        results.images.push(result);
      } else if (file.mimetype.startsWith('video/')) {
        const result = await uploadVideo(file);
        results.videos.push(result);
      } else {
        results.errors.push({
          filename: file.originalname,
          error: '不支持的文件类型'
        });
      }
    } catch (error) {
      results.errors.push({
        filename: file.originalname,
        error: error.message
      });
    }
  }
  
  return results;
}

// 删除OSS文件
async function deleteFile(url) {
  const client = initOSSClient();
  if (!client) {
    console.warn('OSS服务未配置，无法删除文件');
    return false;
  }
  
  try {
    // 从URL中提取文件路径
    const urlObj = new URL(url);
    const filePath = urlObj.pathname.substring(1); // 移除开头的 '/'
    
    await client.delete(filePath);
    return true;
  } catch (error) {
    console.error('删除文件失败:', error);
    return false;
  }
}

module.exports = {
  uploadImage,
  uploadVideo,
  uploadFiles,
  deleteFile,
  initOSSClient
}; 