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

// 获取全局项目进展历史列表（所有项目）
router.get('/global/all', (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  
  let sql = `
    SELECT ph.*, u.username as creator_name, p.title as project_name, p.title as project_title
    FROM project_history ph
    LEFT JOIN users u ON ph.created_by = u.id
    LEFT JOIN projects p ON ph.project_id = p.id
    WHERE 1=1
  `;
  
  const params = [];
  
  // 类型筛选
  if (type) {
    sql += ' AND ph.type = ?';
    params.push(type);
  }
  
  // 排序
  sql += ' ORDER BY ph.created_at DESC';
  
  // 分页
  const offset = (page - 1) * limit;
  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  db.all(sql, params, (err, histories) => {
    if (err) {
      console.error('获取全局项目历史错误:', err);
      return res.status(500).json({ message: '获取全局项目历史失败' });
    }
    
    // 解析附件JSON
    const processedHistories = histories.map(history => ({
      ...history,
      attachments: history.attachments ? JSON.parse(history.attachments) : []
    }));
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM project_history ph LEFT JOIN projects p ON ph.project_id = p.id WHERE 1=1';
    const countParams = [];
    
    if (type) {
      countSql += ' AND ph.type = ?';
      countParams.push(type);
    }
    
    db.get(countSql, countParams, (countErr, countResult) => {
      if (countErr) {
        console.error('获取全局历史总数错误:', countErr);
        return res.status(500).json({ message: '获取全局历史总数失败' });
      }
      
      res.json({
        histories: processedHistories,
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

// 获取项目进展历史列表
router.get('/:projectId', (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 20, type } = req.query;
  
  let sql = `
    SELECT ph.*, u.username as creator_name
    FROM project_history ph
    LEFT JOIN users u ON ph.created_by = u.id
    WHERE ph.project_id = ?
  `;
  
  const params = [projectId];
  
  // 类型筛选
  if (type) {
    sql += ' AND ph.type = ?';
    params.push(type);
  }
  
  // 排序
  sql += ' ORDER BY ph.created_at DESC';
  
  // 分页
  const offset = (page - 1) * limit;
  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  db.all(sql, params, (err, histories) => {
    if (err) {
      console.error('获取项目历史错误:', err);
      return res.status(500).json({ message: '获取项目历史失败' });
    }
    
    // 解析附件JSON
    const processedHistories = histories.map(history => ({
      ...history,
      attachments: history.attachments ? JSON.parse(history.attachments) : []
    }));
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM project_history WHERE project_id = ?';
    const countParams = [projectId];
    
    if (type) {
      countSql += ' AND type = ?';
      countParams.push(type);
    }
    
    db.get(countSql, countParams, (countErr, countResult) => {
      if (countErr) {
        console.error('获取历史总数错误:', countErr);
        return res.status(500).json({ message: '获取历史总数失败' });
      }
      
      res.json({
        histories: processedHistories,
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

// 获取单条历史记录详情
router.get('/detail/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT ph.*, u.username as creator_name
    FROM project_history ph
    LEFT JOIN users u ON ph.created_by = u.id
    WHERE ph.id = ?
  `;
  
  db.get(sql, [id], (err, history) => {
    if (err) {
      console.error('获取历史详情错误:', err);
      return res.status(500).json({ message: '获取历史详情失败' });
    }
    
    if (!history) {
      return res.status(404).json({ message: '历史记录不存在' });
    }
    
    res.json({
      ...history,
      attachments: history.attachments ? JSON.parse(history.attachments) : []
    });
  });
});

// 创建项目进展记录（需要登录）
router.post('/', requireAuth, (req, res) => {
  const {
    project_id, type = 'manual_note', title, content,
    old_value, new_value, progress_before, progress_after,
    status_before, status_after, attachments = []
  } = req.body;
  
  if (!project_id || !title || !content) {
    return res.status(400).json({ message: '项目ID、标题和内容不能为空' });
  }
  
  // 验证项目是否存在
  db.get('SELECT id FROM projects WHERE id = ?', [project_id], (err, project) => {
    if (err) {
      console.error('验证项目存在性错误:', err);
      return res.status(500).json({ message: '验证项目失败' });
    }
    
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    
    const sql = `
      INSERT INTO project_history (
        project_id, type, title, content, old_value, new_value,
        progress_before, progress_after, status_before, status_after,
        attachments, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      project_id, type, title, content, old_value, new_value,
      progress_before, progress_after, status_before, status_after,
      JSON.stringify(attachments), req.user.id
    ];
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('创建项目历史错误:', err);
        return res.status(500).json({ message: '创建项目历史失败' });
      }
      
      // 返回新创建的历史记录
      const detailSql = `
        SELECT ph.*, u.username as creator_name
        FROM project_history ph
        LEFT JOIN users u ON ph.created_by = u.id
        WHERE ph.id = ?
      `;
      
      db.get(detailSql, [this.lastID], (selectErr, newHistory) => {
        if (selectErr) {
          console.error('获取新创建历史错误:', selectErr);
          return res.status(500).json({ message: '获取新创建历史失败' });
        }
        
        res.status(201).json({
          message: '项目历史创建成功',
          history: {
            ...newHistory,
            attachments: newHistory.attachments ? JSON.parse(newHistory.attachments) : []
          }
        });
      });
    });
  });
});

// 更新项目进展记录（仅创建者或管理员）
router.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, content, attachments } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ message: '标题和内容不能为空' });
  }
  
  // 检查权限：只有创建者或管理员可以编辑
  db.get('SELECT created_by FROM project_history WHERE id = ?', [id], (err, history) => {
    if (err) {
      console.error('查询历史记录错误:', err);
      return res.status(500).json({ message: '查询历史记录失败' });
    }
    
    if (!history) {
      return res.status(404).json({ message: '历史记录不存在' });
    }
    
    if (history.created_by !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ message: '无权限编辑此记录' });
    }
    
    const sql = `
      UPDATE project_history SET
        title = ?, content = ?, attachments = ?
      WHERE id = ?
    `;
    
    const params = [title, content, JSON.stringify(attachments || []), id];
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('更新历史记录错误:', err);
        return res.status(500).json({ message: '更新历史记录失败' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: '历史记录不存在' });
      }
      
      // 返回更新后的记录
      const detailSql = `
        SELECT ph.*, u.username as creator_name
        FROM project_history ph
        LEFT JOIN users u ON ph.created_by = u.id
        WHERE ph.id = ?
      `;
      
      db.get(detailSql, [id], (selectErr, updatedHistory) => {
        if (selectErr) {
          console.error('获取更新历史错误:', selectErr);
          return res.status(500).json({ message: '获取更新历史失败' });
        }
        
        res.json({
          message: '历史记录更新成功',
          history: {
            ...updatedHistory,
            attachments: updatedHistory.attachments ? JSON.parse(updatedHistory.attachments) : []
          }
        });
      });
    });
  });
});

