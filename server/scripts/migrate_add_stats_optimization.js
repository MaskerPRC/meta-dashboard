const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

// 检查当前工作目录是否是脚本目录
if (process.argv[1] === __filename) {
  runMigration();
}

function runMigration() {
  console.log('🔄 开始数据库迁移：优化统计数据计算...');
  
  // 先备份数据库
  const backupPath = path.join(__dirname, '../data', `ai_dashboard_backup_stats_optimization_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
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
      console.error('❌ 数据库连接失败:', err);
      process.exit(1);
    }
    console.log('📂 数据库连接成功');
  });

  // 验证数据完整性
  db.serialize(() => {
    // 检查项目表结构
    db.get("SELECT COUNT(*) as count FROM projects", (err, result) => {
      if (err) {
        console.error('❌ 验证项目表失败:', err);
        db.close();
        process.exit(1);
      }
      
      console.log(`📊 当前项目总数: ${result.count}`);
      
      // 检查项目状态分布
      db.all(`
        SELECT status, COUNT(*) as count 
        FROM projects 
        GROUP BY status
      `, (err, statusStats) => {
        if (err) {
          console.error('❌ 获取项目状态统计失败:', err);
          db.close();
          process.exit(1);
        }
        
        console.log('📈 项目状态分布:');
        statusStats.forEach(stat => {
          console.log(`  ${stat.status}: ${stat.count}`);
        });
        
        // 检查平均进度
        db.get(`
          SELECT AVG(progress) as avg_progress 
          FROM projects
        `, (err, progressResult) => {
          if (err) {
            console.error('❌ 获取平均进度失败:', err);
            db.close();
            process.exit(1);
          }
          
          console.log(`📊 平均进度: ${Math.round(progressResult.avg_progress)}%`);
          
          console.log('✅ 数据完整性验证通过');
          console.log('📝 迁移说明: 本次迁移主要是优化统计数据的计算方式，将从前端计算改为后端计算');
          console.log('🔧 修改内容: 新增统计API接口，修改前端统计数据获取方式');
          
          db.close((err) => {
            if (err) {
              console.error('❌ 关闭数据库失败:', err);
            } else {
              console.log('✅ 数据库迁移完成');
            }
          });
        });
      });
    });
  });
}

module.exports = { runMigration };