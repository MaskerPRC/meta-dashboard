const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

function migrateAddProjectHistory() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ 连接数据库失败:', err);
      return;
    }
    console.log('✅ 连接到SQLite数据库');
  });

  db.serialize(() => {
    // 创建项目进展历史表
    db.run(`
      CREATE TABLE IF NOT EXISTS project_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        type TEXT CHECK(type IN ('progress_update', 'status_change', 'manual_note', 'milestone')) DEFAULT 'manual_note',
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        progress_before INTEGER,
        progress_after INTEGER,
        status_before TEXT,
        status_after TEXT,
        attachments TEXT, -- JSON格式存储附件信息
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) {
        console.error('❌ 创建项目进展历史表失败:', err);
      } else {
        console.log('✅ 项目进展历史表创建成功');
      }
    });

    // 创建索引
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_project_history_project_id 
      ON project_history (project_id)
    `, (err) => {
      if (err) {
        console.error('❌ 创建项目历史索引失败:', err);
      } else {
        console.log('✅ 项目历史索引创建成功');
      }
    });

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_project_history_created_at 
      ON project_history (created_at DESC)
    `, (err) => {
      if (err) {
        console.error('❌ 创建时间索引失败:', err);
      } else {
        console.log('✅ 时间索引创建成功');
      }
    });
  });

  db.close((err) => {
    if (err) {
      console.error('❌ 关闭数据库连接失败:', err);
    } else {
      console.log('✅ 数据库连接已关闭');
    }
  });
}

// 如果直接运行这个脚本
if (require.main === module) {
  console.log('🔄 开始迁移：添加项目进展历史表...');
  migrateAddProjectHistory();
}

module.exports = { migrateAddProjectHistory }; 