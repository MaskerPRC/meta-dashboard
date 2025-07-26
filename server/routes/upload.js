const express = require('express');
const multer = require('multer');
const { uploadFiles } = require('../services/uploadService');
const router = express.Router();

// 中间件：检查是否登录
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: '需要登录才能上传文件' });
};

// 配置multer - 使用内存存储
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // 最多10个文件
  },
  fileFilter: (req, file, cb) => {
    // 检查文件类型
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

// 处理multer错误的中间件
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: '文件大小超过限制（最大50MB）' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: '上传文件数量超过限制（最多10个）' });
    }
    return res.status(400).json({ message: '文件上传错误：' + error.message });
  }
  
  if (error.message === '不支持的文件类型') {
    return res.status(400).json({ message: '不支持的文件类型，支持：jpg, png, gif, webp, mp4, webm' });
  }
  
  next(error);
};

// 文件上传接口
router.post('/', requireAuth, upload.array('files', 10), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '没有选择文件' });
    }

    console.log(`📁 用户 ${req.user.username} 上传 ${req.files.length} 个文件`);

    // 上传文件到OSS
    const results = await uploadFiles(req.files);

    // 统计结果
    const totalUploaded = results.images.length + results.videos.length;
    const totalErrors = results.errors.length;

    res.json({
      message: `成功上传 ${totalUploaded} 个文件${totalErrors > 0 ? `，${totalErrors} 个文件上传失败` : ''}`,
      data: {
        images: results.images,
        videos: results.videos,
        errors: results.errors,
        summary: {
          total: req.files.length,
          success: totalUploaded,
          failed: totalErrors
        }
      }
    });

  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({ message: '文件上传失败：' + error.message });
  }
});

// 获取上传配置信息
router.get('/config', (req, res) => {
  res.json({
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/webm'],
    allowedExtensions: {
      images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      videos: ['mp4', 'webm']
    }
  });
});

module.exports = router; 