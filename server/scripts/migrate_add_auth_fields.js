const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

// 检查当前工作目录是否是脚本目录
if (process.argv[1] === __filename) {
  runMigration();
}

function runMigration() {
  console.log('🔄 开始数据库迁移：添加微信和本地认证字段...');
  
  // 先备份数据库
  const backupPath = path.join(__dirname, '../data', `ai_dashboard_backup_migration_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
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
      
      // 需要添加的字段
      const fieldsToAdd = [
        {
          name: 'wechat_id',
          sql: 'ALTER TABLE users ADD COLUMN wechat_id TEXT',
          description: '微信用户ID'
        },
        {
          name: 'wechat_unionid', 
          sql: 'ALTER TABLE users ADD COLUMN wechat_unionid TEXT',
          description: '微信unionid'
        },
        {
          name: 'password_hash',
          sql: 'ALTER TABLE users ADD COLUMN password_hash TEXT',
          description: '密码哈希'
        },
        {
          name: 'salt',
          sql: 'ALTER TABLE users ADD COLUMN salt TEXT',
          description: '密码盐值'
        },
        {
          name: 'phone',
          sql: 'ALTER TABLE users ADD COLUMN phone TEXT',
          description: '手机号'
        },
        {
          name: 'last_login',
          sql: 'ALTER TABLE users ADD COLUMN last_login DATETIME',
          description: '最后登录时间'
        }
      ];
      
      // 检查并添加字段
      let addedCount = 0;
      let skippedCount = 0;
      
      const processNextField = (index) => {
        if (index >= fieldsToAdd.length) {
          console.log(`🎉 数据库迁移完成！添加了 ${addedCount} 个字段，跳过了 ${skippedCount} 个已存在的字段`);
          db.close();
          return;
        }
        
        const field = fieldsToAdd[index];
        
        if (existingColumns.includes(field.name)) {
          console.log(`⚠️  字段 ${field.name} 已存在，跳过`);
          skippedCount++;
          processNextField(index + 1);
          return;
        }
        
        db.run(field.sql, (err) => {
          if (err) {
            console.error(`❌ 添加字段 ${field.name} 失败:`, err);
            db.close();
            process.exit(1);
          }
          
          console.log(`✅ 添加字段: ${field.name} (${field.description})`);
          addedCount++;
          processNextField(index + 1);
        });
      };
      
      processNextField(0);
    });
  });
}

module.exports = { runMigration }; 