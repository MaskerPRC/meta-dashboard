const express = require('express');
const db = require('../config/database');
const router = express.Router();

// 中间件：检查是否登录
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: '需要登录' });
};

// 中间件：检查管理员权限
const requireAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.is_admin) {
    return next();
  }
  res.status(403).json({ message: '需要管理员权限' });
};

// 获取当前用户的简历
router.get('/my-resume', requireAuth, (req, res) => {
  const userId = req.user.id;
  
  db.get(
    'SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [userId],
    (err, resume) => {
      if (err) {
        console.error('获取用户简历失败:', err);
        return res.status(500).json({ message: '获取简历失败' });
      }
      
      if (!resume) {
        // 如果用户没有简历，返回默认结构
        return res.json({
          message: '用户暂无简历',
          resume: {
            id: null,
            title: '我的简历',
            content: '',
            status: 'draft',
            current_version: 1,
            is_public: false
          }
        });
      }
      
      res.json({
        message: '获取简历成功',
        resume
      });
    }
  );
});

// 创建或更新简历
router.post('/my-resume', requireAuth, (req, res) => {
  const { title, content, status, is_public } = req.body;
  const userId = req.user.id;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: '简历标题不能为空' });
  }
  
  if (title.length > 200) {
    return res.status(400).json({ message: '简历标题不能超过200字符' });
  }
  
  if (content && content.length > 100000) {
    return res.status(400).json({ message: '简历内容不能超过100000字符' });
  }
  
  // 检查状态值
  const validStatuses = ['draft', 'published', 'archived'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: '无效的简历状态' });
  }
  
  // 先检查用户是否已有简历
  db.get(
    'SELECT * FROM resumes WHERE user_id = ?',
    [userId],
    (err, existingResume) => {
      if (err) {
        console.error('检查现有简历失败:', err);
        return res.status(500).json({ message: '检查简历失败' });
      }
      
      const now = new Date().toISOString();
      
      if (existingResume) {
        // 更新现有简历
        const newVersion = existingResume.current_version + 1;
        
        // 先保存当前版本到历史记录
        db.run(
          `INSERT INTO resume_versions (resume_id, version, title, content, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [existingResume.id, existingResume.current_version, existingResume.title, existingResume.content, userId, now],
          function(versionErr) {
            if (versionErr) {
              console.error('保存简历版本失败:', versionErr);
              return res.status(500).json({ message: '保存简历版本失败' });
            }
            
            // 更新主简历
            db.run(
              `UPDATE resumes 
               SET title = ?, content = ?, status = ?, is_public = ?, current_version = ?, updated_at = ?
               WHERE id = ?`,
              [title, content || '', status || existingResume.status, is_public !== undefined ? is_public : existingResume.is_public, newVersion, now, existingResume.id],
              function(updateErr) {
                if (updateErr) {
                  console.error('更新简历失败:', updateErr);
                  return res.status(500).json({ message: '更新简历失败' });
                }
                
                // 返回更新后的简历
                db.get('SELECT * FROM resumes WHERE id = ?', [existingResume.id], (getErr, updatedResume) => {
                  if (getErr) {
                    console.error('获取更新后简历失败:', getErr);
                    return res.status(500).json({ message: '获取更新后简历失败' });
                  }
                  
                  res.json({
                    message: '简历更新成功',
                    resume: updatedResume
                  });
                });
              }
            );
          }
        );
      } else {
        // 创建新简历
        db.run(
          `INSERT INTO resumes (user_id, title, content, status, is_public, current_version, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
          [userId, title, content || '', status || 'draft', is_public || false, now, now],
          function(createErr) {
            if (createErr) {
              console.error('创建简历失败:', createErr);
              return res.status(500).json({ message: '创建简历失败' });
            }
            
            const resumeId = this.lastID;
            
            // 创建第一个版本记录
            db.run(
              `INSERT INTO resume_versions (resume_id, version, title, content, created_by, created_at)
               VALUES (?, 1, ?, ?, ?, ?)`,
              [resumeId, title, content || '', userId, now],
              function(versionErr) {
                if (versionErr) {
                  console.error('创建简历版本失败:', versionErr);
                  // 这里不返回错误，因为主简历已创建成功
                  console.warn('警告：简历创建成功但版本记录创建失败');
                }
                
                // 返回新创建的简历
                db.get('SELECT * FROM resumes WHERE id = ?', [resumeId], (getErr, newResume) => {
                  if (getErr) {
                    console.error('获取新创建简历失败:', getErr);
                    return res.status(500).json({ message: '获取新创建简历失败' });
                  }
                  
                  res.status(201).json({
                    message: '简历创建成功',
                    resume: newResume
                  });
                });
              }
            );
          }
        );
      }
    }
  );
});

