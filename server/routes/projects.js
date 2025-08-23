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
  const { status, priority, search, page = 1, limit = 12, sortBy = 'updated_at', sortOrder = 'desc' } = req.query;
  const clientIP = getClientIP(req);

  let sql = `
    SELECT p.id, p.title, p.description, p.status, p.priority, p.progress, 
           p.tech_stack, p.github_repo, p.demo_url, p.tags, p.order_index,
           p.attachments, p.created_at, p.updated_at, p.likes_count,
           CASE WHEN pl.id IS NOT NULL THEN 1 ELSE 0 END as is_liked
    FROM projects p
    LEFT JOIN project_likes pl ON p.id = pl.project_id AND pl.ip_address = ?
    WHERE 1=1
  `;

  const params = [clientIP];

  // 状态筛选
  if (status) {
    sql += ' AND p.status = ?';
    params.push(status);
  }

  // 优先级筛选
  if (priority) {
    sql += ' AND p.priority = ?';
    params.push(priority);
  }

  // 搜索
  if (search) {
    sql += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // 排序
  const allowedSortFields = ['created_at', 'updated_at', 'title', 'progress', 'likes_count', 'priority', 'status', 'order_index'];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'updated_at';
  const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  
  // 特殊排序处理
  if (validSortBy === 'priority') {
    // 优先级排序：critical > high > medium > low
    sql += ` ORDER BY CASE p.priority 
              WHEN 'critical' THEN 1 
              WHEN 'high' THEN 2 
              WHEN 'medium' THEN 3 
              WHEN 'low' THEN 4 
              ELSE 5 END ${validSortOrder}`;
  } else if (validSortBy === 'status') {
    // 状态排序：按完成度排序
    sql += ` ORDER BY CASE p.status 
              WHEN 'idea' THEN 1 
              WHEN 'planning' THEN 2 
              WHEN 'development' THEN 3 
              WHEN 'testing' THEN 4 
              WHEN 'deployed' THEN 5 
              WHEN 'completed' THEN 6 
              WHEN 'paused' THEN 7 
              ELSE 8 END ${validSortOrder}`;
  } else {
    sql += ` ORDER BY p.${validSortBy} ${validSortOrder}`;
  }
  
  // 添加次要排序确保稳定性
  if (validSortBy !== 'created_at') {
    sql += ', p.created_at DESC';
  }

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
          attachments: project.attachments ? JSON.parse(project.attachments) : { images: [], videos: [] },
          is_liked: Boolean(project.is_liked)
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

        // 记录项目变更历史和改动日志
        try {
          const ChangelogService = require('../services/changelogService');
          
          // 原有的项目历史记录
          if (oldProject.status !== updatedProject.status) {
            await recordProjectChange(id, 'status_change', oldProject, updatedProject, req.user.id);
          }
          if (oldProject.progress !== updatedProject.progress) {
            await recordProjectChange(id, 'progress_update', oldProject, updatedProject, req.user.id);
          }

          // 新的改动日志记录
          const fieldsToTrack = [
            'title', 'description', 'content', 'status', 'priority',
            'start_date', 'due_date', 'completion_date', 'progress',
            'github_repo', 'demo_url', 'tags', 'order_index'
          ];

          // 处理新数据格式
          const newProjectData = {
            title: updatedProject.title,
            description: updatedProject.description,
            content: updatedProject.content,
            status: updatedProject.status,
            priority: updatedProject.priority,
            start_date: updatedProject.start_date,
            due_date: updatedProject.due_date,
            completion_date: updatedProject.completion_date,
            progress: updatedProject.progress,
            github_repo: updatedProject.github_repo,
            demo_url: updatedProject.demo_url,
            tags: updatedProject.tags,
            order_index: updatedProject.order_index,
            tech_stack: updatedProject.tech_stack,
            attachments: updatedProject.attachments
          };

          // 比较原数据和新数据，生成改动记录
          const changes = ChangelogService.generateChanges(oldProject, newProjectData, fieldsToTrack);

          // 处理tech_stack特殊字段
          if (oldProject.tech_stack !== updatedProject.tech_stack) {
            changes.push({
              field_name: 'tech_stack',
              old_value: oldProject.tech_stack,
              new_value: updatedProject.tech_stack,
              description: `修改技术栈：${oldProject.tech_stack || '无'} → ${updatedProject.tech_stack || '无'}`
            });
          }

          // 处理attachments特殊字段
          if (oldProject.attachments !== updatedProject.attachments) {
            changes.push({
              field_name: 'attachments',
              old_value: oldProject.attachments,
              new_value: updatedProject.attachments,
              description: '更新项目附件'
            });
          }

          // 批量记录改动
          if (changes.length > 0) {
            const recordPromises = changes.map(change => {
              return ChangelogService.recordChange({
                project_id: parseInt(id),
                user_id: req.user.id,
                change_type: 'updated',
                field_name: change.field_name,
                old_value: change.old_value,
                new_value: change.new_value,
                description: change.description,
                ip_address: ChangelogService.getClientIP(req),
                user_agent: req.headers['user-agent']
              });
            });

            await Promise.all(recordPromises);
            console.log(`✓ 记录了 ${changes.length} 个项目改动`);
          }

          // 如果有进展日志，记录到项目历史
          if (req.body.progress_log && req.body.progress_log.trim()) {
            await recordProjectChange(
              id,
              'progress_log',
              { progress_log: req.body.progress_log.trim() },
              { progress_log: req.body.progress_log.trim() },
              req.user.id
            );
            console.log(`✓ 记录了项目进展日志`);
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

// 获取客户端IP地址的工具函数
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

// 项目点赞（公开接口，无需登录）
router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';

  // 验证项目是否存在
  db.get('SELECT id, likes_count FROM projects WHERE id = ?', [id], (err, project) => {
    if (err) {
      console.error('获取项目信息错误:', err);
      return res.status(500).json({ message: '系统错误' });
    }

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查该IP是否已经点赞过这个项目
    db.get('SELECT id FROM project_likes WHERE project_id = ? AND ip_address = ?', 
      [id, clientIP], (checkErr, existingLike) => {
      
      if (checkErr) {
        console.error('检查点赞状态错误:', checkErr);
        return res.status(500).json({ message: '系统错误' });
      }

      if (existingLike) {
        return res.status(400).json({ message: '您已经点赞过这个项目了' });
      }

      // 开始事务：添加点赞记录 + 更新项目点赞数
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 插入点赞记录
        db.run('INSERT INTO project_likes (project_id, ip_address, user_agent) VALUES (?, ?, ?)',
          [id, clientIP, userAgent], function(insertErr) {
          
          if (insertErr) {
            console.error('插入点赞记录错误:', insertErr);
            db.run('ROLLBACK');
            return res.status(500).json({ message: '点赞失败' });
          }

          // 更新项目点赞数
          db.run('UPDATE projects SET likes_count = likes_count + 1 WHERE id = ?',
            [id], function(updateErr) {
            
            if (updateErr) {
              console.error('更新点赞数错误:', updateErr);
              db.run('ROLLBACK');
              return res.status(500).json({ message: '点赞失败' });
            }

            db.run('COMMIT');

            // 获取更新后的点赞数
            db.get('SELECT likes_count FROM projects WHERE id = ?', [id], (getErr, updatedProject) => {
              if (getErr) {
                console.error('获取更新后点赞数错误:', getErr);
                return res.status(500).json({ message: '系统错误' });
              }

              res.json({
                message: '点赞成功',
                likes_count: updatedProject.likes_count
              });
            });
          });
        });
      });
    });
  });
});

