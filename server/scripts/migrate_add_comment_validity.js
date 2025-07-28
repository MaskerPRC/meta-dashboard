const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

// 生成备份文件名
function generateBackupFileName() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  return `ai_dashboard_backup_comment_validity_${timestamp}.db`;
}

function migrateAddCommentValidity() {
  // 先备份数据库
  const backupPath = path.join(__dirname, '../data', generateBackupFileName());
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log('✅ 数据库备份成功:', backupPath);
  } catch (err) {
    console.error('❌ 数据库备份失败:', err);
    return;
  }

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ 连接数据库失败:', err);
      return;
    }
    console.log('✅ 连接到SQLite数据库');
  });

  db.serialize(() => {
    // 检查 comments 表是否存在 validity_status 字段
    db.all("PRAGMA table_info(comments)", (err, columns) => {
      if (err) {
        console.error('❌ 获取表信息失败:', err);
        return;
      }

      const hasValidityStatus = columns.some(col => col.name === 'validity_status');
      
      if (hasValidityStatus) {
        console.log('⚠️  字段已存在，跳过迁移');
        db.close();
        return;
      }

      // 添加有效性检测相关字段
      const alterStatements = [
        `ALTER TABLE comments ADD COLUMN validity_status TEXT CHECK(validity_status IN ('pending', 'valid', 'invalid', 'error')) DEFAULT 'pending'`,
        `ALTER TABLE comments ADD COLUMN validity_score INTEGER DEFAULT NULL`, // 0-100分
        `ALTER TABLE comments ADD COLUMN validity_reason TEXT DEFAULT NULL`,
        `ALTER TABLE comments ADD COLUMN checked_at DATETIME DEFAULT NULL`,
        `ALTER TABLE comments ADD COLUMN ai_model TEXT DEFAULT NULL`
      ];

      let completed = 0;
      alterStatements.forEach((statement, index) => {
        db.run(statement, (err) => {
          if (err) {
            console.error(`❌ 执行第${index + 1}个ALTER语句失败:`, err);
            return;
          }
          
          completed++;
          console.log(`✅ 第${index + 1}个字段添加成功`);
          
          if (completed === alterStatements.length) {
            console.log('✅ 评论有效性检测字段迁移完成');
            
            // 创建索引以优化查询性能
            db.run(`
              CREATE INDEX IF NOT EXISTS idx_comments_validity_status 
              ON comments (validity_status)
            `, (err) => {
              if (err) {
                console.error('❌ 创建索引失败:', err);
              } else {
                console.log('✅ 有效性状态索引创建成功');
              }
              
              db.close((err) => {
                if (err) {
                  console.error('❌ 关闭数据库失败:', err);
                } else {
                  console.log('✅ 数据库连接已关闭');
                }
              });
            });
          }
        });
      });
    });
  });
}

// 直接执行脚本时运行迁移
if (process.argv[1] === __filename) {
  migrateAddCommentValidity();
}

module.exports = { migrateAddCommentValidity }; 