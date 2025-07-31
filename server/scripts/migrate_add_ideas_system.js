const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

// 检查当前工作目录是否是脚本目录
if (process.argv[1] === __filename) {
  runMigration();
}

function runMigration() {
  console.log('🔄 开始数据库迁移：添加想法征集系统...');
  
  // 先备份数据库
  const backupPath = path.join(__dirname, '../data', `ai_dashboard_backup_ideas_migration_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
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
    
    // 检查表是否已存在
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND (name='ideas' OR name='idea_votes' OR name='ai_processing_logs')", (err, tables) => {
      if (err) {
        console.error('❌ 检查表结构失败:', err);
        db.close();
        process.exit(1);
      }
      
      const existingTables = tables.map(t => t.name);
      console.log('📊 已存在的相关表:', existingTables);
      
      if (existingTables.includes('ideas') && existingTables.includes('idea_votes') && existingTables.includes('ai_processing_logs')) {
        console.log('⚠️  想法征集系统表已存在，跳过迁移');
        db.close();
        return;
      }
      
      // 启用外键约束
      db.run("PRAGMA foreign_keys = ON", (err) => {
        if (err) {
          console.error('❌ 启用外键约束失败:', err);
          db.close();
          process.exit(1);
        }
        
        // 串行创建表
        db.serialize(() => {
          createIdeasTable(db, () => {
            createIdeaVotesTable(db, () => {
              createAiProcessingLogsTable(db, () => {
                verifyMigration(db);
              });
            });
          });
        });
      });
    });
  });
}

function createIdeasTable(db, callback) {
  if (process.env.NODE_ENV !== 'test') {
    console.log('📝 创建ideas表...');
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      content TEXT,
      author_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('pending', 'adopted', 'rejected')) DEFAULT 'pending',
      vote_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      adopted_by INTEGER,
      adopted_at DATETIME,
      project_id INTEGER,
      FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (adopted_by) REFERENCES users (id) ON DELETE SET NULL,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) {
      console.error('❌ 创建ideas表失败:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('✅ ideas表创建成功');
    callback();
  });
}

function createIdeaVotesTable(db, callback) {
  if (process.env.NODE_ENV !== 'test') {
    console.log('📝 创建idea_votes表...');
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS idea_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      votes_count INTEGER DEFAULT 1 CHECK(votes_count >= 1 AND votes_count <= 2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (idea_id) REFERENCES ideas (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(idea_id, user_id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ 创建idea_votes表失败:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('✅ idea_votes表创建成功');
    callback();
  });
}

function createAiProcessingLogsTable(db, callback) {
  if (process.env.NODE_ENV !== 'test') {
    console.log('📝 创建ai_processing_logs表...');
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS ai_processing_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER,
      process_type TEXT NOT NULL,
      input_data TEXT,
      output_data TEXT,
      ai_model TEXT,
      tokens_used INTEGER,
      cost REAL,
      status TEXT CHECK(status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
      error_message TEXT,
      processing_time_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (idea_id) REFERENCES ideas (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ 创建ai_processing_logs表失败:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('✅ ai_processing_logs表创建成功');
    callback();
  });
}

function verifyMigration(db) {
  console.log('🔍 验证迁移结果...');
  
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND (name='ideas' OR name='idea_votes' OR name='ai_processing_logs')", (err, tables) => {
    if (err) {
      console.error('❌ 验证表结构失败:', err);
    } else {
      console.log('📊 新创建的表:');
      console.table(tables);
    }
    
    // 验证表结构
    db.all("PRAGMA table_info(ideas)", (err, columns) => {
      if (err) {
        console.error('❌ 验证ideas表结构失败:', err);
      } else {
        console.log('📊 ideas表字段:');
        console.table(columns.map(col => ({ name: col.name, type: col.type, notnull: col.notnull })));
      }
      
      console.log('🎉 想法征集系统数据库迁移完成！');
      db.close();
    });
  });
}

module.exports = { runMigration };