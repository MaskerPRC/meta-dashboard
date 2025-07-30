const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

// 检查当前工作目录是否是脚本目录
if (process.argv[1] === __filename) {
  runMigration();
}

function runMigration() {
  console.log('🔄 开始数据库迁移：添加简历功能相关表...');
  
  // 先备份数据库
  const backupPath = path.join(__dirname, '../data', `ai_dashboard_backup_resume_migration_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
  const fs = require('fs');
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ 数据库备份成功: ${backupPath}`);
  } catch (err) {
    console.error('❌ 数据库备份失败:', err);
    process.exit(1);
  }
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ 数据库连接失败:', err.message);
      process.exit(1);
    }
    
    console.log('✅ 数据库连接成功');
    
    // 启用外键约束
    db.run("PRAGMA foreign_keys = ON");
    
    // 检查表是否已存在
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='resumes'", (err, row) => {
      if (err) {
        console.error('❌ 检查resumes表存在性失败:', err);
        db.close();
        process.exit(1);
      }
      
      if (row) {
        console.log('⚠️  resumes表已存在，跳过迁移');
        db.close();
        return;
      }
      
      // 创建resumes表
      const createResumesTableSQL = `
        CREATE TABLE resumes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL DEFAULT '我的简历',
          content TEXT DEFAULT '',
          status TEXT CHECK(status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
          current_version INTEGER DEFAULT 1,
          is_public BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `;
      
      db.run(createResumesTableSQL, (err) => {
        if (err) {
          console.error('❌ 创建resumes表失败:', err);
          db.close();
          process.exit(1);
        }
        
        console.log('✅ resumes表创建成功');
        
        // 创建resume_versions表
        const createResumeVersionsTableSQL = `
          CREATE TABLE resume_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER NOT NULL,
            version INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT DEFAULT '',
            change_description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id),
            UNIQUE(resume_id, version)
          )
        `;
        
        db.run(createResumeVersionsTableSQL, (err) => {
          if (err) {
            console.error('❌ 创建resume_versions表失败:', err);
            db.close();
            process.exit(1);
          }
          
          console.log('✅ resume_versions表创建成功');
          
          // 创建索引提升查询性能
          const createIndexes = [
            "CREATE INDEX idx_resumes_user_id ON resumes(user_id)",
            "CREATE INDEX idx_resumes_status ON resumes(status)",
            "CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id)",
            "CREATE INDEX idx_resume_versions_version ON resume_versions(resume_id, version)"
          ];
          
          let indexCount = 0;
          const createNextIndex = () => {
            if (indexCount >= createIndexes.length) {
              console.log('🎉 简历功能数据库迁移完成！');
              console.log('📊 创建的表:');
              console.log('  - resumes: 用户简历主表');
              console.log('  - resume_versions: 简历版本历史表');
              console.log('📈 创建的索引:', createIndexes.length, '个');
              db.close();
              return;
            }
            
            db.run(createIndexes[indexCount], (err) => {
              if (err) {
                console.error(`❌ 创建索引失败:`, err);
                db.close();
                process.exit(1);
              }
              
              indexCount++;
              createNextIndex();
            });
          };
          
          createNextIndex();
        });
      });
    });
  });
}

module.exports = { runMigration }; 