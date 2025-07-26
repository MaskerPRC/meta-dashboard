
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3015;

// 信任代理设置（用于部署在反向代理后面）
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // 信任第一级代理
}

// 安全中间件
app.use(helmet());

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP最多100个请求
});
app.use(limiter);

// CORS配置
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    // 生产环境：从环境变量获取允许的域名，支持多个域名用逗号分隔
    const origins = process.env.ALLOWED_ORIGINS || 'https://share.agitao.net'
    return origins.split(',').map(origin => origin.trim())
  } else {
    // 开发环境
    return ['http://localhost:5173', 'http://127.0.0.1:5173']
  }
}

app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session配置
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'ai-dashboard-secret-key-change-in-production',
  resave: true,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

app.use(session(sessionConfig));

// Passport配置
app.use(passport.initialize());
app.use(passport.session());

// 数据库初始化
require('./config/database');

// Passport策略配置
require('./config/passport');

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/config', require('./routes/config'));
app.use('/api/upload', require('./routes/upload'));

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  const indexPath = path.join(distPath, 'index.html');
  
  // 检查前端构建文件是否存在
  const fs = require('fs');
  if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
    console.log('📁 前端构建文件存在，启用静态文件服务');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      // 排除API路由
      if (!req.path.startsWith('/api/')) {
        res.sendFile(indexPath);
      }
    });
  } else {
    console.log('⚠️ 前端构建文件不存在，跳过静态文件服务');
    console.log('📁 查找路径:', distPath);
    
    // 为非API路由返回简单提示
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.status(404).json({ 
          message: '前端应用未构建', 
          note: '请运行 npm run build 构建前端应用' 
        });
      }
    });
  }
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI项目看板服务器运行在端口 ${PORT}`);
  console.log(`📊 为"一年100个AI产品挑战"提供支持！`);
});
