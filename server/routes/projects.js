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

// 获取所有项目（公开接口）
router.get('/', (req, res) => {
  const { status, priority, search, page = 1, limit = 20 } = req.query;
  
  let sql = `
    SELECT id, title, description, status, priority, progress, 
           tech_stack, github_repo, demo_url, tags, order_index,
           created_at, updated_at
    FROM projects 
    WHERE 1=1
  `;
  
  const params = [];
  
  // 状态筛选
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  
  // 优先级筛选
  if (priority) {
    sql += ' AND priority = ?';
    params.push(priority);
  }
  
  // 搜索
  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  // 排序
  sql += ' ORDER BY order_index ASC, created_at DESC';
  
  // 分页
  const offset = (page - 1) * limit;
  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  db.all(sql, params, (err, projects) => {
    if (err) {
      console.error('获取项目列表错误:', err);
      return res.status(500).json({ message: '获取项目列表失败' });
    }
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM projects WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    
    if (priority) {
      countSql += ' AND priority = ?';
      countParams.push(priority);
    }
    
    if (search) {
      countSql += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    db.get(countSql, countParams, (countErr, countResult) => {
      if (countErr) {
        console.error('获取项目总数错误:', countErr);
        return res.status(500).json({ message: '获取项目总数失败' });
      }
      
      res.json({
        projects: projects.map(project => ({
          ...project,
          tech_stack: project.tech_stack ? project.tech_stack.split(',') : [],
          tags: project.tags ? project.tags.split(',') : []
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

// 获取单个项目详情（包含content）
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, project) => {
    if (err) {
      console.error('获取项目详情错误:', err);
      return res.status(500).json({ message: '获取项目详情失败' });
    }
    
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    
    res.json({
      ...project,
      tech_stack: project.tech_stack ? project.tech_stack.split(',') : [],
      tags: project.tags ? project.tags.split(',') : []
    });
  });
});

// 创建新项目（仅管理员）
router.post('/', requireAdmin, (req, res) => {
  const {
    title, description, content, status = 'idea', priority = 'medium',
    start_date, due_date, progress = 0, tech_stack, github_repo,
    demo_url, tags, order_index = 0
  } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: '项目标题不能为空' });
  }
  
  const sql = `
    INSERT INTO projects (
      title, description, content, status, priority, start_date,
      due_date, progress, tech_stack, github_repo, demo_url,
      tags, order_index, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  
  const params = [
    title, description, content, status, priority, start_date,
    due_date, progress,
    Array.isArray(tech_stack) ? tech_stack.join(',') : tech_stack,
    github_repo, demo_url,
    Array.isArray(tags) ? tags.join(',') : tags,
    order_index
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('创建项目错误:', err);
      return res.status(500).json({ message: '创建项目失败' });
    }
    
    // 返回新创建的项目
    db.get('SELECT * FROM projects WHERE id = ?', [this.lastID], (selectErr, newProject) => {
      if (selectErr) {
        console.error('获取新创建项目错误:', selectErr);
        return res.status(500).json({ message: '获取新创建项目失败' });
      }
      
      res.status(201).json({
        message: '项目创建成功',
        project: {
          ...newProject,
          tech_stack: newProject.tech_stack ? newProject.tech_stack.split(',') : [],
          tags: newProject.tags ? newProject.tags.split(',') : []
        }
      });
    });
  });
});

// 更新项目（仅管理员）
router.put('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const {
    title, description, content, status, priority, start_date,
    due_date, completion_date, progress, tech_stack, github_repo,
    demo_url, tags, order_index
  } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: '项目标题不能为空' });
  }
  
  const sql = `
    UPDATE projects SET
      title = ?, description = ?, content = ?, status = ?, priority = ?,
      start_date = ?, due_date = ?, completion_date = ?, progress = ?,
      tech_stack = ?, github_repo = ?, demo_url = ?, tags = ?,
      order_index = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  const params = [
    title, description, content, status, priority, start_date,
    due_date, completion_date, progress,
    Array.isArray(tech_stack) ? tech_stack.join(',') : tech_stack,
    github_repo, demo_url,
    Array.isArray(tags) ? tags.join(',') : tags,
    order_index, id
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('更新项目错误:', err);
      return res.status(500).json({ message: '更新项目失败' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: '项目不存在' });
    }
    
    // 返回更新后的项目
    db.get('SELECT * FROM projects WHERE id = ?', [id], (selectErr, updatedProject) => {
      if (selectErr) {
        console.error('获取更新项目错误:', selectErr);
        return res.status(500).json({ message: '获取更新项目失败' });
      }
      
      res.json({
        message: '项目更新成功',
        project: {
          ...updatedProject,
          tech_stack: updatedProject.tech_stack ? updatedProject.tech_stack.split(',') : [],
          tags: updatedProject.tags ? updatedProject.tags.split(',') : []
        }
      });
    });
  });
});

// 删除项目（仅管理员）
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('删除项目错误:', err);
      return res.status(500).json({ message: '删除项目失败' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: '项目不存在' });
    }
    
    res.json({ message: '项目删除成功' });
  });
});

// 批量更新项目排序（仅管理员）
router.put('/reorder/batch', requireAdmin, (req, res) => {
  const { projects } = req.body; // [{ id: 1, order_index: 1 }, ...]
  
  if (!Array.isArray(projects)) {
    return res.status(400).json({ message: '项目数据格式错误' });
  }
  
  const sql = 'UPDATE projects SET order_index = ? WHERE id = ?';
  const stmt = db.prepare(sql);
  
  projects.forEach(project => {
    stmt.run([project.order_index, project.id]);
  });
  
  stmt.finalize((err) => {
    if (err) {
      console.error('批量更新排序错误:', err);
      return res.status(500).json({ message: '更新排序失败' });
    }
    
    res.json({ message: '排序更新成功' });
  });
});

module.exports = router; 