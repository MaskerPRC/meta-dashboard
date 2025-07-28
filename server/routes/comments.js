const express = require('express');
const db = require('../config/database');
const aiService = require('../services/aiService');

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

// 获取项目的所有评论 (原有路径)
router.get('/project/:projectId', (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  // 根据用户权限决定是否过滤无效评论
  // 如果用户未登录或不是管理员，则只显示有效评论（包括未检测的评论）
  const isAdmin = req.isAuthenticated() && req.user && req.user.is_admin;
  const validityFilter = isAdmin ? '' : " AND (c.validity_status IS NULL OR c.validity_status != 'invalid')";
  
  const sql = `
    SELECT 
      c.id, c.content, c.attachments, c.created_at,
      c.validity_status, c.validity_score, c.validity_reason, c.checked_at,
      u.id as user_id, u.username, u.display_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.project_id = ?${validityFilter}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const offset = (page - 1) * limit;

  db.all(sql, [projectId, parseInt(limit), offset], (err, comments) => {
    if (err) {
      console.error('获取评论列表错误:', err);
      return res.status(500).json({ message: '获取评论列表失败' });
    }

    // 获取评论总数（根据用户权限决定是否过滤无效评论）
    const countSql = `SELECT COUNT(*) as total FROM comments c WHERE c.project_id = ?${validityFilter}`;
    db.get(
      countSql,
      [projectId],
      (countErr, countResult) => {
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

// 添加评论（需要登录）- 带LLM有效性检测
router.post('/', requireAuth, (req, res) => {
  const { project_id, content, attachments } = req.body;
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

    // 处理附件数据
    let attachmentsStr = '{"images":[],"videos":[]}';
    if (attachments && typeof attachments === 'object') {
      try {
        attachmentsStr = JSON.stringify(attachments);
      } catch (e) {
        console.warn('附件数据格式错误:', e);
      }
    }

    // 先进行LLM有效性检测
    const trimmedContent = content.trim();

    // 异步进行AI检测，不阻塞评论创建
    let validationPromise = Promise.resolve({
      isValid: true,
      score: 75, // 默认分数
      reason: '未进行AI检测',
      status: 'pending'
    });

    // 如果AI服务可用，则进行检测
    if (aiService.isOpenAIAvailable) {
      validationPromise = aiService.validateCommentWithAI(trimmedContent, 'zh')
        .catch(error => {
          console.warn('AI检测失败，使用默认值:', error.message);
          return {
            isValid: true,
            score: 75,
            reason: `AI检测失败: ${error.message}`,
            status: 'error'
          };
        });
    }

    // 获取检测结果并保存评论
    validationPromise.then(validation => {
      const sql = `
        INSERT INTO comments (
          project_id, user_id, content, attachments,
          validity_status, validity_score, validity_reason, checked_at, ai_model
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();
      const model = aiService.isOpenAIAvailable ? 'gpt-3.5-turbo' : null;

      db.run(sql, [
        project_id,
        user_id,
        trimmedContent,
        attachmentsStr,
        validation.status,
        validation.score,
        validation.reason,
        now,
        model
      ], function(err) {
        if (err) {
          console.error('添加评论错误:', err);
          return res.status(500).json({ message: '添加评论失败' });
        }

        // 返回新创建的评论（带用户信息和检测结果）
        const selectSql = `
          SELECT 
            c.id, c.content, c.attachments, c.created_at,
            c.validity_status, c.validity_score, c.validity_reason, c.checked_at,
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

          // 解析附件数据
          let parsedAttachments = { images: [], videos: [] };
          try {
            if (newComment.attachments) {
              parsedAttachments = JSON.parse(newComment.attachments);
            }
          } catch (e) {
            console.warn('解析附件数据失败:', e);
          }

          res.status(201).json({
            message: '评论添加成功',
            comment: {
              id: newComment.id,
              content: newComment.content,
              attachments: parsedAttachments,
              created_at: newComment.created_at,
                             validity_status: newComment.validity_status,
               validity_score: newComment.validity_score,
               validity_reason: newComment.validity_reason,
               checked_at: newComment.checked_at,
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
     }).catch(error => {
       console.error('评论处理错误:', error);
       res.status(500).json({ message: '评论处理失败' });
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

// 获取指定项目的所有评论 (兼容前端路径 /:projectId) - 这个路由必须放在最后
router.get('/:projectId', (req, res) => {
  const { projectId } = req.params;

  // 如果参数不是数字，可能是其他路由，应该返回404
  if (!/^\d+$/.test(projectId)) {
    return res.status(404).json({ message: '接口不存在' });
  }

  const { page = 1, limit = 20 } = req.query;

  // 根据用户权限决定是否过滤无效评论
  // 如果用户未登录或不是管理员，则只显示有效评论（包括未检测的评论）
  const isAdmin = req.isAuthenticated() && req.user && req.user.is_admin;
  const validityFilter = isAdmin ? '' : " AND (c.validity_status IS NULL OR c.validity_status != 'invalid')";

  const sql = `
    SELECT 
      c.id, c.content, c.attachments, c.created_at,
      u.id as user_id, u.username, u.display_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.project_id = ?${validityFilter}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const offset = (page - 1) * limit;

  db.all(sql, [projectId, parseInt(limit), offset], (err, comments) => {
    if (err) {
      console.error('获取评论列表错误:', err);
      return res.status(500).json({ message: '获取评论列表失败' });
    }

    // 获取评论总数（根据用户权限决定是否过滤无效评论）
    const countSql = `SELECT COUNT(*) as total FROM comments c WHERE c.project_id = ?${validityFilter}`;
    db.get(
      countSql,
      [projectId],
      (countErr, countResult) => {
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
      }
    );
  });
});

// 为指定项目添加评论（兼容前端路径 /:projectId） - 这个路由必须放在最后
router.post('/:projectId', requireAuth, (req, res) => {
  const { projectId } = req.params;

  // 如果参数不是数字，可能是其他路由，应该返回404
  if (!/^\d+$/.test(projectId)) {
    return res.status(404).json({ message: '接口不存在' });
  }

  const { content, attachments } = req.body;
  const user_id = req.user.id;
  const project_id = projectId; // 从路径参数获取项目ID

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

    // 处理附件数据
    let attachmentsStr = '{"images":[],"videos":[]}';
    if (attachments && typeof attachments === 'object') {
      try {
        attachmentsStr = JSON.stringify(attachments);
      } catch (e) {
        console.warn('附件数据格式错误:', e);
      }
    }

    // 添加评论
    const sql = `
      INSERT INTO comments (project_id, user_id, content, attachments)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [project_id, user_id, content.trim(), attachmentsStr], function(err) {
      if (err) {
        console.error('添加评论错误:', err);
        return res.status(500).json({ message: '添加评论失败' });
      }

      // 返回新创建的评论（带用户信息）
      const selectSql = `
        SELECT 
          c.id, c.content, c.attachments, c.created_at,
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

        // 解析附件数据
        let parsedAttachments = { images: [], videos: [] };
        try {
          if (newComment.attachments) {
            parsedAttachments = JSON.parse(newComment.attachments);
          }
        } catch (e) {
          console.warn('解析附件数据失败:', e);
        }

        res.status(201).json({
          message: '评论添加成功',
          comment: {
            id: newComment.id,
            content: newComment.content,
            attachments: parsedAttachments,
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

module.exports = router;
