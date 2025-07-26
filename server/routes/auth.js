const express = require('express');
const passport = require('passport');
const db = require('../config/database');
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

// 微信登录
router.get('/wechat', passport.authenticate('wechat'));

// 微信回调
router.get('/wechat/callback',
  passport.authenticate('wechat', { failureRedirect: '/login?error=wechat' }),
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

// 本地登录
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '登录过程中发生错误'
      });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message || '登录失败'
      });
    }
    
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({
          success: false,
          message: '登录失败'
        });
      }
      
      res.json({
        success: true,
        message: '登录成功',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          display_name: user.display_name,
          is_admin: user.is_admin
        }
      });
    });
  })(req, res, next);
});

// 注册
router.post('/register', (req, res) => {
  const { username, email, password, confirmPassword, phone } = req.body;
  
  // 验证输入
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: '用户名、邮箱和密码不能为空'
    });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: '两次输入的密码不一致'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: '密码长度至少6位'
    });
  }
  
  // 检查用户名和邮箱是否已存在
  db.get("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], (err, existingUser) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '注册失败，数据库错误'
      });
    }
    
    if (existingUser) {
      const field = existingUser.username === username ? '用户名' : '邮箱';
      return res.status(400).json({
        success: false,
        message: `${field}已被注册`
      });
    }
    
    // 生成盐值和密码哈希
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password + salt, 10);
    
    // 创建新用户
    db.run(`
      INSERT INTO users (username, email, password_hash, salt, phone, display_name, created_at, last_login)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [username, email, hash, salt, phone || null, username], function(insertErr) {
      if (insertErr) {
        return res.status(500).json({
          success: false,
          message: '注册失败'
        });
      }
      
      // 获取新创建的用户信息
      db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (selectErr, newUser) => {
        if (selectErr) {
          return res.status(500).json({
            success: false,
            message: '注册成功但获取用户信息失败'
          });
        }
        
        // 自动登录
        req.logIn(newUser, (loginErr) => {
          if (loginErr) {
            return res.json({
              success: true,
              message: '注册成功，请手动登录',
              user: null
            });
          }
          
          res.json({
            success: true,
            message: '注册成功',
            user: {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              avatar_url: newUser.avatar_url,
              display_name: newUser.display_name,
              is_admin: newUser.is_admin
            }
          });
        });
      });
    });
  });
});

// 修改密码
router.post('/change-password', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }
  
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: '当前密码和新密码不能为空'
    });
  }
  
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: '两次输入的新密码不一致'
    });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: '新密码长度至少6位'
    });
  }
  
  const userId = req.user.id;
  
  // 获取用户当前信息
  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) {
      return res.status(500).json({
        success: false,
        message: '获取用户信息失败'
      });
    }
    
    // 如果用户没有设置过密码，允许直接设置新密码
    if (!user.password_hash || !user.salt) {
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword + salt, 10);
      
      db.run("UPDATE users SET password_hash = ?, salt = ? WHERE id = ?", [hash, salt, userId], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({
            success: false,
            message: '设置密码失败'
          });
        }
        
        res.json({
          success: true,
          message: '密码设置成功'
        });
      });
      return;
    }
    
    // 验证当前密码
    const bcrypt = require('bcryptjs');
    const isValidPassword = bcrypt.compareSync(currentPassword + user.salt, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      });
    }
    
    // 生成新的盐值和密码哈希
    const newSalt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword + newSalt, 10);
    
    db.run("UPDATE users SET password_hash = ?, salt = ? WHERE id = ?", [newHash, newSalt, userId], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({
          success: false,
          message: '修改密码失败'
        });
      }
      
      res.json({
        success: true,
        message: '密码修改成功'
      });
    });
  });
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