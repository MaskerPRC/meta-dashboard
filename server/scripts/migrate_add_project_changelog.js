/**
 * 项目改动日志系统数据库迁移
 * 添加 project_changelog 表用于记录项目的每次修改
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function migrate(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);

    // 开始事务
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // 创建项目改动日志表
      db.run(`
        CREATE TABLE IF NOT EXISTS project_changelog (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          user_id INTEGER,
          change_type TEXT NOT NULL, -- 改动类型: created, updated, status_changed, priority_changed, content_updated, etc.
          field_name TEXT, -- 修改的字段名
          old_value TEXT, -- 旧值 (JSON格式)
          new_value TEXT, -- 新值 (JSON格式)
          description TEXT, -- 改动描述
          ip_address TEXT, -- 操作者IP地址
          user_agent TEXT, -- 用户代理
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `, (err) => {
        if (err) {
          console.error('创建 project_changelog 表失败:', err);
          db.run('ROLLBACK');
          db.close();
          reject(err);
          return;
        }
        console.log('✓ project_changelog 表创建成功');
      });

      // 为 project_changelog 表创建索引
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_project_changelog_project_id 
        ON project_changelog(project_id)
      `, (err) => {
        if (err) {
          console.error('创建 project_changelog 项目ID索引失败:', err);
          db.run('ROLLBACK');
          db.close();
          reject(err);
          return;
        }
        console.log('✓ project_changelog 项目ID索引创建成功');
      });

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_project_changelog_created_at 
        ON project_changelog(created_at)
      `, (err) => {
        if (err) {
          console.error('创建 project_changelog 时间索引失败:', err);
          db.run('ROLLBACK');
          db.close();
          reject(err);
          return;
        }
        console.log('✓ project_changelog 时间索引创建成功');
      });

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_project_changelog_user_id 
        ON project_changelog(user_id)
      `, (err) => {
        if (err) {
          console.error('创建 project_changelog 用户ID索引失败:', err);
          db.run('ROLLBACK');
          db.close();
          reject(err);
          return;
        }
        console.log('✓ project_changelog 用户ID索引创建成功');
      });

      // 提交事务
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('提交事务失败:', err);
          db.run('ROLLBACK');
          db.close();
          reject(err);
          return;
        }
        
        console.log('✓ 项目改动日志系统迁移完成');
        db.close();
        resolve();
      });
    });
  });
}

// 如果直接运行此脚本
if (process.argv[1] === __filename) {
  const dbPath = path.join(__dirname, '..', 'data', 'ai_dashboard.db');
  migrate(dbPath)
    .then(() => {
      console.log('项目改动日志系统迁移成功完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('项目改动日志系统迁移失败:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
