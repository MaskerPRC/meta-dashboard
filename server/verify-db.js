const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/ai_dashboard.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    return;
  }
  
  console.log('✅ 数据库连接成功');
  
  // 检查表
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ 查询表失败:', err);
      return;
    }
    
    console.log('📋 数据库表:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // 检查项目数量
    db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
      if (err) {
        console.error('❌ 查询项目数量失败:', err);
        return;
      }
      
      console.log(`\n📊 项目总数: ${row.count}`);
      
      if (row.count > 0) {
        // 检查项目数据
        db.all("SELECT id, title, status, priority FROM projects LIMIT 5", (err, projects) => {
          if (err) {
            console.error('❌ 查询项目失败:', err);
            return;
          }
          
          console.log('\n🎯 示例项目数据:');
          projects.forEach(project => {
            console.log(`  - ${project.id}: ${project.title} [${project.status}/${project.priority}]`);
          });
          
          db.close();
          console.log('\n✅ 数据库验证完成！');
        });
      } else {
        console.log('\n⚠️  没有找到项目数据，可能需要重新创建示例数据');
        db.close();
      }
    });
  });
}); 