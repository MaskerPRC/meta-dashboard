/**
 * 项目改动日志 API 路由
 */

const express = require('express');
const router = express.Router();
const ChangelogService = require('../services/changelogService');

// 中间件：检查是否登录
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: '需要登录才能访问' });
};

// 中间件：检查管理员权限
const requireAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.is_admin) {
    return next();
  }
  res.status(403).json({ message: '需要管理员权限' });
};

// 获取指定项目的改动历史
router.get('/project/:projectId', (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 20, changeType } = req.query;

  if (!/^\d+$/.test(projectId)) {
    return res.status(400).json({ message: '无效的项目ID' });
  }

  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100), // 限制最大每页数量
    changeType: changeType || null
  };

  ChangelogService.getProjectChangelog(parseInt(projectId), options)
    .then(result => {
      res.json({
        message: '获取项目改动历史成功',
        ...result
      });
    })
    .catch(error => {
      console.error('获取项目改动历史失败:', error);
      res.status(500).json({ message: '获取项目改动历史失败' });
    });
});

// 获取全局改动历史（需要登录）
router.get('/global', requireAuth, (req, res) => {
  const { page = 1, limit = 50, changeType, projectId } = req.query;

  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100),
    changeType: changeType || null,
    projectId: projectId ? parseInt(projectId) : null
  };

  ChangelogService.getGlobalChangelog(options)
    .then(result => {
      res.json({
        message: '获取全局改动历史成功',
        ...result
      });
    })
    .catch(error => {
      console.error('获取全局改动历史失败:', error);
      res.status(500).json({ message: '获取全局改动历史失败' });
    });
});

// 手动记录改动（仅管理员）
router.post('/record', requireAdmin, (req, res) => {
  const {
    project_id,
    change_type,
    field_name,
    old_value,
    new_value,
    description
  } = req.body;

  if (!project_id || !change_type || !description) {
    return res.status(400).json({ 
      message: '项目ID、改动类型和描述不能为空' 
    });
  }

  const change = {
    project_id: parseInt(project_id),
    user_id: req.user.id,
    change_type,
    field_name,
    old_value,
    new_value,
    description,
    ip_address: ChangelogService.getClientIP(req),
    user_agent: req.headers['user-agent']
  };

  ChangelogService.recordChange(change)
    .then(result => {
      res.status(201).json({
        message: '改动记录成功',
        change_id: result.id
      });
    })
    .catch(error => {
      console.error('记录改动失败:', error);
      res.status(500).json({ message: '记录改动失败' });
    });
});

// 获取改动统计信息
router.get('/stats', requireAuth, (req, res) => {
  const { projectId, days = 30 } = req.query;

  let sql = `
    SELECT 
      change_type,
      COUNT(*) as count,
      DATE(created_at) as date
    FROM project_changelog 
    WHERE created_at >= datetime('now', '-${parseInt(days)} days')
  `;

  const params = [];

  if (projectId) {
    sql += ' AND project_id = ?';
    params.push(parseInt(projectId));
  }

  sql += ' GROUP BY change_type, DATE(created_at) ORDER BY created_at DESC';

  const db = require('../config/database');
  db.all(sql, params, (err, stats) => {
    if (err) {
      console.error('获取改动统计失败:', err);
      return res.status(500).json({ message: '获取改动统计失败' });
    }

    // 按改动类型分组统计
    const summarySQL = `
      SELECT 
        change_type,
        COUNT(*) as total_count,
        COUNT(DISTINCT project_id) as affected_projects
      FROM project_changelog 
      WHERE created_at >= datetime('now', '-${parseInt(days)} days')
      ${projectId ? 'AND project_id = ?' : ''}
      GROUP BY change_type
      ORDER BY total_count DESC
    `;

    db.all(summarySQL, projectId ? [parseInt(projectId)] : [], (summaryErr, summary) => {
      if (summaryErr) {
        console.error('获取改动汇总统计失败:', summaryErr);
        return res.status(500).json({ message: '获取改动汇总统计失败' });
      }

      res.json({
        message: '获取改动统计成功',
        stats,
        summary,
        period_days: parseInt(days)
      });
    });
  });
});

module.exports = router;
