const express = require('express');
const db = require('../config/database');
const aiService = require('../services/aiService');

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
  console.log('📊 管理员获取系统统计数据...');
  
  const statsQueries = [
    // 项目统计（使用与项目统计接口相同的逻辑）
    new Promise((resolve, reject) => {
      // 总项目数
      db.get('SELECT COUNT(*) as totalProjects FROM projects', (err, totalResult) => {
        if (err) {
          reject(err);
          return;
        }
        
        // 平均进度
        db.get('SELECT AVG(progress) as avgProgress FROM projects', (progressErr, progressResult) => {
          if (progressErr) {
            reject(progressErr);
            return;
          }
          
          resolve({
            totalProjects: totalResult.totalProjects,
            avgProgress: Math.round(progressResult.avgProgress || 0)
          });
        });
      });
    }),

    // 用户统计
    new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as totalUsers,
          SUM(is_admin) as admin_count,
          COUNT(*) - SUM(is_admin) as regular_users
        FROM users
      `, (err, userStats) => {
        if (err) reject(err);
        else resolve({ totalUsers: userStats?.totalUsers || 0 });
      });
    }),

    // 评论统计
    new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as totalComments,
          COUNT(DISTINCT user_id) as active_commenters
        FROM comments
      `, (err, commentStats) => {
        if (err) reject(err);
        else resolve({ totalComments: commentStats?.totalComments || 0 });
      });
    })
  ];

  Promise.all(statsQueries)
    .then(results => {
      const stats = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      
      console.log('✅ 管理员统计数据获取成功:', {
        totalProjects: stats.totalProjects,
        avgProgress: stats.avgProgress,
        totalUsers: stats.totalUsers,
        totalComments: stats.totalComments
      });
      
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
      is_admin, created_at, last_login, phone,
      github_id, google_id, wechat_id, password_hash,
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
        } else if (user.wechat_id) {
          provider = 'wechat';
        }

        return {
          ...user,
          provider,
          is_admin: Boolean(user.is_admin), // 转换为布尔值
          // 保留ID字段用于前端判断认证方式，但不暴露敏感信息
          github_id: user.github_id ? true : null,
          google_id: user.google_id ? true : null,
          wechat_id: user.wechat_id ? true : null,
          password_hash: user.password_hash ? true : null, // 只返回是否有密码的布尔值
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
      c.id, c.content, c.attachments, c.created_at,
      c.validity_status, c.validity_score, c.validity_reason, c.checked_at, c.ai_model,
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
        comments: comments.map(comment => {
          // 解析附件数据
          let parsedAttachments = { images: [], videos: [] };
          try {
            if (comment.attachments) {
              parsedAttachments = JSON.parse(comment.attachments);
            }
          } catch (e) {
            console.warn('解析附件数据失败:', e);
          }

          return {
            id: comment.id,
            content: comment.content,
            attachments: parsedAttachments,
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
          };
        }),
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

// 重置用户密码
router.put('/users/:id/password', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ message: '密码长度至少6位' });
  }

  // 获取用户信息确认用户存在
  db.get('SELECT id, username FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      console.error('查询用户错误:', err);
      return res.status(500).json({ message: '查询用户失败' });
    }

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 生成新的盐值和密码哈希
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(new_password + salt, 10);

    db.run(
      'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?',
      [hash, salt, id],
      function(updateErr) {
        if (updateErr) {
          console.error('更新密码错误:', updateErr);
          return res.status(500).json({ message: '更新密码失败' });
        }

        res.json({ message: `用户 ${user.username} 的密码重置成功` });
      }
    );
  });
});

// 删除用户
router.delete('/users/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  // 不能删除自己
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ message: '不能删除自己的账户' });
  }

  // 检查用户是否存在
  db.get('SELECT username FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      console.error('查询用户错误:', err);
      return res.status(500).json({ message: '查询用户失败' });
    }

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 开始事务，删除用户及其相关数据
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // 删除用户的评论
      db.run('DELETE FROM comments WHERE user_id = ?', [id], (commentErr) => {
        if (commentErr) {
          console.error('删除用户评论错误:', commentErr);
          db.run('ROLLBACK');
          return res.status(500).json({ message: '删除用户评论失败' });
        }

        // 删除用户
        db.run('DELETE FROM users WHERE id = ?', [id], function(userErr) {
          if (userErr) {
            console.error('删除用户错误:', userErr);
            db.run('ROLLBACK');
            return res.status(500).json({ message: '删除用户失败' });
          }

          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              console.error('提交事务错误:', commitErr);
              return res.status(500).json({ message: '删除操作失败' });
            }

            res.json({ message: `用户 ${user.username} 删除成功` });
          });
        });
      });
    });
  });
});

