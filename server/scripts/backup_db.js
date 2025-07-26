const fs = require('fs');
const path = require('path');

// 创建数据库备份
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0,19).replace('T', '_');
  const dbPath = path.join(__dirname, '../data/ai_dashboard.db');
  const backupPath = path.join(__dirname, `../data/ai_dashboard_backup_${timestamp}.db`);
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log('✅ 数据库备份成功:', backupPath);
    return backupPath;
  } catch (error) {
    console.error('❌ 数据库备份失败:', error);
    return null;
  }
}

// 直接运行时执行备份
if (process.argv[1] === __filename) {
  createBackup();
}

module.exports = { createBackup }; 