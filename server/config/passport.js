const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
// 启用微信策略用于扫码登录
const WechatStrategy = require('passport-wechat').Strategy;
const bcrypt = require('bcryptjs');
const db = require('./database');

// 序列化用户
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 反序列化用户
passport.deserializeUser((id, done) => {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
    done(err, user);
  });
});

// 获取OAuth回调URL基础路径
const getCallbackBaseURL = () => {
  return process.env.OAUTH_CALLBACK_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://shareapi.agitao.net' 
      : `http://localhost:${process.env.PORT || 3015}`)
}

// GitHub OAuth策略
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
  callbackURL: process.env.GITHUB_CALLBACK_URL || `${getCallbackBaseURL()}/api/auth/github/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 检查用户是否已存在
    db.get("SELECT * FROM users WHERE github_id = ?", [profile.id], (err, existingUser) => {
      if (err) return done(err);

      if (existingUser) {
        // 用户已存在，更新信息
        db.run(`
          UPDATE users SET 
            username = ?, 
            email = ?, 
            avatar_url = ?, 
            display_name = ?
          WHERE github_id = ?
        `, [
          profile.username,
          profile.emails?.[0]?.value || '',
          profile.photos?.[0]?.value || '',
          profile.displayName || profile.username,
          profile.id
        ], function(updateErr) {
          if (updateErr) return done(updateErr);

          // 返回更新后的用户信息
          db.get("SELECT * FROM users WHERE github_id = ?", [profile.id], (selectErr, updatedUser) => {
            return done(selectErr, updatedUser);
          });
        });
      } else {
        // 新用户，创建账户
        // 检查是否是管理员（第一个GitHub用户或特定用户名）
        const isAdmin = profile.username === process.env.ADMIN_GITHUB_USERNAME || false;

        db.run(`
          INSERT INTO users (github_id, username, email, avatar_url, display_name, is_admin)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          profile.id,
          profile.username,
          profile.emails?.[0]?.value || '',
          profile.photos?.[0]?.value || '',
          profile.displayName || profile.username,
          isAdmin ? 1 : 0
        ], function(insertErr) {
          if (insertErr) return done(insertErr);

          // 返回新创建的用户
          db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (selectErr, newUser) => {
            return done(selectErr, newUser);
          });
        });
      }
    });
  } catch (error) {
    return done(error);
  }
}));

// Google OAuth策略
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `${getCallbackBaseURL()}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 检查用户是否已存在
    db.get("SELECT * FROM users WHERE google_id = ?", [profile.id], (err, existingUser) => {
      if (err) return done(err);

      if (existingUser) {
        // 用户已存在，更新信息
        db.run(`
          UPDATE users SET 
            username = ?, 
            email = ?, 
            avatar_url = ?, 
            display_name = ?
          WHERE google_id = ?
        `, [
          profile.emails?.[0]?.value?.split('@')[0] || profile.displayName,
          profile.emails?.[0]?.value || '',
          profile.photos?.[0]?.value || '',
          profile.displayName,
          profile.id
        ], function(updateErr) {
          if (updateErr) return done(updateErr);

          // 返回更新后的用户信息
          db.get("SELECT * FROM users WHERE google_id = ?", [profile.id], (selectErr, updatedUser) => {
            return done(selectErr, updatedUser);
          });
        });
      } else {
        // 新用户，创建账户
        // 检查是否是管理员（特定邮箱）
        const isAdmin = profile.emails?.[0]?.value === process.env.ADMIN_EMAIL || false;

        db.run(`
          INSERT INTO users (google_id, username, email, avatar_url, display_name, is_admin)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          profile.id,
          profile.emails?.[0]?.value?.split('@')[0] || profile.displayName,
          profile.emails?.[0]?.value || '',
          profile.photos?.[0]?.value || '',
          profile.displayName,
          isAdmin ? 1 : 0
        ], function(insertErr) {
          if (insertErr) return done(insertErr);

          // 返回新创建的用户
          db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (selectErr, newUser) => {
            return done(selectErr, newUser);
          });
        });
      }
    });
  } catch (error) {
    return done(error);
  }
}));

