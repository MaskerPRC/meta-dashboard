const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取所有站点配置
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM site_config ORDER BY key';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('获取站点配置错误:', err);
      return res.status(500).json({ message: '获取站点配置失败' });
    }
    
    // 转换为键值对格式，便于前端使用
    const configs = {};
    rows.forEach(row => {
      configs[row.key] = {
        value: row.value,
        description: row.description,
        type: row.type,
        updated_at: row.updated_at
      };
    });
    
    res.json({ configs });
  });
});

// 获取单个配置
router.get('/:key', (req, res) => {
  const { key } = req.params;
  
  const sql = 'SELECT * FROM site_config WHERE key = ?';
  
  db.get(sql, [key], (err, row) => {
    if (err) {
      console.error('获取配置错误:', err);
      return res.status(500).json({ message: '获取配置失败' });
    }
    
    if (!row) {
      return res.status(404).json({ message: '配置不存在' });
    }
    
    res.json({ config: row });
  });
});

// 更新或创建配置（需要管理员权限）- 支持 UPSERT
router.put('/:key', requireAdmin, (req, res) => {
  const { key } = req.params;
  const { value, description, type = 'text' } = req.body;
  
  if (value === undefined) {
    return res.status(400).json({ message: '配置值不能为空' });
  }
  
  // 先尝试更新
  const updateSql = 'UPDATE site_config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?';
  
  db.run(updateSql, [value, key], function(err) {
    if (err) {
      console.error('更新配置错误:', err);
      return res.status(500).json({ message: '更新配置失败' });
    }
    
    if (this.changes === 0) {
      // 配置不存在，创建新配置
      const insertSql = `
        INSERT INTO site_config (key, value, description, type, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      db.run(insertSql, [key, value, description, type], function(insertErr) {
        if (insertErr) {
          console.error('创建配置错误:', insertErr);
          return res.status(500).json({ message: '创建配置失败' });
        }
        
        // 返回新创建的配置
        db.get('SELECT * FROM site_config WHERE id = ?', [this.lastID], (selectErr, newConfig) => {
          if (selectErr) {
            console.error('获取新创建配置错误:', selectErr);
            return res.status(500).json({ message: '获取新创建配置失败' });
          }
          
          res.json({
            message: '配置创建成功',
            config: newConfig
          });
        });
      });
    } else {
      // 配置已存在，更新成功，返回更新后的配置
      db.get('SELECT * FROM site_config WHERE key = ?', [key], (selectErr, updatedConfig) => {
        if (selectErr) {
          console.error('获取更新后配置错误:', selectErr);
          return res.status(500).json({ message: '获取更新后配置失败' });
        }
        
        res.json({
          message: '配置更新成功',
          config: updatedConfig
        });
      });
    }
  });
});

// 批量更新配置（需要管理员权限）
router.put('/', requireAdmin, (req, res) => {
  const { configs } = req.body;
  
  if (!configs || typeof configs !== 'object') {
    return res.status(400).json({ message: '配置数据格式错误' });
  }
  
  const updates = Object.entries(configs);
  if (updates.length === 0) {
    return res.status(400).json({ message: '没有配置需要更新' });
  }
  
  // 使用事务确保所有更新操作的原子性
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    let completedUpdates = 0;
    let hasError = false;
    
    updates.forEach(([key, value]) => {
      const sql = 'UPDATE site_config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?';
      
      db.run(sql, [value, key], function(err) {
        if (err && !hasError) {
          hasError = true;
          console.error('批量更新配置错误:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ message: '批量更新配置失败' });
        }
        
        completedUpdates++;
        
        if (completedUpdates === updates.length && !hasError) {
          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              console.error('提交事务错误:', commitErr);
              return res.status(500).json({ message: '提交更新失败' });
            }
            
            res.json({ message: '批量更新配置成功' });
          });
        }
      });
    });
  });
});

// 创建新配置（需要管理员权限）
router.post('/', requireAdmin, (req, res) => {
  const { key, value, description, type = 'text' } = req.body;
  
  if (!key) {
    return res.status(400).json({ message: '配置键不能为空' });
  }
  
  const sql = `
    INSERT INTO site_config (key, value, description, type, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  
  db.run(sql, [key, value, description, type], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ message: '配置键已存在' });
      }
      console.error('创建配置错误:', err);
      return res.status(500).json({ message: '创建配置失败' });
    }
    
    // 返回新创建的配置
    db.get('SELECT * FROM site_config WHERE id = ?', [this.lastID], (selectErr, newConfig) => {
      if (selectErr) {
        console.error('获取新创建配置错误:', selectErr);
        return res.status(500).json({ message: '获取新创建配置失败' });
      }
      
      res.status(201).json({
        message: '配置创建成功',
        config: newConfig
      });
    });
  });
});

// 删除配置（需要管理员权限）
router.delete('/:key', requireAdmin, (req, res) => {
  const { key } = req.params;
  
  const sql = 'DELETE FROM site_config WHERE key = ?';
  
  db.run(sql, [key], function(err) {
    if (err) {
      console.error('删除配置错误:', err);
      return res.status(500).json({ message: '删除配置失败' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: '配置不存在' });
    }
    
    res.json({ message: '配置删除成功' });
  });
});

// 管理员权限检查中间件
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
}

module.exports = router; 