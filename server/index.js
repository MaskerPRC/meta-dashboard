
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

// Session配置 - 修复sameSite: none必须配合secure: true
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'ai-dashboard-secret-key-change-in-production',
  resave: true, // 强制保存session
  saveUninitialized: true, // 确保session被创建
  rolling: true, // 刷新session过期时间
  cookie: {
    secure: process.env.NODE_ENV === 'production', // 生产环境强制HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    // 移除domain设置，让express-session自动处理
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

console.log('🔧 Session配置:', sessionConfig);
app.use(session(sessionConfig));

// Cookie domain修复中间件
app.use((req, res, next) => {
  if (req.url.includes('/api/auth/')) {
    console.log('🛠️ Cookie修复中间件激活');
    
    const originalEnd = res.end;
    
    res.end = function(...args) {
      console.log('🏁 拦截res.end调用，检查Cookie...');
      
      // 在res.end时检查和修复Cookie（express-session在这时已设置Cookie）
      const cookies = res.getHeaders()['set-cookie'];
      console.log('🔍 检查end时的Cookie:', cookies);
      
      if (cookies && Array.isArray(cookies)) {
        const modifiedCookies = cookies.map(cookie => {
          if (cookie.includes('connect.sid') && !cookie.includes('Domain=')) {
            const modifiedCookie = cookie + '; Domain=.agitao.net';
            console.log('🔧 修复Cookie添加domain:', modifiedCookie);
            return modifiedCookie;
          }
          return cookie;
        });
        
        res.setHeader('Set-Cookie', modifiedCookies);
        console.log('✅ Cookie修复完成，最终Cookie:', res.getHeaders()['set-cookie']);
      } else {
        console.log('❌ 没有找到需要修复的Cookie');
      }
      
      return originalEnd.apply(this, args);
    };
  }
  
  next();
});

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