// 本地认证策略
passport.use(new LocalStrategy({
  usernameField: 'username', // 可以是用户名或邮箱
  passwordField: 'password'
}, (username, password, done) => {
  // 支持用户名或邮箱登录
  const query = username.includes('@') ? 
    "SELECT * FROM users WHERE email = ?" : 
    "SELECT * FROM users WHERE username = ?";
  
  db.get(query, [username], (err, user) => {
    if (err) {
      return done(err);
    }
    
    if (!user) {
      return done(null, false, { message: '用户不存在' });
    }
    
    // 检查用户是否设置了密码
    if (!user.password_hash || !user.salt) {
      return done(null, false, { message: '该账户未设置密码，请使用第三方登录' });
    }
    
    // 验证密码
    const isValidPassword = bcrypt.compareSync(password + user.salt, user.password_hash);
    if (!isValidPassword) {
      return done(null, false, { message: '密码错误' });
    }
    
    // 更新最后登录时间
    db.run("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [user.id], (updateErr) => {
      if (updateErr) {
        console.error('更新最后登录时间失败:', updateErr);
      }
    });
    
    return done(null, user);
  });
}));

// 微信开放平台扫码登录策略
passport.use(new WechatStrategy({
  appID: process.env.WECHAT_APP_ID || 'your-wechat-app-id',
  appSecret: process.env.WECHAT_APP_SECRET || 'your-wechat-app-secret',
  callbackURL: process.env.WECHAT_CALLBACK_URL || `${getCallbackBaseURL()}/api/auth/wechat/callback`,
  client: 'web', // 使用网站应用模式（扫码登录）
  scope: 'snsapi_login', // 开放平台扫码登录授权范围
  state: true // 启用 state 参数防止 CSRF
}, async (accessToken, refreshToken, profile, expires_in, done) => {
  try {
    console.log('微信登录 - 获取到的用户信息:', profile);
    console.log('微信登录 - expires_in:', expires_in);
    
    const openid = profile.openid;
    const wechatUser = {
      nickname: profile.nickname,
      headimgurl: profile.headimgurl,
      unionid: profile.unionid
    };

    // 获取管理员微信昵称列表（从环境变量读取）
    const adminWechatNicknames = process.env.ADMIN_WECHAT_NICKNAMES ?
      process.env.ADMIN_WECHAT_NICKNAMES.split(',').map(name => name.trim()) : [];

    // 判断用户角色：检查微信昵称是否在管理员列表中
    const isAdmin = adminWechatNicknames.length > 0 &&
      adminWechatNicknames.includes(wechatUser.nickname);
    const userRole = isAdmin ? 'admin' : 'viewer';

    // 使用 Promise 包装数据库操作
    const findUser = () => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE wechat_id = ?', [openid], (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    };

    const updateUser = (existingUser) => {
      return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET 
          username = ?, display_name = ?, avatar_url = ?, role = ?, is_admin = ?,
          wechat_unionid = ?, last_login = CURRENT_TIMESTAMP
          WHERE wechat_id = ?`, [
          wechatUser.nickname,
          wechatUser.nickname,
          wechatUser.headimgurl,
          userRole,
          isAdmin ? 1 : 0,
          wechatUser.unionid || null,
          openid
        ], function(err) {
          if (err) reject(err);
          else resolve(existingUser.id);
        });
      });
    };

    const createUser = () => {
      return new Promise((resolve, reject) => {
        db.run(`INSERT INTO users 
          (username, display_name, avatar_url, wechat_id, wechat_unionid, role, is_admin, created_at, last_login) 
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, [
          wechatUser.nickname,
          wechatUser.nickname,
          wechatUser.headimgurl,
          openid,
          wechatUser.unionid || null,
          userRole,
          isAdmin ? 1 : 0
        ], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
    };

    const getUserById = (userId) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    };

    // 主要逻辑
    const existingUser = await findUser();
    let userId;

    if (existingUser) {
      // 更新现有用户
      userId = await updateUser(existingUser);
      console.log(`微信登录成功 - 更新用户: ${wechatUser.nickname}, 角色: ${userRole}`);
    } else {
      // 创建新用户
      userId = await createUser();
      console.log(`微信登录成功 - 创建新用户: ${wechatUser.nickname}, 角色: ${userRole}`);
    }

    // 获取最终用户信息
    const finalUser = await getUserById(userId);
    return done(null, finalUser);

  } catch (error) {
    console.error('微信登录策略错误:', error);
    return done(error);
  }
}));

module.exports = passport;
