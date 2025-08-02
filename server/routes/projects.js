const express = require('express');
const db = require('../config/database');
const { recordProjectChange } = require('./project-history');
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

// AI项目生成（仅管理员）
router.post('/ai-generate', requireAdmin, async (req, res) => {
  const { text, language = 'zh' } = req.body;
  
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: '输入文本不能为空' });
  }
  
  if (text.length > 5000) {
    return res.status(400).json({ message: '输入文本不能超过5000字符' });
  }
  
  try {
    // AI解析文本生成项目结构
    const projectData = await generateProjectFromText(text, language);
    
    res.json({
      message: 'AI项目生成成功',
      project: projectData
    });
  } catch (error) {
    console.error('AI项目生成错误:', error);
    res.status(500).json({ 
      message: 'AI项目生成失败', 
      error: error.message 
    });
  }
});

// AI项目生成并保存（仅管理员）
router.post('/ai-generate-save', requireAdmin, async (req, res) => {
  const { text, language = 'zh', saveDirectly = false } = req.body;
  
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: '输入文本不能为空' });
  }
  
  try {
    // AI解析文本生成项目结构
    const projectData = await generateProjectFromText(text, language);
    
    if (saveDirectly) {
      // 直接保存到数据库
      const savedProject = await saveProjectToDatabase(projectData);
      res.status(201).json({
        message: 'AI项目生成并保存成功',
        project: savedProject
      });
    } else {
      // 只返回生成的项目数据，不保存
      res.json({
        message: 'AI项目生成成功',
        project: projectData
      });
    }
  } catch (error) {
    console.error('AI项目生成错误:', error);
    res.status(500).json({ 
      message: 'AI项目生成失败', 
      error: error.message 
    });
  }
});

// 引入AI服务
const aiService = require('../services/aiService');

// AI文本解析生成项目数据
async function generateProjectFromText(text, language = 'zh') {
  try {
    // 使用新的AI服务（支持OpenAI和回退机制）
    const aiResponse = await aiService.generateProject(text, language);
    
    return {
      title: aiResponse.title || '未命名项目',
      description: aiResponse.description || '',
      content: aiResponse.content || text,
      status: aiResponse.status || 'idea',
      priority: aiResponse.priority || 'medium',
      tech_stack: aiResponse.tech_stack || [],
      tags: aiResponse.tags || ['AI生成'],
      start_date: aiResponse.start_date || null,
      due_date: aiResponse.due_date || null,
      progress: 0,
      github_repo: '',
      demo_url: '',
      order_index: 0,
      ai_generated: true, // 标记为AI生成
      ai_source: aiResponse.ai_source, // 记录AI来源
      estimated_duration: aiResponse.estimated_duration || null
    };
  } catch (error) {
    console.error('AI项目生成失败:', error);
    throw new Error('AI项目生成失败: ' + error.message);
  }
}

// 注意：原有的模拟AI生成逻辑已移动到 aiService.js 中
// 这里保留一个简化的注释说明，实际功能由 aiService 提供

// 保存项目到数据库
function saveProjectToDatabase(projectData) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO projects (
        title, description, content, status, priority, start_date,
        due_date, progress, tech_stack, github_repo, demo_url,
        tags, order_index, attachments, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    // 处理附件数据
    let attachmentsStr = '{"images":[],"videos":[]}';
    if (projectData.attachments && typeof projectData.attachments === 'object') {
      try {
        attachmentsStr = JSON.stringify(projectData.attachments);
      } catch (e) {
        console.warn('AI生成项目附件数据格式错误:', e);
      }
    }
    
    const params = [
      projectData.title,
      projectData.description,
      projectData.content,
      projectData.status,
      projectData.priority,
      projectData.start_date,
      projectData.due_date,
      projectData.progress,
      Array.isArray(projectData.tech_stack) ? projectData.tech_stack.join(',') : projectData.tech_stack,
      projectData.github_repo,
      projectData.demo_url,
      Array.isArray(projectData.tags) ? projectData.tags.join(',') : projectData.tags,
      projectData.order_index,
      attachmentsStr
    ];
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('保存AI生成项目错误:', err);
        reject(err);
        return;
      }
      
      // 返回新创建的项目
      db.get('SELECT * FROM projects WHERE id = ?', [this.lastID], (selectErr, newProject) => {
        if (selectErr) {
          console.error('获取新创建项目错误:', selectErr);
          reject(selectErr);
          return;
        }
        
        resolve({
          ...newProject,
          tech_stack: newProject.tech_stack ? newProject.tech_stack.split(',') : [],
          tags: newProject.tags ? newProject.tags.split(',') : [],
          attachments: newProject.attachments ? JSON.parse(newProject.attachments) : { images: [], videos: [] }
        });
      });
    });
  });
}

