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

// AI文本解析生成项目数据
async function generateProjectFromText(text, language = 'zh') {
  // 模拟AI解析（简化版本，后续可以集成真实的AI API）
  const mockAIResponse = await mockAIGeneration(text, language);
  
  return {
    title: mockAIResponse.title || '未命名项目',
    description: mockAIResponse.description || '',
    content: mockAIResponse.content || text,
    status: mockAIResponse.status || 'idea',
    priority: mockAIResponse.priority || 'medium',
    tech_stack: mockAIResponse.tech_stack || [],
    tags: mockAIResponse.tags || ['AI生成'],
    start_date: mockAIResponse.start_date || null,
    due_date: mockAIResponse.due_date || null,
    progress: 0,
    github_repo: '',
    demo_url: '',
    order_index: 0,
    ai_generated: true // 标记为AI生成
  };
}

// 模拟AI生成（可以替换为真实的AI API调用）
async function mockAIGeneration(text, language) {
  // 简单的关键词提取和项目结构生成
  const keywords = extractKeywords(text);
  const projectType = detectProjectType(text);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {
        title: generateTitle(text, keywords),
        description: generateDescription(text, keywords),
        content: generateContent(text, projectType),
        status: 'idea',
        priority: detectPriority(text),
        tech_stack: detectTechStack(text),
        tags: ['AI生成', ...keywords.slice(0, 3)]
      };
      resolve(result);
    }, 1000); // 模拟AI处理时间
  });
}

// 关键词提取
function extractKeywords(text) {
  const commonWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
  const words = text.match(/[\u4e00-\u9fa5a-zA-Z]+/g) || [];
  return words
    .filter(word => word.length > 1 && !commonWords.includes(word))
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 10);
}

// 检测项目类型
function detectProjectType(text) {
  const webKeywords = ['网站', '网页', '前端', '后端', 'web', 'html', 'css', 'javascript'];
  const appKeywords = ['应用', 'app', '移动', '手机', 'android', 'ios'];
  const aiKeywords = ['AI', '人工智能', '机器学习', '深度学习', '算法'];
  const gameKeywords = ['游戏', '娱乐', 'game'];
  
  const lowerText = text.toLowerCase();
  
  if (webKeywords.some(keyword => lowerText.includes(keyword))) return 'web';
  if (appKeywords.some(keyword => lowerText.includes(keyword))) return 'mobile';
  if (aiKeywords.some(keyword => lowerText.includes(keyword))) return 'ai';
  if (gameKeywords.some(keyword => lowerText.includes(keyword))) return 'game';
  
  return 'general';
}

// 生成项目标题
function generateTitle(text, keywords) {
  const sentences = text.split(/[。！？.!?]/);
  const firstSentence = sentences[0]?.trim();
  
  if (firstSentence && firstSentence.length < 30) {
    return firstSentence;
  }
  
  if (keywords.length > 0) {
    return `${keywords[0]}项目`;
  }
  
  return '智能生成项目';
}

// 生成项目描述
function generateDescription(text, keywords) {
  const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
  
  if (sentences.length > 1) {
    return sentences.slice(0, 2).join('。') + '。';
  }
  
  return text.slice(0, 100) + (text.length > 100 ? '...' : '');
}

// 生成项目内容
function generateContent(text, projectType) {
  const typeTemplates = {
    web: '这是一个Web项目，主要包含前端和后端开发。\n\n',
    mobile: '这是一个移动应用项目，支持多平台开发。\n\n',
    ai: '这是一个AI项目，涉及人工智能和机器学习技术。\n\n',
    game: '这是一个游戏项目，包含游戏设计和开发。\n\n',
    general: '这是一个综合性项目。\n\n'
  };
  
  return (typeTemplates[projectType] || typeTemplates.general) + 
         '原始需求描述：\n' + text;
}

// 检测优先级
function detectPriority(text) {
  const highPriorityWords = ['紧急', '重要', '立即', '马上', '优先'];
  const lowPriorityWords = ['以后', '有空', '不急'];
  
  if (highPriorityWords.some(word => text.includes(word))) return 'high';
  if (lowPriorityWords.some(word => text.includes(word))) return 'low';
  
  return 'medium';
}

// 检测技术栈
function detectTechStack(text) {
  const techMap = {
    'javascript': 'JavaScript',
    'js': 'JavaScript', 
    'react': 'React',
    'vue': 'Vue.js',
    'angular': 'Angular',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'python': 'Python',
    'java': 'Java',
    'php': 'PHP',
    'mysql': 'MySQL',
    'mongodb': 'MongoDB',
    'redis': 'Redis',
    'docker': 'Docker'
  };
  
  const lowerText = text.toLowerCase();
  const detectedTech = [];
  
  Object.keys(techMap).forEach(key => {
    if (lowerText.includes(key)) {
      detectedTech.push(techMap[key]);
    }
  });
  
  return [...new Set(detectedTech)]; // 去重
}

// 保存项目到数据库
function saveProjectToDatabase(projectData) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO projects (
        title, description, content, status, priority, start_date,
        due_date, progress, tech_stack, github_repo, demo_url,
        tags, order_index, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
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
      projectData.order_index
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
          tags: newProject.tags ? newProject.tags.split(',') : []
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