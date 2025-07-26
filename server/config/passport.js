const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
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

// 微信OAuth策略
passport.use(new WechatStrategy({
  appID: process.env.WECHAT_APP_ID || 'your-wechat-app-id',
  appSecret: process.env.WECHAT_APP_SECRET || 'your-wechat-app-secret',
  callbackURL: process.env.WECHAT_CALLBACK_URL || `${getCallbackBaseURL()}/api/auth/wechat/callback`,
  scope: 'snsapi_login' // 网站应用使用snsapi_login，获取用户基本信息
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('微信登录 - 用户信息:', profile);
    
    // 检查用户是否已存在（使用unionid或openid）
    const wechatId = profile.unionid || profile.openid;
    
    db.get("SELECT * FROM users WHERE wechat_id = ? OR wechat_unionid = ?", [wechatId, profile.unionid], (err, existingUser) => {
      if (err) return done(err);

      if (existingUser) {
        // 用户已存在，更新信息
        db.run(`
          UPDATE users SET 
            wechat_id = ?,
            wechat_unionid = ?,
            username = ?, 
            avatar_url = ?, 
            display_name = ?,
            last_login = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [
          profile.openid,
          profile.unionid || null,
          existingUser.username || profile.nickname || `wechat_${profile.openid.slice(-8)}`,
          profile.headimgurl || '',
          profile.nickname || existingUser.display_name,
          existingUser.id
        ], function(updateErr) {
          if (updateErr) return done(updateErr);

          // 返回更新后的用户信息
          db.get("SELECT * FROM users WHERE id = ?", [existingUser.id], (selectErr, updatedUser) => {
            return done(selectErr, updatedUser);
          });
        });
      } else {
        // 新用户，创建账户
        // 生成唯一用户名
        const baseUsername = profile.nickname || `wechat_${profile.openid.slice(-8)}`;
        let username = baseUsername;
        
        // 确保用户名唯一
        const checkUsernameAndCreate = (attemptUsername, attempt = 1) => {
          db.get("SELECT * FROM users WHERE username = ?", [attemptUsername], (checkErr, existingUsername) => {
            if (checkErr) return done(checkErr);
            
            if (existingUsername) {
              // 用户名已存在，尝试新的用户名
              const newUsername = `${baseUsername}_${attempt}`;
              checkUsernameAndCreate(newUsername, attempt + 1);
            } else {
              // 用户名可用，创建用户
              db.run(`
                INSERT INTO users (wechat_id, wechat_unionid, username, avatar_url, display_name, created_at, last_login)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              `, [
                profile.openid,
                profile.unionid || null,
                attemptUsername,
                profile.headimgurl || '',
                profile.nickname || attemptUsername
              ], function(insertErr) {
                if (insertErr) return done(insertErr);

                // 返回新创建的用户
                db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (selectErr, newUser) => {
                  console.log('微信登录 - 新用户创建成功:', newUser?.username);
                  return done(selectErr, newUser);
                });
              });
            }
          });
        };
        
        checkUsernameAndCreate(username);
      }
    });
  } catch (error) {
    console.error('微信登录失败:', error);
    return done(error);
  }
}));

module.exports = passport;
