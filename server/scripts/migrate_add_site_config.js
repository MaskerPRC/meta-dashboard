const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

// 检查当前工作目录是否是脚本目录
if (process.argv[1] === __filename) {
  runMigration();
}

function runMigration() {
  console.log('🔄 开始数据库迁移：添加site_config表...');
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ 数据库连接失败:', err.message);
      process.exit(1);
    }
    
    console.log('✅ 数据库连接成功');
    
    // 检查表是否已存在
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='site_config'", (err, row) => {
      if (err) {
        console.error('❌ 检查表存在性失败:', err);
        db.close();
        process.exit(1);
      }
      
      if (row) {
        console.log('⚠️  site_config表已存在，跳过迁移');
        db.close();
        return;
      }
      
      // 创建site_config表
      const createTableSQL = `
        CREATE TABLE site_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          description TEXT,
          type TEXT CHECK(type IN ('text', 'image', 'json', 'boolean')) DEFAULT 'text',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.run(createTableSQL, (err) => {
        if (err) {
          console.error('❌ 创建site_config表失败:', err);
          db.close();
          process.exit(1);
        }
        
        console.log('✅ site_config表创建成功');
        
        // 插入默认配置
        const defaultConfigs = [
          {
            key: 'wechat_group_qr',
            value: '',
            description: '微信群二维码图片URL',
            type: 'image'
          },
          {
            key: 'wechat_group_title', 
            value: '加入微信交流群',
            description: '微信群二维码标题',
            type: 'text'
          },
          {
            key: 'wechat_group_description',
            value: '扫描二维码加入我们的微信交流群，与其他开发者一起讨论AI项目',
            description: '微信群二维码描述',
            type: 'text'
          }
        ];
        
        const insertSQL = `
          INSERT INTO site_config (key, value, description, type, updated_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        
        let insertedCount = 0;
        
        defaultConfigs.forEach((config, index) => {
          db.run(insertSQL, [config.key, config.value, config.description, config.type], function(err) {
            if (err) {
              console.error(`❌ 插入默认配置失败 (${config.key}):`, err);
            } else {
              console.log(`✅ 插入默认配置: ${config.key}`);
            }
            
            insertedCount++;
            if (insertedCount === defaultConfigs.length) {
              console.log('🎉 数据库迁移完成！');
              db.close();
            }
          });
        });
      });
    });
  });
}

module.exports = { runMigration }; 