// 获取所有项目（公开接口）
router.get('/', (req, res) => {
  const { status, priority, search, page = 1, limit = 20 } = req.query;
  
  let sql = `
    SELECT id, title, description, status, priority, progress, 
           tech_stack, github_repo, demo_url, tags, order_index,
           attachments, created_at, updated_at
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
          tags: project.tags ? project.tags.split(',') : [],
          attachments: project.attachments ? JSON.parse(project.attachments) : { images: [], videos: [] }
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

// 获取项目统计数据（公开接口） - 必须在 /:id 路由之前定义
router.get('/stats', (req, res) => {
  console.log('📊 开始计算项目统计数据...');
  
  // 使用多个独立查询避免复杂SQL
  const queries = {
    // 总项目数
    totalProjects: 'SELECT COUNT(*) as total FROM projects',
    
    // 各状态项目数
    statusCounts: `
      SELECT status, COUNT(*) as count 
      FROM projects 
      GROUP BY status
    `,
    
    // 平均进度
    avgProgress: 'SELECT AVG(progress) as avg_progress FROM projects',
    
    // 各优先级项目数
    priorityCounts: `
      SELECT priority, COUNT(*) as count 
      FROM projects 
      GROUP BY priority
    `
  };
  
  let results = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;
  
  // 执行总项目数查询
  db.get(queries.totalProjects, (err, result) => {
    if (err) {
      console.error('获取总项目数失败:', err);
      return res.status(500).json({ message: '获取统计数据失败' });
    }
    
    results.totalProjects = result.total;
    completedQueries++;
    
    if (completedQueries === totalQueries) {
      sendResponse();
    }
  });
  
  // 执行状态统计查询
  db.all(queries.statusCounts, (err, statusRows) => {
    if (err) {
      console.error('获取状态统计失败:', err);
      return res.status(500).json({ message: '获取统计数据失败' });
    }
    
    // 初始化状态统计对象
    const statusCounts = {
      idea: 0,
      planning: 0,
      development: 0,
      testing: 0,
      deployed: 0,
      completed: 0,
      paused: 0
    };
    
    // 填充实际数据
    statusRows.forEach(row => {
      if (statusCounts.hasOwnProperty(row.status)) {
        statusCounts[row.status] = row.count;
      }
    });
    
    results.statusCounts = statusCounts;
    completedQueries++;
    
    if (completedQueries === totalQueries) {
      sendResponse();
    }
  });
  
  // 执行平均进度查询
  db.get(queries.avgProgress, (err, result) => {
    if (err) {
      console.error('获取平均进度失败:', err);
      return res.status(500).json({ message: '获取统计数据失败' });
    }
    
    results.avgProgress = Math.round(result.avg_progress || 0);
    completedQueries++;
    
    if (completedQueries === totalQueries) {
      sendResponse();
    }
  });
  
  // 执行优先级统计查询
  db.all(queries.priorityCounts, (err, priorityRows) => {
    if (err) {
      console.error('获取优先级统计失败:', err);
      return res.status(500).json({ message: '获取统计数据失败' });
    }
    
    // 初始化优先级统计对象
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    // 填充实际数据
    priorityRows.forEach(row => {
      if (priorityCounts.hasOwnProperty(row.priority)) {
        priorityCounts[row.priority] = row.count;
      }
    });
    
    results.priorityCounts = priorityCounts;
    completedQueries++;
    
    if (completedQueries === totalQueries) {
      sendResponse();
    }
  });
  
  function sendResponse() {
    // 计算衍生统计数据
    const derivedStats = {
      // 总进度（使用真实平均值）
      totalProgress: results.avgProgress,
      
      // 活跃项目数（开发中+测试中）
      activeProjects: results.statusCounts.development + results.statusCounts.testing,
      
      // 完成率
      completionRate: results.totalProjects > 0 
        ? Math.round((results.statusCounts.completed / results.totalProjects) * 100)
        : 0
    };
    
    const finalStats = {
      ...results,
      ...derivedStats,
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ 项目统计数据计算完成:', {
      totalProjects: finalStats.totalProjects,
      avgProgress: finalStats.avgProgress,
      completed: finalStats.statusCounts.completed,
      development: finalStats.statusCounts.development
    });
    
    res.json(finalStats);
  }
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
      tags: project.tags ? project.tags.split(',') : [],
      attachments: project.attachments ? JSON.parse(project.attachments) : { images: [], videos: [] }
    });
  });
});

// 创建新项目（仅管理员）
router.post('/', requireAdmin, (req, res) => {
  const {
    title, description, content, status = 'idea', priority = 'medium',
    start_date, due_date, progress = 0, tech_stack, github_repo,
    demo_url, tags, order_index = 0, attachments
  } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: '项目标题不能为空' });
  }
  
  const sql = `
    INSERT INTO projects (
      title, description, content, status, priority, start_date,
      due_date, progress, tech_stack, github_repo, demo_url,
      tags, order_index, attachments, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  
  // 处理附件数据
  let attachmentsStr = '{"images":[],"videos":[]}';
  if (attachments && typeof attachments === 'object') {
    try {
      attachmentsStr = JSON.stringify(attachments);
    } catch (e) {
      console.warn('附件数据格式错误:', e);
    }
  }
  
  const params = [
    title, description, content, status, priority, start_date,
    due_date, progress,
    Array.isArray(tech_stack) ? tech_stack.join(',') : tech_stack,
    github_repo, demo_url,
    Array.isArray(tags) ? tags.join(',') : tags,
    order_index, attachmentsStr
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
          tags: newProject.tags ? newProject.tags.split(',') : [],
          attachments: newProject.attachments ? JSON.parse(newProject.attachments) : { images: [], videos: [] }
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
    demo_url, tags, order_index, attachments
  } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: '项目标题不能为空' });
  }
  
  const sql = `
    UPDATE projects SET
      title = ?, description = ?, content = ?, status = ?, priority = ?,
      start_date = ?, due_date = ?, completion_date = ?, progress = ?,
      tech_stack = ?, github_repo = ?, demo_url = ?, tags = ?,
      order_index = ?, attachments = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  // 处理附件数据
  let attachmentsStr = '{"images":[],"videos":[]}';
  if (attachments && typeof attachments === 'object') {
    try {
      attachmentsStr = JSON.stringify(attachments);
    } catch (e) {
      console.warn('附件数据格式错误:', e);
    }
  }
  
  const params = [
    title, description, content, status, priority, start_date,
    due_date, completion_date, progress,
    Array.isArray(tech_stack) ? tech_stack.join(',') : tech_stack,
    github_repo, demo_url,
    Array.isArray(tags) ? tags.join(',') : tags,
    order_index, attachmentsStr, id
  ];
  
  // 先获取更新前的数据
  db.get('SELECT * FROM projects WHERE id = ?', [id], (getErr, oldProject) => {
    if (getErr) {
      console.error('获取旧项目数据错误:', getErr);
      return res.status(500).json({ message: '获取项目数据失败' });
    }
    
    if (!oldProject) {
      return res.status(404).json({ message: '项目不存在' });
    }
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('更新项目错误:', err);
        return res.status(500).json({ message: '更新项目失败' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: '项目不存在' });
      }
      
      // 返回更新后的项目
      db.get('SELECT * FROM projects WHERE id = ?', [id], async (selectErr, updatedProject) => {
        if (selectErr) {
          console.error('获取更新项目错误:', selectErr);
          return res.status(500).json({ message: '获取更新项目失败' });
        }
        
        // 记录项目变更历史
        try {
          if (oldProject.status !== updatedProject.status) {
            await recordProjectChange(id, 'status_change', oldProject, updatedProject, req.user.id);
          }
          if (oldProject.progress !== updatedProject.progress) {
            await recordProjectChange(id, 'progress_update', oldProject, updatedProject, req.user.id);
          }
        } catch (historyErr) {
          console.error('记录项目变更历史失败:', historyErr);
          // 不影响主要功能，只记录错误
        }
        
        res.json({
          message: '项目更新成功',
          project: {
            ...updatedProject,
            tech_stack: updatedProject.tech_stack ? updatedProject.tech_stack.split(',') : [],
            tags: updatedProject.tags ? updatedProject.tags.split(',') : [],
            attachments: updatedProject.attachments ? JSON.parse(updatedProject.attachments) : { images: [], videos: [] }
          }
        });
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