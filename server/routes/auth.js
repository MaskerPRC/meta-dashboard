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
    // 登录成功，重定向到前端
    const redirectUrl = process.env.NODE_ENV === 'production' 
      ? '/' 
      : 'http://localhost:5173/';
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
    // 登录成功，重定向到前端
    const redirectUrl = process.env.NODE_ENV === 'production' 
      ? '/' 
      : 'http://localhost:5173/';
    res.redirect(redirectUrl);
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