// 取消项目点赞（公开接口，无需登录）
router.delete('/:id/like', (req, res) => {
  const { id } = req.params;
  const clientIP = getClientIP(req);

  // 验证项目是否存在
  db.get('SELECT id, likes_count FROM projects WHERE id = ?', [id], (err, project) => {
    if (err) {
      console.error('获取项目信息错误:', err);
      return res.status(500).json({ message: '系统错误' });
    }

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查该IP是否已经点赞过这个项目
    db.get('SELECT id FROM project_likes WHERE project_id = ? AND ip_address = ?', 
      [id, clientIP], (checkErr, existingLike) => {
      
      if (checkErr) {
        console.error('检查点赞状态错误:', checkErr);
        return res.status(500).json({ message: '系统错误' });
      }

      if (!existingLike) {
        return res.status(400).json({ message: '您还没有点赞过这个项目' });
      }

      // 开始事务：删除点赞记录 + 更新项目点赞数
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 删除点赞记录
        db.run('DELETE FROM project_likes WHERE project_id = ? AND ip_address = ?',
          [id, clientIP], function(deleteErr) {
          
          if (deleteErr) {
            console.error('删除点赞记录错误:', deleteErr);
            db.run('ROLLBACK');
            return res.status(500).json({ message: '取消点赞失败' });
          }

          // 更新项目点赞数
          db.run('UPDATE projects SET likes_count = MAX(likes_count - 1, 0) WHERE id = ?',
            [id], function(updateErr) {
            
            if (updateErr) {
              console.error('更新点赞数错误:', updateErr);
              db.run('ROLLBACK');
              return res.status(500).json({ message: '取消点赞失败' });
            }

            db.run('COMMIT');

            // 获取更新后的点赞数
            db.get('SELECT likes_count FROM projects WHERE id = ?', [id], (getErr, updatedProject) => {
              if (getErr) {
                console.error('获取更新后点赞数错误:', getErr);
                return res.status(500).json({ message: '系统错误' });
              }

              res.json({
                message: '取消点赞成功',
                likes_count: updatedProject.likes_count
              });
            });
          });
        });
      });
    });
  });
});

// 检查用户是否已点赞项目（公开接口，无需登录）
router.get('/:id/like-status', (req, res) => {
  const { id } = req.params;
  const clientIP = getClientIP(req);

  db.get('SELECT COUNT(*) as is_liked FROM project_likes WHERE project_id = ? AND ip_address = ?',
    [id, clientIP], (err, result) => {
    
    if (err) {
      console.error('检查点赞状态错误:', err);
      return res.status(500).json({ message: '系统错误' });
    }

    res.json({
      is_liked: result.is_liked > 0
    });
  });
});

module.exports = router;
