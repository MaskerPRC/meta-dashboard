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
};

// GitHub登录
router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}));

// GitHub回调
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login?error=github' }),
  (req, res) => {
    // 手动保存session
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Session保存失败:', saveErr);
        return res.status(500).send('Session保存失败');
      }
      
      // 手动设置Cookie
      setManualSessionCookie(req, res);
      
      // 登录成功，重定向到前端
      const frontendUrl = process.env.FRONTEND_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://share.agitao.net' 
          : 'http://localhost:5173');
      
      res.redirect(frontendUrl);
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
    // 手动保存session
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Session保存失败:', saveErr);
        return res.status(500).send('Session保存失败');
      }
      
      // 手动设置Cookie
      setManualSessionCookie(req, res);
      
      // 登录成功，重定向到前端
      const frontendUrl = process.env.FRONTEND_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://share.agitao.net' 
          : 'http://localhost:5173');
      
      res.redirect(frontendUrl);
    });
  }
);

// 获取当前用户信息
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
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



// 检查登录状态
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
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