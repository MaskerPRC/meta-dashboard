# AI项目看板工具 🚀

专为"一年100个AI产品挑战"定制的项目进展管理看板

## ✨ 功能特性

- 📊 **可视化看板** - 直观展示100个AI项目的进展状态
- ✅ **任务管理** - 支持新增任务，点击查看详细描述
- 📝 **Markdown支持** - 任务描述支持Markdown格式编写
- 🔐 **OAuth登录** - 支持GitHub和Google账号登录
- 👑 **权限管理** - 管理员全权限，普通用户只读+评论
- 💬 **评论系统** - 登录用户可对项目进行评论互动
- 🎨 **AI主题风格** - 专为AI项目开发场景设计的现代化界面

## 🛠️ 技术栈

- **后端**: Node.js + Express + SQLite
- **前端**: Vue.js 3 + Vite + Element Plus
- **认证**: OAuth 2.0 (GitHub + Google)
- **数据库**: SQLite (轻量级，易部署)

## 🚀 快速开始

### 安装依赖
\`\`\`bash
npm run install:all
\`\`\`

### 开发环境运行
\`\`\`bash
npm run dev
\`\`\`

### 生产环境部署
\`\`\`bash
npm run build
npm start
\`\`\`

## OAuth 登录配置

### 环境变量配置

为了确保 GitHub 和 Google 登录回调能正确重定向到前端应用，需要配置以下环境变量：

#### 服务端环境变量 (.env)

```bash
# 前端应用的完整URL（重要！）
FRONTEND_URL=https://your-frontend-domain.com

# OAuth 应用配置
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 可选：自定义OAuth回调URL基础路径
OAUTH_CALLBACK_BASE_URL=https://your-api-domain.com
```

#### 客户端环境变量 (.env)

```bash
# API服务器的完整URL
VITE_API_BASE_URL=https://your-api-domain.com
```

### 部署注意事项

1. **FRONTEND_URL** 是最关键的配置，它告诉API服务器登录成功后应该重定向到哪个前端应用URL
2. 如果不配置 `FRONTEND_URL`，生产环境默认重定向到 `https://your-frontend-domain.com`（需要手动修改）
3. 开发环境默认重定向到 `http://localhost:5173`

### 登录流程

1. 用户点击登录按钮
2. 自动保存当前页面路径
3. 跳转到 OAuth 提供商授权
4. 授权成功后回调到服务端
5. 服务端重定向到前端应用的原始页面

## 📱 使用说明

1. **管理员功能**（只有您）：
   - 新增/编辑/删除AI项目任务
   - 更新项目进展状态
   - 管理用户评论

2. **用户功能**：
   - 查看所有AI项目进展
   - 点击项目查看详细描述
   - 登录后可以评论

## 🎯 项目愿景

配合"一年100个AI产品挑战"计划，这个看板将记录：
- 每个AI产品的构思到上线全过程
- 开发记录和踩坑经验
- 用户反馈和数据分析
- 复盘思考和策略调整

让梦想在键盘上绽放，用代码书写AI时代的个人传奇！

---

*"在AI让我们真正只做想做的事之前——我们先做一件足够挑战自己的事"* 