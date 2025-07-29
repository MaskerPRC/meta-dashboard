const express = require('express');
const passport = require('passport');
const db = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
const crypto = require("crypto");
// 移除不再使用的 CryptoJS，因为 passport-wechat 自动处理 state 参数
const bcrypt = require("bcryptjs");
// axios 保留，其他地方可能还在使用
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// OAuth登录限流中间件
const oauthLoginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制每个IP在窗口期内最多5次请求
  message: {
    success: false,
    message: '登录请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 手动设置Session Cookie的公共函数
const setManualSessionCookie = (req, res) => {
  const sessionSecret = process.env.SESSION_SECRET || 'ai-dashboard-secret-key-change-in-production';

  // 使用express-session的签名机制
  const crypto = require('crypto');
  const signature = crypto
      .createHmac('sha256', sessionSecret)
      .update(req.sessionID)
      .digest('base64')

  const signedSessionId = `s:${req.sessionID}.${signature}`;

  // 根据环境设置Cookie配置
  const cookieOptions = {
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };

  if (process.env.NODE_ENV === 'production') {
    // 生产环境：跨子域名配置
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none';
  } else {
    // 开发环境：同域名配置（关键修复）
    cookieOptions.secure = false; // HTTP环境
    cookieOptions.sameSite = 'lax'; // 同域名不需要none
    // 开发环境不设置domain，让浏览器自动处理
  }

  // 手动设置Cookie（与express-session完全兼容）
  res.cookie('connect.sid', signedSessionId, cookieOptions);
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

// 微信开放平台扫码登录 - 使用 Passport 策略
router.get('/wechat', oauthLoginRateLimit, passport.authenticate('wechat', {
  // passport-wechat 会自动处理 state 参数和重定向
}));

// 微信登录回调处理 - 使用 Passport 策略
router.get('/wechat/callback', oauthLoginRateLimit,
  passport.authenticate('wechat', { 
    failureRedirect: '/login?error=wechat',
    session: false // 我们手动处理 session，保持与其他 OAuth 登录一致
  }),
  (req, res) => {
    // Passport 验证成功，用户信息在 req.user 中
    const user = req.user;
    
    if (!user) {
      console.error('微信登录失败 - 用户信息为空');
      const frontendUrl = process.env.FRONTEND_URL ||
        (process.env.NODE_ENV === 'production'
          ? 'https://share.agitao.net'
          : 'http://localhost:5173');
      return res.redirect(`${frontendUrl}/login?error=auth_failed&message=${encodeURIComponent('登录失败')}`);
    }

    // 手动登录用户（与其他 OAuth 登录保持一致）
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('微信登录 - Session登录失败:', loginErr);
        const frontendUrl = process.env.FRONTEND_URL ||
          (process.env.NODE_ENV === 'production'
            ? 'https://share.agitao.net'
            : 'http://localhost:5173');

        return res.redirect(`${frontendUrl}/login?error=session_error&message=${encodeURIComponent('登录状态保存失败')}`);
      }

      // 手动保存session（与其他 OAuth 登录保持一致）
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session保存失败:', saveErr);
          const frontendUrl = process.env.FRONTEND_URL ||
            (process.env.NODE_ENV === 'production'
              ? 'https://share.agitao.net'
              : 'http://localhost:5173');

          return res.redirect(`${frontendUrl}/login?error=session_error&message=${encodeURIComponent('登录状态保存失败')}`);
        }

        // 手动设置Cookie（与其他 OAuth 登录保持一致）
        setManualSessionCookie(req, res);

        // 根据用户角色决定重定向目标
        const frontendUrl = process.env.FRONTEND_URL ||
          (process.env.NODE_ENV === 'production'
            ? 'https://share.agitao.net'
            : 'http://localhost:5173');

        // 如果是管理员，重定向到管理页面，否则重定向到首页
        const redirectUrl = user.role === 'admin' ? `${frontendUrl}/admin` : frontendUrl;

        console.log(`微信登录成功 - 用户: ${user.username}, 角色: ${user.role}, 重定向到: ${redirectUrl}`);
        res.redirect(redirectUrl);
      });
    });
  }
);

