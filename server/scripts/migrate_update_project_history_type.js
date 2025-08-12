const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

function createBackup() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupPath = path.join(__dirname, '../data', `ai_dashboard_backup_update_history_type_${timestamp}.db`);
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ 数据库备份成功: ${backupPath}`);
    return true;
  } catch (error) {
    console.error('❌ 数据库备份失败:', error);
    return false;
  }
}

async function migrate(dbPath) {
  console.log('🔄 开始更新project_history表type约束迁移...');
  
  // 创建备份
  if (!createBackup()) {
    console.error('❌ 备份失败，迁移终止');
    return;
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ 数据库连接失败:', err);
        reject(err);
        return;
      }
      
      console.log('✅ 数据库连接成功');
      
      db.serialize(() => {
        // 开始事务
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            console.error('❌ 开始事务失败:', err);
            reject(err);
            return;
          }

          // 1. 创建新表（带有更新的约束）
          const createNewTableSQL = `
            CREATE TABLE project_history_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              project_id INTEGER NOT NULL,
              type TEXT CHECK(type IN ('progress_update', 'status_change', 'manual_note', 'milestone', 'progress_log')) DEFAULT 'manual_note',
              title TEXT NOT NULL,
              content TEXT NOT NULL,
              old_value TEXT,
              new_value TEXT,
              progress_before INTEGER,
              progress_after INTEGER,
              status_before TEXT,
              status_after TEXT,
              attachments TEXT,
              created_by INTEGER,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
              FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
            )
          `;

          db.run(createNewTableSQL, (err) => {
            if (err) {
              console.error('❌ 创建新表失败:', err);
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            console.log('✅ 创建新表成功');

            // 2. 复制数据
            const copyDataSQL = `
              INSERT INTO project_history_new 
              SELECT * FROM project_history
            `;

            db.run(copyDataSQL, (err) => {
              if (err) {
                console.error('❌ 复制数据失败:', err);
                db.run('ROLLBACK');
                reject(err);
                return;
              }

              console.log('✅ 数据复制成功');

              // 3. 删除原表
              db.run('DROP TABLE project_history', (err) => {
                if (err) {
                  console.error('❌ 删除原表失败:', err);
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }

                console.log('✅ 删除原表成功');

                // 4. 重命名新表
                db.run('ALTER TABLE project_history_new RENAME TO project_history', (err) => {
                  if (err) {
                    console.error('❌ 重命名表失败:', err);
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }

                  console.log('✅ 重命名表成功');

                  // 5. 重新创建索引
                  db.run(`
                    CREATE INDEX IF NOT EXISTS idx_project_history_project_id 
                    ON project_history (project_id)
                  `, (err) => {
                    if (err) {
                      console.error('❌ 创建项目历史索引失败:', err);
                      db.run('ROLLBACK');
                      reject(err);
                      return;
                    }

                    console.log('✅ 项目历史索引创建成功');

                    db.run(`
                      CREATE INDEX IF NOT EXISTS idx_project_history_created_at 
                      ON project_history (created_at DESC)
                    `, (err) => {
                      if (err) {
                        console.error('❌ 创建时间索引失败:', err);
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                      }

                      console.log('✅ 时间索引创建成功');

                      // 提交事务
                      db.run('COMMIT', (err) => {
                        if (err) {
                          console.error('❌ 提交事务失败:', err);
                          reject(err);
                          return;
                        }

                        console.log('✅ project_history表type约束更新完成');
                        db.close((err) => {
                          if (err) {
                            console.error('❌ 关闭数据库连接失败:', err);
                            reject(err);
                          } else {
                            console.log('✅ 数据库连接已关闭');
                            resolve();
                          }
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

// 脚本直接执行时运行迁移
if (process.argv[1] === __filename) {
  migrate(dbPath)
    .then(() => {
      console.log('🎉 迁移完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 迁移失败:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
