/**
 * 添加项目点赞功能数据库迁移
 * 添加project_likes表，支持IP限制的点赞功能
 */
const path = require("path");

const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

async function migrate(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
      // 添加project_likes表
      db.run(`
        CREATE TABLE IF NOT EXISTS project_likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          ip_address TEXT NOT NULL,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
          UNIQUE(project_id, ip_address)
        )
      `, (err) => {
        if (err) {
          console.error('创建project_likes表失败:', err);
          reject(err);
          return;
        }
        console.log('✅ 创建project_likes表成功');
      });

      // 为projects表添加likes_count字段
      db.run(`
        ALTER TABLE projects ADD COLUMN likes_count INTEGER DEFAULT 0
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('添加likes_count字段失败:', err);
          reject(err);
          return;
        }
        console.log('✅ 添加projects.likes_count字段成功');
      });

      // 创建索引提高查询性能
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id)
      `, (err) => {
        if (err) {
          console.error('创建project_likes索引失败:', err);
          reject(err);
          return;
        }
        console.log('✅ 创建project_likes索引成功');
      });

      // 创建IP地址索引
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_project_likes_ip_address ON project_likes(ip_address)
      `, (err) => {
        if (err) {
          console.error('创建IP地址索引失败:', err);
          reject(err);
          return;
        }
        console.log('✅ 创建IP地址索引成功');

        // 初始化现有项目的点赞数
        db.run(`
          UPDATE projects 
          SET likes_count = (
            SELECT COUNT(*) 
            FROM project_likes 
            WHERE project_likes.project_id = projects.id
          )
        `, (err) => {
          if (err) {
            console.error('初始化点赞数失败:', err);
            reject(err);
          } else {
            console.log('✅ 初始化现有项目点赞数成功');
            db.close();
            resolve();
          }
        });
      });
    });
  });
}

migrate(dbPath)

module.exports = { migrate };
