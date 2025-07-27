#!/usr/bin/env node

/**
 * 创建管理员用户脚本
 * 用法: node scripts/create_admin_user.js
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const readline = require('readline');

// 数据库路径
const dbPath = path.join(__dirname, '../data/ai_dashboard.db');

// 创建读取输入的接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 隐藏密码输入的函数
function hiddenInput(prompt) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    let input = '';
    process.stdout.write(prompt);
    
    stdin.on('data', (char) => {
      char = char + '';
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeAllListeners('data');
          process.stdout.write('\n');
          resolve(input);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u0008':
        case '\u007f':
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          input += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

// 普通输入函数
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// 验证邮箱格式
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 创建管理员用户
async function createAdminUser() {
  console.log('🔐 创建管理员账户');
  console.log('='.repeat(40));
  
  try {
    // 获取用户输入
    const username = await question('用户名: ');
    if (!username || username.length < 3) {
      console.error('❌ 用户名至少需要3个字符');
      process.exit(1);
    }
    
    const email = await question('邮箱: ');
    if (!email || !isValidEmail(email)) {
      console.error('❌ 请输入有效的邮箱地址');
      process.exit(1);
    }
    
    const password = await hiddenInput('密码: ');
    if (!password || password.length < 6) {
      console.error('❌ 密码至少需要6个字符');
      process.exit(1);
    }
    
    const confirmPassword = await hiddenInput('确认密码: ');
    if (password !== confirmPassword) {
      console.error('❌ 两次输入的密码不一致');
      process.exit(1);
    }
    
    // 连接数据库
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ 数据库连接失败:', err.message);
        process.exit(1);
      }
    });
    
    // 检查用户名和邮箱是否已存在
    const existingUser = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existingUser) {
      const field = existingUser.username === username ? '用户名' : '邮箱';
      console.error(`❌ ${field}已被注册`);
      db.close();
      process.exit(1);
    }
    
    // 生成密码哈希
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password + salt, 10);
    
    // 创建管理员用户
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO users (username, email, password_hash, salt, display_name, is_admin, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [username, email, hash, salt, username], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    console.log('✅ 管理员账户创建成功!');
    console.log(`👤 用户名: ${username}`);
    console.log(`📧 邮箱: ${email}`);
    console.log(`🔑 权限: 管理员`);
    console.log('');
    console.log('现在您可以使用该账户登录系统了！');
    
    db.close();
    rl.close();
    
  } catch (error) {
    console.error('❌ 创建管理员账户失败:', error.message);
    rl.close();
    process.exit(1);
  }
}

// 主函数
async function main() {
  console.log('AI项目看板 - 管理员账户创建工具');
  console.log('');
  
  try {
    await createAdminUser();
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  }
}

// 执行脚本
if (require.main === module) {
  main();
}

module.exports = { createAdminUser }; 