// 微信公众号网页授权登录入口
router.get('/wechat-mp', oauthLoginRateLimit, (req, res) => {
  const appid = process.env.WECHAT_MP_APP_ID;
  if (!appid) {
    return res.status(400).json({
      success: false,
      message: '微信公众号未配置'
    });
  }

  // 获取前端URL
  const frontendUrl = process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://share.agitao.net'
      : 'http://localhost:5173');

  // 构建回调URL
  const callbackUrl = process.env.WECHAT_MP_CALLBACK_URL || 
    `${getCallbackBaseURL()}/api/auth/wechat-mp/callback`;

  // 生成state参数用于防CSRF攻击
  const state = crypto.randomBytes(16).toString('hex');
  
  // 保存state到session
  req.session.wechat_mp_state = state;
  req.session.wechat_mp_redirect = req.query.redirect || frontendUrl;

  // 构建微信授权URL
  const scope = 'snsapi_userinfo'; // 获取用户基本信息
  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

  res.redirect(authUrl);
});

// 微信公众号网页授权回调处理
router.get('/wechat-mp/callback', oauthLoginRateLimit, async (req, res) => {
  const { code, state } = req.query;
  
  // 验证state参数
  if (!state || state !== req.session.wechat_mp_state) {
    console.error('微信公众号登录 - State参数验证失败');
    const frontendUrl = process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://share.agitao.net'
        : 'http://localhost:5173');
    return res.redirect(`${frontendUrl}/login?error=wechat_mp&message=${encodeURIComponent('授权验证失败')}`);
  }

  if (!code) {
    console.error('微信公众号登录 - 未获取到授权码');
    const frontendUrl = process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://share.agitao.net'
        : 'http://localhost:5173');
    return res.redirect(`${frontendUrl}/login?error=wechat_mp&message=${encodeURIComponent('授权失败')}`);
  }

  try {
    const appid = process.env.WECHAT_MP_APP_ID;
    const secret = process.env.WECHAT_MP_APP_SECRET;

    if (!appid || !secret) {
      throw new Error('微信公众号配置不完整');
    }

    // 使用code换取access_token
    const tokenResponse = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
      params: {
        appid,
        secret,
        code,
        grant_type: 'authorization_code'
      }
    });

    const tokenData = tokenResponse.data;
    if (tokenData.errcode) {
      throw new Error(`微信授权失败: ${tokenData.errmsg}`);
    }

    const { access_token, openid, refresh_token, expires_in, scope: tokenScope, unionid } = tokenData;

    // 如果scope包含userinfo，获取用户信息
    let userInfo = { openid, unionid };
    if (tokenScope && tokenScope.includes('snsapi_userinfo')) {
      const userInfoResponse = await axios.get('https://api.weixin.qq.com/sns/userinfo', {
        params: {
          access_token,
          openid,
          lang: 'zh_CN'
        }
      });

      const userInfoData = userInfoResponse.data;
      if (!userInfoData.errcode) {
        userInfo = {
          openid: userInfoData.openid,
          nickname: userInfoData.nickname,
          sex: userInfoData.sex,
          province: userInfoData.province,
          city: userInfoData.city,
          country: userInfoData.country,
          headimgurl: userInfoData.headimgurl,
          unionid: userInfoData.unionid || unionid
        };
      }
    }

    // 处理用户登录逻辑
    const user = await handleWechatMpUser(userInfo);
    
    if (!user) {
      throw new Error('用户处理失败');
    }

    // 手动登录用户
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('微信公众号登录 - Session登录失败:', loginErr);
        const frontendUrl = process.env.FRONTEND_URL ||
          (process.env.NODE_ENV === 'production'
            ? 'https://share.agitao.net'
            : 'http://localhost:5173');
        return res.redirect(`${frontendUrl}/login?error=session_error&message=${encodeURIComponent('登录状态保存失败')}`);
      }

      // 手动保存session
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session保存失败:', saveErr);
          const frontendUrl = process.env.FRONTEND_URL ||
            (process.env.NODE_ENV === 'production'
              ? 'https://share.agitao.net'
              : 'http://localhost:5173');
          return res.redirect(`${frontendUrl}/login?error=session_error&message=${encodeURIComponent('登录状态保存失败')}`);
        }

        // 手动设置Cookie
        setManualSessionCookie(req, res);

        // 清除临时session数据
        delete req.session.wechat_mp_state;
        const redirectUrl = req.session.wechat_mp_redirect || 
          (process.env.FRONTEND_URL ||
            (process.env.NODE_ENV === 'production'
              ? 'https://share.agitao.net'
              : 'http://localhost:5173'));
        delete req.session.wechat_mp_redirect;

        console.log(`微信公众号登录成功 - 用户: ${user.username}, 角色: ${user.role}, 重定向到: ${redirectUrl}`);
        res.redirect(redirectUrl);
      });
    });

  } catch (error) {
    console.error('微信公众号登录错误:', error);
    const frontendUrl = process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://share.agitao.net'
        : 'http://localhost:5173');
    return res.redirect(`${frontendUrl}/login?error=wechat_mp&message=${encodeURIComponent('登录失败')}`);
  }
});

