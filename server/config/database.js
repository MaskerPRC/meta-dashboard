require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径 - 使用环境变量
const dbPath = process.env.DB_PATH ? path.join(__dirname, '..', process.env.DB_PATH) : path.join(__dirname, '../data/ai_dashboard.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
  } else {
    console.log('✅ SQLite数据库连接成功');
    initDatabase();
  }
});

// 初始化数据库表
function initDatabase() {
  // 启用外键约束
  db.run("PRAGMA foreign_keys = ON");
  
  // 串行执行表创建，确保顺序
  db.serialize(() => {
    // 用户表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        github_id TEXT UNIQUE,
        google_id TEXT UNIQUE,
        username TEXT NOT NULL,
        email TEXT,
        avatar_url TEXT,
        display_name TEXT,
        is_admin BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ 创建用户表失败:', err);
      } else {
        console.log('✅ 用户表创建成功');
      }
    });

    // AI项目表
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        status TEXT CHECK(status IN ('idea', 'planning', 'development', 'testing', 'deployed', 'paused', 'completed')) DEFAULT 'idea',
        priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
        start_date DATE,
        due_date DATE,
        completion_date DATE,
        progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
        tech_stack TEXT,
        github_repo TEXT,
        demo_url TEXT,
        tags TEXT,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ 创建项目表失败:', err);
      } else {
        console.log('✅ 项目表创建成功');
      }
    });

    // 评论表
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('❌ 创建评论表失败:', err);
      } else {
        console.log('✅ 评论表创建成功');
        // 所有表创建完成后，再创建示例数据
        createSampleData();
      }
    });
  });
}

// 创建示例数据
function createSampleData() {
  // 检查是否已有项目数据
  db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
    if (err) {
      console.error('❌ 检查项目数据时出错:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('🎯 创建AI项目挑战示例数据...');
      
      const sampleProjects = [
        {
          title: "AI聊天机器人助手",
          description: "基于GPT的智能对话助手，支持多轮对话和上下文理解",
          content: "# AI聊天机器人助手\n\n## 项目概述\n这是一个基于最新GPT模型的智能聊天助手，旨在为用户提供高质量的对话体验。\n\n## 核心功能\n- 🤖 智能对话：支持多轮对话，理解上下文\n- 📝 文本生成：帮助用户生成各类文本内容\n- 🔍 信息查询：快速回答用户问题\n- 🎨 创意辅助：协助用户进行创意工作\n\n## 技术实现\n- 前端：React + TypeScript\n- 后端：Node.js + Express\n- AI模型：OpenAI GPT-4\n- 数据库：MongoDB\n\n## 开发进展\n- [x] 项目初始化\n- [x] API集成\n- [ ] 界面优化\n- [ ] 部署上线",
          status: "development",
          priority: "high",
          progress: 75,
          tech_stack: "React,Node.js,OpenAI,MongoDB",
          tags: "AI,聊天,GPT,对话"
        },
        {
          title: "智能代码生成器",
          description: "AI驱动的代码自动生成工具，支持多种编程语言",
          content: "# 智能代码生成器\n\n## 项目愿景\n让AI帮助开发者更高效地编写代码，减少重复性工作。\n\n## 主要特性\n- 💻 多语言支持：Python、JavaScript、Java、Go等\n- 🔧 代码优化：自动优化生成的代码\n- 📚 模板库：内置常用代码模板\n- 🧪 单元测试：自动生成测试代码\n\n## 开发计划\n1. 需求分析和设计\n2. 核心算法开发\n3. 前端界面实现\n4. 测试和优化\n5. 部署发布",
          status: "planning",
          priority: "medium",
          progress: 30,
          tech_stack: "Vue.js,Python,FastAPI,PostgreSQL",
          tags: "AI,代码生成,开发工具,自动化"
        },
        {
          title: "AI图像处理工具",
          description: "基于深度学习的图像增强和编辑工具",
          content: "# AI图像处理工具\n\n## 功能介绍\n使用先进的AI技术对图像进行智能处理和增强。\n\n## 核心功能\n- 🖼️ 图像增强：自动调色、去噪、锐化\n- 🎨 风格转换：艺术风格滤镜\n- 🔍 超分辨率：提升图像清晰度\n- ✂️ 智能抠图：自动背景移除\n\n## 技术栈\n- 深度学习框架：PyTorch\n- 图像处理：OpenCV\n- Web框架：Django\n- 前端：Vue.js",
          status: "idea",
          priority: "low",
          progress: 10,
          tech_stack: "PyTorch,OpenCV,Django,Vue.js",
          tags: "AI,图像处理,深度学习,计算机视觉"
        }
      ];

      const insertStmt = db.prepare(`
        INSERT INTO projects (title, description, content, status, priority, progress, tech_stack, tags, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      let insertedCount = 0;
      sampleProjects.forEach((project, index) => {
        insertStmt.run([
          project.title,
          project.description,
          project.content,
          project.status,
          project.priority,
          project.progress,
          project.tech_stack,
          project.tags,
          index + 1
        ], (err) => {
          if (err) {
            console.error('❌ 插入示例数据失败:', err);
          } else {
            insertedCount++;
            if (insertedCount === sampleProjects.length) {
              console.log('✅ 示例AI项目数据创建完成！');
            }
          }
        });
      });

      insertStmt.finalize();
    } else {
      console.log('📊 数据库已有项目数据，跳过示例数据创建');
    }
  });
}

module.exports = db; 