// 获取简历的历史版本
router.get('/my-resume/versions', requireAuth, (req, res) => {
  const userId = req.user.id;
  
  // 先获取用户的简历ID
  db.get(
    'SELECT id FROM resumes WHERE user_id = ?',
    [userId],
    (err, resume) => {
      if (err) {
        console.error('获取用户简历ID失败:', err);
        return res.status(500).json({ message: '获取简历ID失败' });
      }
      
      if (!resume) {
        return res.json({
          message: '用户暂无简历',
          versions: []
        });
      }
      
      // 获取版本历史
      db.all(
        `SELECT v.*, u.username as created_by_name 
         FROM resume_versions v 
         LEFT JOIN users u ON v.created_by = u.id 
         WHERE v.resume_id = ? 
         ORDER BY v.version DESC`,
        [resume.id],
        (versionErr, versions) => {
          if (versionErr) {
            console.error('获取简历版本失败:', versionErr);
            return res.status(500).json({ message: '获取简历版本失败' });
          }
          
          res.json({
            message: '获取简历版本成功',
            versions
          });
        }
      );
    }
  );
});

// 获取特定版本的简历内容
router.get('/my-resume/versions/:version', requireAuth, (req, res) => {
  const userId = req.user.id;
  const version = parseInt(req.params.version);
  
  if (isNaN(version) || version < 1) {
    return res.status(400).json({ message: '无效的版本号' });
  }
  
  // 先获取用户的简历ID
  db.get(
    'SELECT id FROM resumes WHERE user_id = ?',
    [userId],
    (err, resume) => {
      if (err) {
        console.error('获取用户简历ID失败:', err);
        return res.status(500).json({ message: '获取简历ID失败' });
      }
      
      if (!resume) {
        return res.status(404).json({ message: '用户暂无简历' });
      }
      
      // 获取特定版本
      db.get(
        `SELECT v.*, u.username as created_by_name 
         FROM resume_versions v 
         LEFT JOIN users u ON v.created_by = u.id 
         WHERE v.resume_id = ? AND v.version = ?`,
        [resume.id, version],
        (versionErr, versionData) => {
          if (versionErr) {
            console.error('获取简历版本失败:', versionErr);
            return res.status(500).json({ message: '获取简历版本失败' });
          }
          
          if (!versionData) {
            return res.status(404).json({ message: '版本不存在' });
          }
          
          res.json({
            message: '获取简历版本成功',
            version: versionData
          });
        }
      );
    }
  );
});

// 删除简历（软删除 - 设为archived状态）
router.delete('/my-resume', requireAuth, (req, res) => {
  const userId = req.user.id;
  
  db.run(
    'UPDATE resumes SET status = ?, updated_at = ? WHERE user_id = ?',
    ['archived', new Date().toISOString(), userId],
    function(err) {
      if (err) {
        console.error('删除简历失败:', err);
        return res.status(500).json({ message: '删除简历失败' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: '简历不存在' });
      }
      
      res.json({ message: '简历删除成功' });
    }
  );
});

// 管理员接口：获取所有用户简历列表
router.get('/admin/all', requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;
  const search = req.query.search;
  
  let whereClause = '';
  let params = [];
  
  if (status) {
    whereClause += ' WHERE r.status = ?';
    params.push(status);
  }
  
  if (search) {
    whereClause += (whereClause ? ' AND' : ' WHERE') + ' (r.title LIKE ? OR u.username LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  const offset = (page - 1) * limit;
  
  // 获取总数
  db.get(
    `SELECT COUNT(*) as total 
     FROM resumes r 
     LEFT JOIN users u ON r.user_id = u.id${whereClause}`,
    params,
    (countErr, countResult) => {
      if (countErr) {
        console.error('获取简历总数失败:', countErr);
        return res.status(500).json({ message: '获取简历总数失败' });
      }
      
      // 获取简历列表
      db.all(
        `SELECT r.*, u.username, u.email, u.display_name 
         FROM resumes r 
         LEFT JOIN users u ON r.user_id = u.id${whereClause}
         ORDER BY r.updated_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset],
        (err, resumes) => {
          if (err) {
            console.error('获取简历列表失败:', err);
            return res.status(500).json({ message: '获取简历列表失败' });
          }
          
          res.json({
            message: '获取简历列表成功',
            data: {
              resumes,
              pagination: {
                page,
                limit,
                total: countResult.total,
                totalPages: Math.ceil(countResult.total / limit)
              }
            }
          });
        }
      );
    }
  );
});

// 管理员接口：查看特定用户的简历详情
router.get('/admin/user/:userId', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (isNaN(userId)) {
    return res.status(400).json({ message: '无效的用户ID' });
  }
  
  db.get(
    `SELECT r.*, u.username, u.email, u.display_name 
     FROM resumes r 
     LEFT JOIN users u ON r.user_id = u.id 
     WHERE r.user_id = ?`,
    [userId],
    (err, resume) => {
      if (err) {
        console.error('获取用户简历失败:', err);
        return res.status(500).json({ message: '获取用户简历失败' });
      }
      
      if (!resume) {
        return res.status(404).json({ message: '用户简历不存在' });
      }
      
      res.json({
        message: '获取用户简历成功',
        resume
      });
    }
  );
});

module.exports = router; 