// 处理微信公众号用户信息的函数
async function handleWechatMpUser(userInfo) {
  return new Promise((resolve, reject) => {
    const { openid, unionid, nickname, headimgurl } = userInfo;
    
    // 获取管理员微信昵称列表
    const adminWechatNicknames = process.env.ADMIN_WECHAT_NICKNAMES ?
      process.env.ADMIN_WECHAT_NICKNAMES.split(',').map(name => name.trim()) : [];

    // 判断用户角色
    const isAdmin = adminWechatNicknames.length > 0 && nickname &&
      adminWechatNicknames.includes(nickname);
    const userRole = isAdmin ? 'admin' : 'viewer';

    // 查找用户逻辑：优先通过unionid查找，然后通过wechat_id（openid）查找
    let findUserQuery = 'SELECT * FROM users WHERE ';
    let findUserParams = [];

    if (unionid) {
      // 如果有unionid，优先通过unionid查找，这样可以统一不同平台的用户
      findUserQuery += 'wechat_unionid = ? OR wechat_id = ?';
      findUserParams = [unionid, openid];
    } else {
      // 如果没有unionid，只能通过openid查找
      findUserQuery += 'wechat_id = ?';
      findUserParams = [openid];
    }

    db.get(findUserQuery, findUserParams, (err, existingUser) => {
      if (err) {
        console.error('查找用户失败:', err);
        return reject(err);
      }

      if (existingUser) {
        // 用户已存在，更新用户信息
        const updateFields = [];
        const updateParams = [];

        // 更新基本信息
        if (nickname) {
          updateFields.push('username = ?', 'display_name = ?');
          updateParams.push(nickname, nickname);
        }
        if (headimgurl) {
          updateFields.push('avatar_url = ?');
          updateParams.push(headimgurl);
        }
        
        // 更新角色信息
        updateFields.push('role = ?', 'is_admin = ?');
        updateParams.push(userRole, isAdmin ? 1 : 0);

        // 更新微信相关字段
        if (unionid && !existingUser.wechat_unionid) {
          updateFields.push('wechat_unionid = ?');
          updateParams.push(unionid);
        }
        if (!existingUser.wechat_id) {
          updateFields.push('wechat_id = ?');
          updateParams.push(openid);
        }

        updateFields.push('last_login = CURRENT_TIMESTAMP');
        updateParams.push(existingUser.id);

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        
        db.run(updateQuery, updateParams, function(updateErr) {
          if (updateErr) {
            console.error('更新用户失败:', updateErr);
            return reject(updateErr);
          }

          // 返回更新后的用户信息
          db.get('SELECT * FROM users WHERE id = ?', [existingUser.id], (selectErr, updatedUser) => {
            if (selectErr) {
              return reject(selectErr);
            }
            console.log(`微信公众号登录成功 - 更新用户: ${updatedUser.username}, 角色: ${updatedUser.role}`);
            resolve(updatedUser);
          });
        });
      } else {
        // 新用户，创建账户
        const createParams = [
          nickname || `微信用户_${openid.slice(-8)}`, // username
          nickname || `微信用户_${openid.slice(-8)}`, // display_name
          headimgurl || null, // avatar_url
          openid, // wechat_id
          unionid || null, // wechat_unionid
          userRole, // role
          isAdmin ? 1 : 0 // is_admin
        ];

        db.run(`INSERT INTO users 
          (username, display_name, avatar_url, wechat_id, wechat_unionid, role, is_admin, created_at, last_login) 
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, 
          createParams, 
          function(insertErr) {
            if (insertErr) {
              console.error('创建用户失败:', insertErr);
              return reject(insertErr);
            }

            // 返回新创建的用户
            db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (selectErr, newUser) => {
              if (selectErr) {
                return reject(selectErr);
              }
              console.log(`微信公众号登录成功 - 创建新用户: ${newUser.username}, 角色: ${newUser.role}`);
              resolve(newUser);
            });
          }
        );
      }
    });
  });
}

// 获取OAuth回调URL基础路径
const getCallbackBaseURL = () => {
  return process.env.OAUTH_CALLBACK_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://shareapi.agitao.net' 
      : `http://localhost:${process.env.PORT || 3015}`)
}

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
        is_admin: req.user.is_admin,
        role: req.user.role || (req.user.is_admin ? 'admin' : 'viewer'), // 向后兼容
        login_type: req.user.wechat_id ? 'wechat' :
                   (req.user.github_id ? 'github' :
                   (req.user.google_id ? 'google' : 'local'))
      }
    });
  } else {
    return ResponseHelper.authError(res, req, 'errors.auth.required');
  }
});

