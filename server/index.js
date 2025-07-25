
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
app.use(session({
  secret: process.env.SESSION_SECRET || 'ai-dashboard-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true, // 刷新session过期时间
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    domain: process.env.NODE_ENV === 'production' 
      ? process.env.COOKIE_DOMAIN || '.agitao.net'
      : undefined, // 开发环境不设置domain
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Session调试日志
app.use((req, res, next) => {
  if (req.url.includes('/api/auth/')) {
    console.log(`🔍 [${req.method}] ${req.url}`);
    console.log('📄 Session ID:', req.sessionID);
    console.log('🔐 已认证:', req.isAuthenticated?.());
    console.log('🍪 Cookies:', req.headers.cookie);
  }
  next();
});

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

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
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
