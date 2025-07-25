const express = require('express');
const passport = require('passport');
const router = express.Router();

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
    console.log('🍪 Session Cookie:', req.headers.cookie);
    
    // 登录成功，重定向到前端
    const frontendUrl = process.env.FRONTEND_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://share.agitao.net' 
        : 'http://localhost:5173');
    
    // 检查是否有重定向参数
    const redirectTo = req.session.redirectTo || '/';
    delete req.session.redirectTo; // 清除重定向参数
    
    const redirectUrl = `${frontendUrl}${redirectTo}`;
    console.log('🔄 重定向到:', redirectUrl);
    res.redirect(redirectUrl);
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
    console.log('Google登录成功，用户ID:', req.user?.id);
    console.log('Session ID:', req.sessionID);
    
    // 登录成功，重定向到前端
    const frontendUrl = process.env.FRONTEND_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://share.agitao.net' 
        : 'http://localhost:5173');
    
    console.log('🔄 Google重定向到:', frontendUrl);
    res.redirect(frontendUrl);
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

// 检查登录状态
router.get('/status', (req, res) => {
  console.log('🔍 检查登录状态请求');
  console.log('📄 Session ID:', req.sessionID);
  console.log('🔐 已认证:', req.isAuthenticated());
  console.log('🧠 Session Passport:', req.session?.passport);
  console.log('👤 用户信息:', req.user ? `${req.user.username}(${req.user.id})` : 'null');
  
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