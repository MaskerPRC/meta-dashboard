const express = require('express');
const db = require('../config/database');
const router = express.Router();

// 中间件：检查是否登录
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: '需要登录才能评论' });
};

// 中间件：检查管理员权限
const requireAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.is_admin) {
    return next();
  }
  res.status(403).json({ message: '需要管理员权限' });
};

// 获取项目的所有评论
router.get('/project/:projectId', (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const sql = `
    SELECT 
      c.id, c.content, c.created_at,
      u.id as user_id, u.username, u.display_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.project_id = ?
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const offset = (page - 1) * limit;
  
  db.all(sql, [projectId, parseInt(limit), offset], (err, comments) => {
    if (err) {
      console.error('获取评论列表错误:', err);
      return res.status(500).json({ message: '获取评论列表失败' });
    }
    
    // 获取评论总数
    db.get(
      'SELECT COUNT(*) as total FROM comments WHERE project_id = ?',
      [projectId],
      (countErr, countResult) => {
        if (countErr) {
          console.error('获取评论总数错误:', countErr);
          return res.status(500).json({ message: '获取评论总数失败' });
        }
        
        res.json({
          comments: comments.map(comment => ({
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            user: {
              id: comment.user_id,
              username: comment.username,
              display_name: comment.display_name,
              avatar_url: comment.avatar_url
            }
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult.total,
            pages: Math.ceil(countResult.total / limit)
          }
        });
      }
    );
  });
});

// 添加评论（需要登录）
router.post('/', requireAuth, (req, res) => {
  const { project_id, content } = req.body;
  const user_id = req.user.id;
  
  if (!project_id || !content) {
    return res.status(400).json({ message: '项目ID和评论内容不能为空' });
  }
  
  if (content.trim().length < 1) {
    return res.status(400).json({ message: '评论内容不能为空' });
  }
  
  if (content.length > 1000) {
    return res.status(400).json({ message: '评论内容不能超过1000字符' });
  }
  
  // 检查项目是否存在
  db.get('SELECT id FROM projects WHERE id = ?', [project_id], (projectErr, project) => {
    if (projectErr) {
      console.error('检查项目存在性错误:', projectErr);
      return res.status(500).json({ message: '检查项目失败' });
    }
    
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    
    // 添加评论
    const sql = `
      INSERT INTO comments (project_id, user_id, content)
      VALUES (?, ?, ?)
    `;
    
    db.run(sql, [project_id, user_id, content.trim()], function(err) {
      if (err) {
        console.error('添加评论错误:', err);
        return res.status(500).json({ message: '添加评论失败' });
      }
      
      // 返回新创建的评论（带用户信息）
      const selectSql = `
        SELECT 
          c.id, c.content, c.created_at,
          u.id as user_id, u.username, u.display_name, u.avatar_url
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `;
      
      db.get(selectSql, [this.lastID], (selectErr, newComment) => {
        if (selectErr) {
          console.error('获取新评论错误:', selectErr);
          return res.status(500).json({ message: '获取新评论失败' });
        }
        
        res.status(201).json({
          message: '评论添加成功',
          comment: {
            id: newComment.id,
            content: newComment.content,
            created_at: newComment.created_at,
            user: {
              id: newComment.user_id,
              username: newComment.username,
              display_name: newComment.display_name,
              avatar_url: newComment.avatar_url
            }
          }
        });
      });
    });
  });
});

// 删除评论（管理员或评论作者）
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const is_admin = req.user.is_admin;
  
  // 检查评论是否存在以及权限
  db.get('SELECT * FROM comments WHERE id = ?', [id], (err, comment) => {
    if (err) {
      console.error('查找评论错误:', err);
      return res.status(500).json({ message: '查找评论失败' });
    }
    
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }
    
    // 检查权限：管理员或评论作者可以删除
    if (!is_admin && comment.user_id !== user_id) {
      return res.status(403).json({ message: '没有权限删除此评论' });
    }
    
    // 删除评论
    db.run('DELETE FROM comments WHERE id = ?', [id], function(deleteErr) {
      if (deleteErr) {
        console.error('删除评论错误:', deleteErr);
        return res.status(500).json({ message: '删除评论失败' });
      }
      
      res.json({ message: '评论删除成功' });
    });
  });
});

// 编辑评论（仅评论作者，30分钟内）
router.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;
  
  if (!content || content.trim().length < 1) {
    return res.status(400).json({ message: '评论内容不能为空' });
  }
  
  if (content.length > 1000) {
    return res.status(400).json({ message: '评论内容不能超过1000字符' });
  }
  
  // 检查评论是否存在以及权限
  db.get('SELECT * FROM comments WHERE id = ?', [id], (err, comment) => {
    if (err) {
      console.error('查找评论错误:', err);
      return res.status(500).json({ message: '查找评论失败' });
    }
    
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }
    
    // 检查是否是评论作者
    if (comment.user_id !== user_id) {
      return res.status(403).json({ message: '只能编辑自己的评论' });
    }
    
    // 检查是否在30分钟内
    const commentTime = new Date(comment.created_at);
    const now = new Date();
    const diffMinutes = (now - commentTime) / (1000 * 60);
    
    if (diffMinutes > 30) {
      return res.status(403).json({ message: '评论发布30分钟后无法编辑' });
    }
    
    // 更新评论
    db.run(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content.trim(), id],
      function(updateErr) {
        if (updateErr) {
          console.error('更新评论错误:', updateErr);
          return res.status(500).json({ message: '更新评论失败' });
        }
        
        // 返回更新后的评论
        const selectSql = `
          SELECT 
            c.id, c.content, c.created_at,
            u.id as user_id, u.username, u.display_name, u.avatar_url
          FROM comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.id = ?
        `;
        
        db.get(selectSql, [id], (selectErr, updatedComment) => {
          if (selectErr) {
            console.error('获取更新评论错误:', selectErr);
            return res.status(500).json({ message: '获取更新评论失败' });
          }
          
          res.json({
            message: '评论更新成功',
            comment: {
              id: updatedComment.id,
              content: updatedComment.content,
              created_at: updatedComment.created_at,
              user: {
                id: updatedComment.user_id,
                username: updatedComment.username,
                display_name: updatedComment.display_name,
                avatar_url: updatedComment.avatar_url
              }
            }
          });
        });
      }
    );
  });
});

// 获取评论统计信息
router.get('/stats/:projectId', (req, res) => {
  const { projectId } = req.params;
  
  const sql = `
    SELECT 
      COUNT(*) as total_comments,
      COUNT(DISTINCT user_id) as unique_commenters
    FROM comments 
    WHERE project_id = ?
  `;
  
  db.get(sql, [projectId], (err, stats) => {
    if (err) {
      console.error('获取评论统计错误:', err);
      return res.status(500).json({ message: '获取评论统计失败' });
    }
    
    res.json(stats);
  });
});

module.exports = router; 