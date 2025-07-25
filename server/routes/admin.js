const express = require('express');
const db = require('../config/database');
const router = express.Router();

// 中间件：检查管理员权限
const requireAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.is_admin) {
    return next();
  }
  res.status(403).json({ message: '需要管理员权限' });
};

// 获取系统统计信息
router.get('/stats', requireAdmin, (req, res) => {
  const statsQueries = [
    // 项目统计
    new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(progress) as avg_progress
        FROM projects 
        GROUP BY status
      `, (err, projectStats) => {
        if (err) reject(err);
        else resolve({ projectStats });
      });
    }),
    
    // 用户统计
    new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_users,
          SUM(is_admin) as admin_count,
          COUNT(*) - SUM(is_admin) as regular_users
        FROM users
      `, (err, userStats) => {
        if (err) reject(err);
        else resolve({ userStats });
      });
    }),
    
    // 评论统计
    new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_comments,
          COUNT(DISTINCT user_id) as active_commenters
        FROM comments
      `, (err, commentStats) => {
        if (err) reject(err);
        else resolve({ commentStats });
      });
    }),
    
    // 最近活动
    new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COUNT(*) as recent_projects
        FROM projects 
        WHERE created_at >= datetime('now', '-7 days')
      `, (err, recentActivity) => {
        if (err) reject(err);
        else resolve({ recentActivity });
      });
    })
  ];
  
  Promise.all(statsQueries)
    .then(results => {
      const stats = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      res.json(stats);
    })
    .catch(err => {
      console.error('获取统计信息错误:', err);
      res.status(500).json({ message: '获取统计信息失败' });
    });
});

// 获取所有用户列表
router.get('/users', requireAdmin, (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  
  let sql = `
    SELECT 
      id, username, email, display_name, avatar_url, 
      is_admin, created_at, github_id, google_id,
      (SELECT COUNT(*) FROM comments WHERE user_id = users.id) as comment_count
    FROM users
    WHERE 1=1
  `;
  
  const params = [];
  
  if (search) {
    sql += ' AND (username LIKE ? OR email LIKE ? OR display_name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const offset = (page - 1) * limit;
  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  db.all(sql, params, (err, users) => {
    if (err) {
      console.error('获取用户列表错误:', err);
      return res.status(500).json({ message: '获取用户列表失败' });
    }
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countSql += ' AND (username LIKE ? OR email LIKE ? OR display_name LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    db.get(countSql, countParams, (countErr, countResult) => {
      if (countErr) {
        console.error('获取用户总数错误:', countErr);
        return res.status(500).json({ message: '获取用户总数失败' });
      }
      
      // 处理用户数据：添加provider字段，转换is_admin为布尔值
      const processedUsers = users.map(user => {
        let provider = 'local';
        if (user.github_id) {
          provider = 'github';
        } else if (user.google_id) {
          provider = 'google';
        }
        
        return {
          ...user,
          provider,
          is_admin: Boolean(user.is_admin), // 转换为布尔值
          // 移除敏感ID字段
          github_id: undefined,
          google_id: undefined
        };
      });
      
      res.json({
        users: processedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// 获取所有评论（管理）
router.get('/comments', requireAdmin, (req, res) => {
  const { page = 1, limit = 20, project_id, user_id } = req.query;
  
  let sql = `
    SELECT 
      c.id, c.content, c.created_at,
      c.project_id, p.title as project_title,
      u.id as user_id, u.username, u.display_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN projects p ON c.project_id = p.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (project_id) {
    sql += ' AND c.project_id = ?';
    params.push(project_id);
  }
  
  if (user_id) {
    sql += ' AND c.user_id = ?';
    params.push(user_id);
  }
  
  sql += ' ORDER BY c.created_at DESC';
  
  const offset = (page - 1) * limit;
  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  db.all(sql, params, (err, comments) => {
    if (err) {
      console.error('获取评论列表错误:', err);
      return res.status(500).json({ message: '获取评论列表失败' });
    }
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM comments c WHERE 1=1';
    const countParams = [];
    
    if (project_id) {
      countSql += ' AND c.project_id = ?';
      countParams.push(project_id);
    }
    
    if (user_id) {
      countSql += ' AND c.user_id = ?';
      countParams.push(user_id);
    }
    
    db.get(countSql, countParams, (countErr, countResult) => {
      if (countErr) {
        console.error('获取评论总数错误:', countErr);
        return res.status(500).json({ message: '获取评论总数失败' });
      }
      
      res.json({
        comments: comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          project: {
            id: comment.project_id,
            title: comment.project_title
          },
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
    });
  });
});

// 删除评论（管理员）
router.delete('/comments/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('删除评论错误:', err);
      return res.status(500).json({ message: '删除评论失败' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: '评论不存在' });
    }
    
    res.json({ message: '评论删除成功' });
  });
});

// 更新用户管理员状态
router.put('/users/:id/admin', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { is_admin } = req.body;
  
  // 不能修改自己的管理员状态
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ message: '不能修改自己的管理员状态' });
  }
  
  db.run(
    'UPDATE users SET is_admin = ? WHERE id = ?',
    [is_admin ? 1 : 0, id],
    function(err) {
      if (err) {
        console.error('更新用户管理员状态错误:', err);
        return res.status(500).json({ message: '更新用户状态失败' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      res.json({ message: '用户状态更新成功' });
    }
  );
});

// 批量删除项目
router.delete('/projects/batch', requireAdmin, (req, res) => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: '项目ID列表不能为空' });
  }
  
  const placeholders = ids.map(() => '?').join(',');
  const sql = `DELETE FROM projects WHERE id IN (${placeholders})`;
  
  db.run(sql, ids, function(err) {
    if (err) {
      console.error('批量删除项目错误:', err);
      return res.status(500).json({ message: '批量删除项目失败' });
    }
    
    res.json({ 
      message: `成功删除 ${this.changes} 个项目`,
      deleted_count: this.changes
    });
  });
});

// 数据备份导出
router.get('/export/projects', requireAdmin, (req, res) => {
  db.all('SELECT * FROM projects ORDER BY order_index ASC, created_at DESC', (err, projects) => {
    if (err) {
      console.error('导出项目数据错误:', err);
      return res.status(500).json({ message: '导出项目数据失败' });
    }
    
    res.setHeader('Content-Disposition', 'attachment; filename=ai-projects-backup.json');
    res.setHeader('Content-Type', 'application/json');
    res.json({
      export_date: new Date().toISOString(),
      project_count: projects.length,
      projects: projects.map(project => ({
        ...project,
        tech_stack: project.tech_stack ? project.tech_stack.split(',') : [],
        tags: project.tags ? project.tags.split(',') : []
      }))
    });
  });
});

module.exports = router; 