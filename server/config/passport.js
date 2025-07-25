const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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

// GitHub OAuth策略
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback'
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
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
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

module.exports = passport; 