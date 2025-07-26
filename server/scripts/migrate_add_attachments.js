const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, `../data/ai_dashboard_backup_migration_${timestamp}.db`);
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log('✅ 数据库备份成功:', backupPath);
    return true;
  } catch (error) {
    console.error('❌ 数据库备份失败:', error);
    return false;
  }
}

function migrateDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🔄 开始数据库迁移...');
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ 数据库连接失败:', err);
        reject(err);
        return;
      }
      
      console.log('✅ 数据库连接成功');
      
      // 检查attachments字段是否已存在
      db.all("PRAGMA table_info(comments)", (err, columns) => {
        if (err) {
          console.error('❌ 获取表结构失败:', err);
          reject(err);
          return;
        }
        
        const hasAttachments = columns.some(col => col.name === 'attachments');
        
        if (hasAttachments) {
          console.log('ℹ️ attachments字段已存在，跳过迁移');
          db.close();
          resolve();
          return;
        }
        
        // 添加attachments字段
        const sql = `ALTER TABLE comments ADD COLUMN attachments TEXT DEFAULT '{"images":[],"videos":[]}'`;
        
        db.run(sql, (err) => {
          if (err) {
            console.error('❌ 添加attachments字段失败:', err);
            reject(err);
            return;
          }
          
          console.log('✅ attachments字段添加成功');
          
          // 验证迁移结果
          db.all("PRAGMA table_info(comments)", (err, newColumns) => {
            if (err) {
              console.error('❌ 验证迁移结果失败:', err);
              reject(err);
              return;
            }
            
            console.log('📋 迁移后的comments表结构:');
            newColumns.forEach(col => {
              console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
            });
            
            db.close((closeErr) => {
              if (closeErr) {
                console.error('❌ 关闭数据库连接失败:', closeErr);
                reject(closeErr);
              } else {
                console.log('✅ 数据库迁移完成');
                resolve();
              }
            });
          });
        });
      });
    });
  });
}

async function main() {
  try {
    console.log('🚀 开始评论附件功能数据库迁移');
    
    // 1. 创建备份
    if (!createBackup()) {
      throw new Error('数据库备份失败');
    }
    
    // 2. 执行迁移
    await migrateDatabase();
    
    console.log('🎉 迁移完成！');
    
  } catch (error) {
    console.error('💥 迁移失败:', error);
    process.exit(1);
  }
}

// 只有直接运行此脚本时才执行迁移
if (process.argv[1] === __filename) {
  main();
}

module.exports = { createBackup, migrateDatabase }; 