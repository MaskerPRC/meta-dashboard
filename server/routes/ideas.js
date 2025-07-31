const express = require('express');
const db = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
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

// 获取想法列表（支持分页、排序）
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'vote_count'; // created_at, vote_count, title
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';
    const status = req.query.status || 'all'; // all, pending, adopted, rejected

    // 构建查询条件
    let whereClause = '';
    let queryParams = [];

    if (status !== 'all') {
      whereClause = 'WHERE i.status = ?';
      queryParams.push(status);
    }

    // 获取想法列表
    const ideasQuery = `
      SELECT 
        i.*,
        u.username as author_name,
        u.avatar_url as author_avatar,
        adopter.username as adopter_name,
        COUNT(DISTINCT iv.user_id) as voters_count,
        COALESCE(SUM(iv.votes_count), 0) as total_votes
      FROM ideas i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN users adopter ON i.adopted_by = adopter.id
      LEFT JOIN idea_votes iv ON i.id = iv.idea_id
      ${whereClause}
      GROUP BY i.id
      ORDER BY ${sortBy} ${order}, i.created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ideas i
      ${whereClause}
    `;

    const countParams = status !== 'all' ? [status] : [];

    db.all(ideasQuery, queryParams, (err, ideas) => {
      if (err) {
        console.error('获取想法列表失败:', err);
        return res.status(500).json({ message: '获取想法列表失败' });
      }

      db.get(countQuery, countParams, (err, countResult) => {
        if (err) {
          console.error('获取想法总数失败:', err);
          return res.status(500).json({ message: '获取想法总数失败' });
        }

        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        res.json({
          ideas,
          pagination: {
            current: page,
            total: totalPages,
            count: total,
            limit
          }
        });
      });
    });
  } catch (error) {
    console.error('获取想法列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个想法详情
router.get('/:id', async (req, res) => {
  try {
    const ideaId = parseInt(req.params.id);

    if (!ideaId) {
      return res.status(400).json({ message: '无效的想法ID' });
    }

    const query = `
      SELECT 
        i.*,
        u.username as author_name,
        u.avatar_url as author_avatar,
        adopter.username as adopter_name,
        p.title as project_title,
        COUNT(DISTINCT iv.user_id) as voters_count,
        COALESCE(SUM(iv.votes_count), 0) as total_votes
      FROM ideas i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN users adopter ON i.adopted_by = adopter.id
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN idea_votes iv ON i.id = iv.idea_id
      WHERE i.id = ?
      GROUP BY i.id
    `;

    db.get(query, [ideaId], (err, idea) => {
      if (err) {
        console.error('获取想法详情失败:', err);
        return res.status(500).json({ message: '获取想法详情失败' });
      }

      if (!idea) {
        return res.status(404).json({ message: '想法不存在' });
      }

      res.json({ idea });
    });
  } catch (error) {
    console.error('获取想法详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建新想法（需要登录）
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const authorId = req.user.id;

    // 验证输入
    if (!title || !description) {
      return res.status(400).json({ message: '标题和描述不能为空' });
    }

    if (title.length > 200) {
      return res.status(400).json({ message: '标题不能超过200字符' });
    }

    if (description.length > 1000) {
      return res.status(400).json({ message: '描述不能超过1000字符' });
    }

    if (content && content.length > 10000) {
      return res.status(400).json({ message: '详细内容不能超过10000字符' });
    }

    // 检查用户是否在短时间内提交了过多想法（防止刷屏）
    const recentIdeasQuery = `
      SELECT COUNT(*) as count
      FROM ideas
      WHERE author_id = ? AND created_at > datetime('now', '-1 hour')
    `;

    db.get(recentIdeasQuery, [authorId], (err, result) => {
      if (err) {
        console.error('检查用户想法频率失败:', err);
        return res.status(500).json({ message: '服务器错误' });
      }

      if (result.count >= 5) {
        return res.status(429).json({ message: '提交过于频繁，请稍后再试' });
      }

      // 创建想法
      const insertQuery = `
        INSERT INTO ideas (title, description, content, author_id)
        VALUES (?, ?, ?, ?)
      `;

      db.run(insertQuery, [title, description, content || null, authorId], function(err) {
        if (err) {
          console.error('创建想法失败:', err);
          return res.status(500).json({ message: '创建想法失败' });
        }

        const ideaId = this.lastID;

        // 返回创建的想法信息
        const selectQuery = `
          SELECT 
            i.*,
            u.username as author_name,
            u.avatar_url as author_avatar
          FROM ideas i
          LEFT JOIN users u ON i.author_id = u.id
          WHERE i.id = ?
        `;

        db.get(selectQuery, [ideaId], (err, idea) => {
          if (err) {
            console.error('获取新创建想法失败:', err);
            return res.status(500).json({ message: '想法创建成功，但获取详情失败' });
          }

          res.status(201).json({
            message: '想法创建成功',
            idea
          });
        });
      });
    });
  } catch (error) {
    console.error('创建想法错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 想法投票（需要登录）
router.post('/:id/vote', requireAuth, async (req, res) => {
  try {
    const ideaId = parseInt(req.params.id);
    const userId = req.user.id;
    const { votes } = req.body; // 1 或 2

    if (!ideaId) {
      return res.status(400).json({ message: '无效的想法ID' });
    }

    if (!votes || votes < 1 || votes > 2) {
      return res.status(400).json({ message: '投票数必须是1或2' });
    }

    // 检查想法是否存在且为pending状态
    const ideaQuery = 'SELECT * FROM ideas WHERE id = ? AND status = ?';
    
    db.get(ideaQuery, [ideaId, 'pending'], (err, idea) => {
      if (err) {
        console.error('检查想法状态失败:', err);
        return res.status(500).json({ message: '服务器错误' });
      }

      if (!idea) {
        return res.status(404).json({ message: '想法不存在或已不可投票' });
      }

      // 检查用户是否已经投过票
      const voteQuery = 'SELECT * FROM idea_votes WHERE idea_id = ? AND user_id = ?';
      
      db.get(voteQuery, [ideaId, userId], (err, existingVote) => {
        if (err) {
          console.error('检查投票记录失败:', err);
          return res.status(500).json({ message: '服务器错误' });
        }

        if (existingVote) {
          return res.status(400).json({ message: '您已经为此想法投过票了' });
        }

        // 检查用户今日总投票数是否超限
        const dailyVotesQuery = `
          SELECT COALESCE(SUM(votes_count), 0) as total_votes
          FROM idea_votes
          WHERE user_id = ? AND date(created_at) = date('now')
        `;

        db.get(dailyVotesQuery, [userId], (err, dailyResult) => {
          if (err) {
            console.error('检查每日投票数失败:', err);
            return res.status(500).json({ message: '服务器错误' });
          }

          const currentDailyVotes = dailyResult.total_votes || 0;
          const maxDailyVotes = 10; // 每人每天最多投10票

          if (currentDailyVotes + votes > maxDailyVotes) {
            return res.status(400).json({ 
              message: `您今日投票数已达上限(${maxDailyVotes}票)，剩余${maxDailyVotes - currentDailyVotes}票` 
            });
          }

          // 开始事务：插入投票记录并更新想法投票数
          db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // 插入投票记录
            const insertVoteQuery = `
              INSERT INTO idea_votes (idea_id, user_id, votes_count)
              VALUES (?, ?, ?)
            `;

            db.run(insertVoteQuery, [ideaId, userId, votes], function(err) {
              if (err) {
                console.error('插入投票记录失败:', err);
                db.run('ROLLBACK');
                return res.status(500).json({ message: '投票失败' });
              }

              // 更新想法的投票计数
              const updateIdeaQuery = `
                UPDATE ideas 
                SET vote_count = vote_count + ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `;

              db.run(updateIdeaQuery, [votes, ideaId], function(err) {
                if (err) {
                  console.error('更新想法投票数失败:', err);
                  db.run('ROLLBACK');
                  return res.status(500).json({ message: '投票失败' });
                }

                db.run('COMMIT');

                res.json({
                  message: `投票成功，您为此想法投了${votes}票`,
                  votes: votes,
                  remaining_daily_votes: maxDailyVotes - currentDailyVotes - votes
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('投票错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户的投票记录
router.get('/user/votes', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        iv.*,
        i.title as idea_title,
        i.status as idea_status
      FROM idea_votes iv
      LEFT JOIN ideas i ON iv.idea_id = i.id
      WHERE iv.user_id = ?
      ORDER BY iv.created_at DESC
    `;

    db.all(query, [userId], (err, votes) => {
      if (err) {
        console.error('获取用户投票记录失败:', err);
        return res.status(500).json({ message: '获取投票记录失败' });
      }

      res.json({ votes });
    });
  } catch (error) {
    console.error('获取用户投票记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// ===== 管理员功能 =====

// 管理员采纳想法
router.post('/:id/adopt', requireAdmin, async (req, res) => {
  try {
    const ideaId = parseInt(req.params.id);
    const adminId = req.user.id;

    if (!ideaId) {
      return res.status(400).json({ message: '无效的想法ID' });
    }

    // 检查想法是否存在且为pending状态
    const ideaQuery = 'SELECT * FROM ideas WHERE id = ? AND status = ?';
    
    db.get(ideaQuery, [ideaId, 'pending'], (err, idea) => {
      if (err) {
        console.error('检查想法状态失败:', err);
        return res.status(500).json({ message: '服务器错误' });
      }

      if (!idea) {
        return res.status(404).json({ message: '想法不存在或已不是待审核状态' });
      }

      // 更新想法状态为已采纳
      const updateQuery = `
        UPDATE ideas 
        SET status = 'adopted', 
            adopted_by = ?, 
            adopted_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.run(updateQuery, [adminId, ideaId], function(err) {
        if (err) {
          console.error('采纳想法失败:', err);
          return res.status(500).json({ message: '采纳想法失败' });
        }

        res.json({
          message: '想法采纳成功，可以开始AI转化为项目',
          idea_id: ideaId
        });
      });
    });
  } catch (error) {
    console.error('采纳想法错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员拒绝想法
router.post('/:id/reject', requireAdmin, async (req, res) => {
  try {
    const ideaId = parseInt(req.params.id);
    const { reason } = req.body; // 拒绝原因

    if (!ideaId) {
      return res.status(400).json({ message: '无效的想法ID' });
    }

    // 检查想法是否存在且为pending状态
    const ideaQuery = 'SELECT * FROM ideas WHERE id = ? AND status = ?';
    
    db.get(ideaQuery, [ideaId, 'pending'], (err, idea) => {
      if (err) {
        console.error('检查想法状态失败:', err);
        return res.status(500).json({ message: '服务器错误' });
      }

      if (!idea) {
        return res.status(404).json({ message: '想法不存在或已不是待审核状态' });
      }

      // 更新想法状态为已拒绝，并在content中添加拒绝原因
      const rejectionNote = reason ? `\n\n---\n**管理员拒绝原因:** ${reason}` : '';
      const updateQuery = `
        UPDATE ideas 
        SET status = 'rejected',
            content = COALESCE(content, '') || ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.run(updateQuery, [rejectionNote, ideaId], function(err) {
        if (err) {
          console.error('拒绝想法失败:', err);
          return res.status(500).json({ message: '拒绝想法失败' });
        }

        res.json({
          message: '想法已拒绝',
          idea_id: ideaId,
          reason: reason || '无'
        });
      });
    });
  } catch (error) {
    console.error('拒绝想法错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// AI转化想法为项目（仅管理员）
router.post('/:id/transform-to-project', requireAdmin, async (req, res) => {
  try {
    const ideaId = parseInt(req.params.id);

    if (!ideaId) {
      return res.status(400).json({ message: '无效的想法ID' });
    }

    // 检查想法是否存在且已采纳
    const ideaQuery = `
      SELECT i.*, u.username as author_name
      FROM ideas i
      LEFT JOIN users u ON i.author_id = u.id
      WHERE i.id = ? AND i.status = 'adopted'
    `;
    
    db.get(ideaQuery, [ideaId], async (err, idea) => {
      if (err) {
        console.error('检查想法状态失败:', err);
        return res.status(500).json({ message: '服务器错误' });
      }

      if (!idea) {
        return res.status(404).json({ message: '想法不存在或未被采纳' });
      }

      if (idea.project_id) {
        return res.status(400).json({ message: '该想法已转化为项目' });
      }

      try {
        // 记录AI处理开始
        const logQuery = `
          INSERT INTO ai_processing_logs (idea_id, process_type, input_data, ai_model, status)
          VALUES (?, 'idea_to_project', ?, 'gpt-4', 'processing')
        `;

        const inputData = JSON.stringify({
          title: idea.title,
          description: idea.description,
          content: idea.content,
          author: idea.author_name
        });

        db.run(logQuery, [ideaId, inputData], async function(logErr) {
          if (logErr) {
            console.error('记录AI处理开始失败:', logErr);
            return res.status(500).json({ message: '启动AI处理失败' });
          }

          const logId = this.lastID;
          const startTime = Date.now();

          try {
            // 调用AI服务转化想法
            const projectData = await transformIdeaToProject(idea);
            const processingTime = Date.now() - startTime;

            // 开始事务：创建项目并更新想法
            db.serialize(() => {
              db.run('BEGIN TRANSACTION');

              // 创建项目
              const insertProjectQuery = `
                INSERT INTO projects (
                  title, description, content, status, priority, 
                  progress, tech_stack, tags, order_index
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;

              const projectContent = `${projectData.content}\n\n---\n**想法来源:** ${idea.author_name}`;

              db.run(insertProjectQuery, [
                projectData.title,
                projectData.description,
                projectContent,
                projectData.status || 'idea',
                projectData.priority || 'medium',
                projectData.progress || 0,
                projectData.tech_stack || '',
                projectData.tags || '',
                0 // order_index
              ], function(projectErr) {
                if (projectErr) {
                  console.error('创建项目失败:', projectErr);
                  db.run('ROLLBACK');
                  updateLogStatus(logId, 'failed', projectErr.message, processingTime);
                  return res.status(500).json({ message: '创建项目失败' });
                }

                const projectId = this.lastID;

                // 更新想法的project_id
                const updateIdeaQuery = `
                  UPDATE ideas 
                  SET project_id = ?, updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?
                `;

                db.run(updateIdeaQuery, [projectId, ideaId], function(updateErr) {
                  if (updateErr) {
                    console.error('更新想法关联项目失败:', updateErr);
                    db.run('ROLLBACK');
                    updateLogStatus(logId, 'failed', updateErr.message, processingTime);
                    return res.status(500).json({ message: '更新想法关联失败' });
                  }

                  db.run('COMMIT');

                  // 更新AI处理日志为成功
                  updateLogStatus(logId, 'completed', null, processingTime, {
                    project_id: projectId,
                    title: projectData.title
                  });

                  res.json({
                    message: 'AI转化成功',
                    idea_id: ideaId,
                    project_id: projectId,
                    project: projectData
                  });
                });
              });
            });
          } catch (aiError) {
            const processingTime = Date.now() - startTime;
            console.error('AI转化失败:', aiError);
            updateLogStatus(logId, 'failed', aiError.message, processingTime);
            res.status(500).json({ 
              message: 'AI转化失败', 
              error: aiError.message 
            });
          }
        });
      } catch (error) {
        console.error('AI转化想法错误:', error);
        res.status(500).json({ message: '服务器错误' });
      }
    });
  } catch (error) {
    console.error('转化想法为项目错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 辅助函数：更新AI处理日志状态
function updateLogStatus(logId, status, errorMessage = null, processingTime = null, outputData = null) {
  const updateLogQuery = `
    UPDATE ai_processing_logs 
    SET status = ?, 
        error_message = ?, 
        processing_time_ms = ?,
        output_data = ?,
        completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(updateLogQuery, [
    status, 
    errorMessage, 
    processingTime,
    outputData ? JSON.stringify(outputData) : null,
    logId
  ], (err) => {
    if (err) {
      console.error('更新AI处理日志失败:', err);
    }
  });
}

// 引入AI服务
const aiService = require('../services/aiService');

// AI转化想法为项目的服务函数
async function transformIdeaToProject(idea) {
  try {
    // 构建AI输入文本
    const aiInput = `
想法标题: ${idea.title}
想法描述: ${idea.description}
想法内容: ${idea.content || ''}
作者: ${idea.author_name}

请基于以上用户想法，生成一个完整的项目规划。
    `.trim();

    // 调用AI服务生成项目
    const aiResponse = await aiService.generateProject(aiInput, 'zh');
    
    // 返回AI生成的项目数据
    return {
      title: aiResponse.title || `【AI项目】${idea.title}`,
      description: aiResponse.description || `基于用户想法转化的AI项目：${idea.description}`,
      content: aiResponse.content || `# ${idea.title}\n\n## 项目概述\n${idea.description}\n\n## 详细说明\n${idea.content || '详细实现方案待补充'}\n\n## 开发计划\n- [ ] 需求分析\n- [ ] 设计方案\n- [ ] 开发实现\n- [ ] 测试验证\n- [ ] 部署发布`,
      status: aiResponse.status || 'planning',
      priority: aiResponse.priority || 'medium',
      progress: aiResponse.progress || 10,
      tech_stack: Array.isArray(aiResponse.tech_stack) ? aiResponse.tech_stack.join(',') : (aiResponse.tech_stack || '待确定'),
      tags: Array.isArray(aiResponse.tags) ? aiResponse.tags.join(',') : (aiResponse.tags || 'AI转化,用户想法'),
      ai_generated: true,
      ai_source: aiResponse.ai_source,
      estimated_duration: aiResponse.estimated_duration
    };
  } catch (error) {
    console.error('AI转化想法失败:', error);
    
    // 如果AI服务失败，回退到基本的模拟数据
    console.log('🔄 AI服务失败，使用基本转化逻辑');
    return {
      title: `【AI项目】${idea.title}`,
      description: `基于用户想法转化的项目：${idea.description}`,
      content: `# ${idea.title}\n\n## 项目概述\n${idea.description}\n\n## 详细说明\n${idea.content || '详细实现方案待补充'}\n\n## 开发计划\n- [ ] 需求分析\n- [ ] 设计方案\n- [ ] 开发实现\n- [ ] 测试验证\n- [ ] 部署发布`,
      status: 'planning',
      priority: 'medium',
      progress: 10,
      tech_stack: '待确定',
      tags: 'AI转化,用户想法',
      ai_generated: true,
      ai_source: 'fallback'
    };
  }
}

module.exports = router;