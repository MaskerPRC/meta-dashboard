const express = require('express');
const passport = require('passport');
const router = express.Router();

// 手动设置Session Cookie的公共函数
const setManualSessionCookie = (req, res) => {
  const sessionSecret = process.env.SESSION_SECRET || 'ai-dashboard-secret-key-change-in-production';
  
  // 使用express-session的签名机制
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', sessionSecret)
    .update(req.sessionID)
    .digest('base64')
    .replace(/\=+$/, '');
  
  const signedSessionId = `s:${req.sessionID}.${signature}`;
  
  console.log('🔧 手动设置签名Cookie:', signedSessionId);
  
  // 手动设置Cookie（与express-session兼容）
  res.cookie('connect.sid', signedSessionId, {
    domain: '.agitao.net',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  
  console.log('🍪 手动Cookie设置完成');
};

// GitHub登录
router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}));

// GitHub回调
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login?error=github' }),
  (req, res) => {
    console.log('🔐 GitHub登录成功，用户ID:', req.user?.id);
    console.log('📝 Session ID:', req.sessionID);
    console.log('🧠 Session内容:', req.session);
    
    // 手动保存session
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('❌ Session保存失败:', saveErr);
        return res.status(500).send('Session保存失败');
      }
      
      console.log('✅ OAuth Session已保存');
      
      // 手动设置Cookie
      setManualSessionCookie(req, res);
      
      // 登录成功，重定向到前端
      const frontendUrl = process.env.FRONTEND_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://share.agitao.net' 
          : 'http://localhost:5173');
      
      const redirectUrl = frontendUrl;
      console.log('🔄 重定向到:', redirectUrl);
      res.redirect(redirectUrl);
    });
  }
);

// Google登录
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google回调
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google' }),
  (req, res) => {
    console.log('🔐 Google登录成功，用户ID:', req.user?.id);
    console.log('📝 Session ID:', req.sessionID);
    console.log('🧠 Session内容:', req.session);
    
    // 手动保存session
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('❌ Session保存失败:', saveErr);
        return res.status(500).send('Session保存失败');
      }
      
      console.log('✅ OAuth Session已保存');
      
      // 手动设置Cookie
      setManualSessionCookie(req, res);
      
      // 登录成功，重定向到前端
      const frontendUrl = process.env.FRONTEND_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://share.agitao.net' 
          : 'http://localhost:5173');
      
      console.log('🔄 Google重定向到:', frontendUrl);
      res.redirect(frontendUrl);
    });
  }
);

// 获取当前用户信息
router.get('/user', (req, res) => {
  console.log('👤 检查用户认证状态:', req.isAuthenticated());
  console.log('📄 Session ID:', req.sessionID);
  console.log('🧠 Session用户ID:', req.session?.passport?.user);
  
  if (req.isAuthenticated()) {
    console.log('✅ 用户已认证:', req.user?.username);
    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        avatar_url: req.user.avatar_url,
        display_name: req.user.display_name,
        is_admin: req.user.is_admin
      }
    });
  } else {
    console.log('❌ 用户未认证');
    res.status(401).json({
      success: false,
      message: '用户未登录'
    });
  }
});

// 登出
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '登出失败'
      });
    }
    res.json({
      success: true,
      message: '登出成功'
    });
  });
});

// 测试Cookie设置
router.get('/test-cookie', (req, res) => {
  console.log('🧪 测试Cookie设置');
  console.log('📄 当前Session ID:', req.sessionID);
  console.log('🍪 当前Cookies:', req.headers.cookie);
  
  // 设置测试cookie
  res.cookie('test-cookie', 'test-value', {
    domain: '.agitao.net',
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 60000 // 1分钟
  });
  
  // 强制设置session值并保存
  req.session.testValue = 'session-test-' + Date.now();
  console.log('💾 强制保存session...');
  
  req.session.save((err) => {
    if (err) {
      console.error('❌ Session保存失败:', err);
      return res.status(500).json({ error: 'Session保存失败', details: err.message });
    }
    
    console.log('✅ Session保存成功');
    console.log('📤 即将发送响应，当前响应头:', res.getHeaders());
    
    res.json({
      message: '测试Cookie已设置',
      sessionId: req.sessionID,
      testValue: req.session.testValue,
      headers: req.headers
    });
  });
});

// 简单测试接口
router.get('/simple-test', (req, res) => {
  console.log('🔬 简单测试接口');
  console.log('📄 Session ID:', req.sessionID);
  console.log('🧠 Session内容:', req.session);
  console.log('🏷️ Session是否新的:', req.session.isNew);
  
  // 强制修改session以触发保存
  req.session.simpleTest = Date.now();
  req.session.lastAccess = new Date().toISOString();
  
  // 强制标记session为已修改
  req.session.touch();
  
  console.log('🔄 强制触发session保存...');
  
  // 手动保存session
  req.session.save((err) => {
    if (err) {
      console.error('❌ Session保存失败:', err);
      return res.status(500).json({ error: 'Session保存失败' });
    }
    
    console.log('✅ Session手动保存成功');
    
    // 手动设置Cookie
    setManualSessionCookie(req, res);
    
    // 发送响应
    res.json({
      message: '简单测试',
      sessionId: req.sessionID,
      timestamp: req.session.simpleTest,
      lastAccess: req.session.lastAccess,
      manualCookie: true
    });
  });
});

// 检查登录状态
router.get('/status', (req, res) => {
  console.log('🔍 检查登录状态请求');
  console.log('📄 Session ID:', req.sessionID);
  console.log('🔐 已认证:', req.isAuthenticated());
  console.log('🧠 Session Passport:', req.session?.passport);
  console.log('🧪 Session测试值:', req.session?.testValue);
  console.log('👤 用户信息:', req.user ? `${req.user.username}(${req.user.id})` : 'null');
  
  res.json({
    isAuthenticated: req.isAuthenticated(),
    sessionId: req.sessionID,
    testValue: req.session?.testValue,
    user: req.isAuthenticated() ? {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      avatar_url: req.user.avatar_url,
      display_name: req.user.display_name,
      is_admin: req.user.is_admin
    } : null
  });
});

module.exports = router; 