// 重新检测评论有效性（管理）
router.post('/comments/:id/revalidate', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // 获取评论内容
    db.get('SELECT content FROM comments WHERE id = ?', [id], async (err, comment) => {
      if (err) {
        console.error('获取评论错误:', err);
        return res.status(500).json({ message: '获取评论失败' });
      }

      if (!comment) {
        return res.status(404).json({ message: '评论不存在' });
      }

      try {
        // 进行AI检测
        const validation = await aiService.validateCommentWithAI(comment.content, 'zh');

        // 更新检测结果
        const updateSql = `
          UPDATE comments 
          SET validity_status = ?, validity_score = ?, validity_reason = ?, 
              checked_at = ?, ai_model = ?
          WHERE id = ?
        `;

        const now = new Date().toISOString();
        const model = aiService.isOpenAIAvailable ? 'gpt-3.5-turbo' : null;

        db.run(updateSql, [
          validation.status,
          validation.score,
          validation.reason,
          now,
          model,
          id
        ], function(updateErr) {
          if (updateErr) {
            console.error('更新检测结果错误:', updateErr);
            return res.status(500).json({ message: '更新检测结果失败' });
          }

          res.json({
            message: '重新检测完成',
            validation: {
              status: validation.status,
              score: validation.score,
              reason: validation.reason,
              checked_at: now
            }
          });
        });

      } catch (aiError) {
        console.error('AI检测失败:', aiError);
        res.status(500).json({ message: 'AI检测失败: ' + aiError.message });
      }
    });
  } catch (error) {
    console.error('重新检测评论错误:', error);
    res.status(500).json({ message: '重新检测评论失败' });
  }
});

// 批量检测评论有效性（管理）
router.post('/comments/batch-validate', requireAdmin, async (req, res) => {
  const { status = 'pending', limit = 10 } = req.body;

  try {
    // 获取需要检测的评论
    const sql = `
      SELECT id, content 
      FROM comments 
      WHERE validity_status = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    db.all(sql, [status, limit], async (err, comments) => {
      if (err) {
        console.error('获取待检测评论错误:', err);
        return res.status(500).json({ message: '获取待检测评论失败' });
      }

      if (comments.length === 0) {
        return res.json({ message: '没有需要检测的评论', processed: 0 });
      }

      let processed = 0;
      let failed = 0;

      // 并发处理评论检测（限制并发数为3）
      const batchSize = 3;
      for (let i = 0; i < comments.length; i += batchSize) {
        const batch = comments.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map(async (comment) => {
            try {
              const validation = await aiService.validateCommentWithAI(comment.content, 'zh');

              return new Promise((resolve, reject) => {
                const updateSql = `
                  UPDATE comments 
                  SET validity_status = ?, validity_score = ?, validity_reason = ?, 
                      checked_at = ?, ai_model = ?
                  WHERE id = ?
                `;

                const now = new Date().toISOString();
                const model = aiService.isOpenAIAvailable ? 'gpt-3.5-turbo' : null;

                db.run(updateSql, [
                  validation.status,
                  validation.score,
                  validation.reason,
                  now,
                  model,
                  comment.id
                ], function(updateErr) {
                  if (updateErr) {
                    failed++;
                    reject(updateErr);
                  } else {
                    processed++;
                    resolve();
                  }
                });
              });
            } catch (error) {
              failed++;
              throw error;
            }
          })
        );
      }

      res.json({
        message: '批量检测完成',
        processed,
        failed,
        total: comments.length
      });
    });
  } catch (error) {
    console.error('批量检测评论错误:', error);
    res.status(500).json({ message: '批量检测评论失败' });
  }
});

module.exports = router;
