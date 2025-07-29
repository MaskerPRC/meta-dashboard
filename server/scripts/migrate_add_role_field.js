const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

// 检查当前工作目录是否是脚本目录
if (process.argv[1] === __filename) {
  runMigration();
}

function runMigration() {
  console.log('🔄 开始数据库迁移：添加用户角色字段...');
  
  // 先备份数据库
  const backupPath = path.join(__dirname, '../data', `ai_dashboard_backup_role_migration_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
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
    
    // 获取当前users表结构
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        console.error('❌ 获取表结构失败:', err);
        db.close();
        process.exit(1);
      }
      
      const existingColumns = columns.map(col => col.name);
      console.log('📊 当前users表字段:', existingColumns);
      
      // 检查是否已有role字段
      if (existingColumns.includes('role')) {
        console.log('⚠️  role字段已存在，跳过迁移');
        db.close();
        return;
      }
      
      // 添加role字段
      db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'viewer'", (err) => {
        if (err) {
          console.error('❌ 添加role字段失败:', err);
          db.close();
          process.exit(1);
        }
        
        console.log('✅ 添加role字段成功');
        
        // 将现有的is_admin值迁移到role字段
        db.run(`
          UPDATE users 
          SET role = CASE 
            WHEN is_admin = 1 THEN 'admin' 
            ELSE 'viewer' 
          END
        `, (err) => {
          if (err) {
            console.error('❌ 迁移is_admin数据到role字段失败:', err);
            db.close();
            process.exit(1);
          }
          
          console.log('✅ 成功迁移is_admin数据到role字段');
          
          // 验证迁移结果
          db.all("SELECT id, username, is_admin, role FROM users LIMIT 10", (err, users) => {
            if (err) {
              console.error('❌ 验证迁移结果失败:', err);
            } else {
              console.log('📊 迁移结果验证:');
              console.table(users);
            }
            
            console.log('🎉 数据库迁移完成！');
            db.close();
          });
        });
      });
    });
  });
}

module.exports = { runMigration };