// 本地登录
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return ResponseHelper.serverError(res, req, 'errors.server.internal_error');
    }

    if (!user) {
      return ResponseHelper.authError(res, req, 'errors.auth.login_failed');
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return ResponseHelper.serverError(res, req, 'errors.auth.login_failed');
      }

      // ✨ 关键修复：使用与GitHub登录相同的session保存和cookie设置方法
      req.session.save((saveErr) => {
        if (saveErr) {
          console.log(`❌ [LOGIN] Session保存失败:`, saveErr);
          return ResponseHelper.serverError(res, req, 'errors.auth.login_failed');
        }

        // 手动设置Cookie（与GitHub登录相同的方法）
        setManualSessionCookie(req, res);


        res.json({
          success: true,
          message: req.t('success.login'),
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            display_name: user.display_name,
            is_admin: user.is_admin,
            role: user.role || (user.is_admin ? 'admin' : 'viewer'), // 向后兼容
            login_type: user.wechat_id ? 'wechat' :
                       (user.github_id ? 'github' :
                       (user.google_id ? 'google' : 'local'))
          }
        });
      });
    });
  })(req, res, next);
});

// 注册
router.post('/register', (req, res) => {
  const { username, email, password, confirmPassword, phone } = req.body;

  // 验证输入
  if (!username || !email || !password) {
    return ResponseHelper.validationError(res, req, 'errors.validation.required_field');
  }

  if (password !== confirmPassword) {
    return ResponseHelper.validationError(res, req, 'errors.auth.password_mismatch');
  }

  if (password.length < 6) {
    return ResponseHelper.validationError(res, req, 'errors.auth.password_too_short');
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
              is_admin: newUser.is_admin,
              role: newUser.role || (newUser.is_admin ? 'admin' : 'viewer'), // 向后兼容
              login_type: 'local'
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

// 更新用户基本信息
router.put('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return ResponseHelper.authError(res, req, 'errors.auth.required');
  }

  const { display_name, email } = req.body;
  const userId = req.user.id;

  // 验证输入
  if (!display_name || display_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: '显示名称不能为空'
    });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: '邮箱格式不正确'
    });
  }

  // 检查邮箱是否已被其他用户使用
  if (email) {
    db.get("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId], (err, existingUser) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '检查邮箱失败'
        });
      }

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被其他用户使用'
        });
      }

      // 更新用户信息
      updateUserProfile();
    });
  } else {
    updateUserProfile();
  }

  function updateUserProfile() {
    const updateFields = [];
    const updateValues = [];

    if (display_name) {
      updateFields.push('display_name = ?');
      updateValues.push(display_name.trim());
    }

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    updateValues.push(userId);

    db.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
      function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: '更新用户信息失败'
          });
        }

        // 获取更新后的用户信息
        db.get("SELECT * FROM users WHERE id = ?", [userId], (selectErr, updatedUser) => {
          if (selectErr) {
            return res.status(500).json({
              success: false,
              message: '获取更新后的用户信息失败'
            });
          }

          res.json({
            success: true,
            message: '用户信息更新成功',
            user: {
              id: updatedUser.id,
              username: updatedUser.username,
              email: updatedUser.email,
              avatar_url: updatedUser.avatar_url,
              display_name: updatedUser.display_name,
              is_admin: updatedUser.is_admin,
              role: updatedUser.role || (updatedUser.is_admin ? 'admin' : 'viewer'), // 向后兼容
              login_type: updatedUser.wechat_id ? 'wechat' :
                         (updatedUser.github_id ? 'github' :
                         (updatedUser.google_id ? 'google' : 'local'))
            }
          });
        });
      }
    );
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
      is_admin: req.user.is_admin,
      role: req.user.role || (req.user.is_admin ? 'admin' : 'viewer'), // 向后兼容
      login_type: req.user.wechat_id ? 'wechat' :
                 (req.user.github_id ? 'github' :
                 (req.user.google_id ? 'google' : 'local'))
    } : null
  });
});

module.exports = router;