// 删除项目进展记录（仅创建者或管理员）
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  
  // 检查权限：只有创建者或管理员可以删除
  db.get('SELECT created_by FROM project_history WHERE id = ?', [id], (err, history) => {
    if (err) {
      console.error('查询历史记录错误:', err);
      return res.status(500).json({ message: '查询历史记录失败' });
    }
    
    if (!history) {
      return res.status(404).json({ message: '历史记录不存在' });
    }
    
    if (history.created_by !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ message: '无权限删除此记录' });
    }
    
    db.run('DELETE FROM project_history WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('删除历史记录错误:', err);
        return res.status(500).json({ message: '删除历史记录失败' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: '历史记录不存在' });
      }
      
      res.json({ message: '历史记录删除成功' });
    });
  });
});

// 自动记录项目变更（内部使用）
function recordProjectChange(projectId, changeType, oldData, newData, userId) {
  return new Promise((resolve, reject) => {
    let title = '';
    let content = '';
    let oldValue = null;
    let newValue = null;
    let progressBefore = null;
    let progressAfter = null;
    let statusBefore = null;
    let statusAfter = null;
    
    switch (changeType) {
      case 'status_change':
        title = '项目状态变更';
        content = `项目状态从 "${oldData.status}" 变更为 "${newData.status}"`;
        statusBefore = oldData.status;
        statusAfter = newData.status;
        oldValue = oldData.status;
        newValue = newData.status;
        break;
        
      case 'progress_update':
        title = '项目进度更新';
        content = `项目进度从 ${oldData.progress}% 更新为 ${newData.progress}%`;
        progressBefore = oldData.progress;
        progressAfter = newData.progress;
        oldValue = oldData.progress + '%';
        newValue = newData.progress + '%';
        break;
        
      default:
        title = '项目信息更新';
        content = '项目信息已更新';
    }
    
    const sql = `
      INSERT INTO project_history (
        project_id, type, title, content, old_value, new_value,
        progress_before, progress_after, status_before, status_after,
        attachments, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      projectId, changeType, title, content, oldValue, newValue,
      progressBefore, progressAfter, statusBefore, statusAfter,
      JSON.stringify([]), userId
    ];
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('记录项目变更错误:', err);
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
}

module.exports = { router, recordProjectChange }; 