export default {
  // 导航和布局
  nav: {
    title: '导航菜单',
    home: '首页',
    projects: '项目列表',
    global_history: '全局进展',
    about: '关于挑战',
    admin: '管理后台',
    login: '登录',
    logout: '登出'
  },
  
  // 页面标题
  title: {
    home: 'AI项目看板 - 一年100个AI产品挑战',
    projects: 'AI项目列表',
    project_detail: '项目详情',
    admin: '管理后台',
    login: '登录',
    about: '关于挑战',
    global_history: '全局项目进展',
    not_found: '页面不存在'
  },
  
  // 首页
  home: {
    title: 'AI项目看板',
    subtitle: '一年100个AI产品挑战',
    challenge_title: '一年100个AI产品挑战',
    description: '记录每一个AI产品从构思到上线的完整历程，用代码书写人工智能时代的创新传奇',
    start_journey: '开始挑战之旅',
    view_projects: '查看项目列表',
    learn_more: '了解更多',
    
    // 统计数据
    stats: {
      ai_projects: 'AI项目',
      overall_progress: '整体进度',
      completed: '已完成',
      in_development: '开发中'
    },
    
    // 项目状态概览
    status_overview: {
      title: '项目状态概览',
      brainstorming: '构思中',
      planning: '规划中',
      development: '开发中',
      testing: '测试中',
      deployed: '已部署',
      completed: '已完成',
      on_hold: '暂停中'
    },
    
    // 最新项目
    latest_projects: '最新项目',
    progress: '进度',
    
    // 挑战宣言
    challenge_manifesto: {
      title: '挑战宣言',
      quote: '"在AI让我们真正只做想做的事之前——我们先做一件足够挑战自己的事"',
      description: '2025年，用100个AI产品记录这个时代最激动人心的技术变革。每一个产品都是一次勇敢的尝试，每一行代码都在书写未来。'
    }
  },
  
  // 项目列表页面
  projects: {
    title: 'AI项目看板',
    subtitle: '探索100个AI产品挑战的完整历程',
    search_placeholder: '搜索项目名称、描述或标签...',
    total_projects: '总项目数',
    average_progress: '平均进度',
    filter_by_status: '按状态筛选',
    filter_by_priority: '按优先级筛选',
    all_status: '全部状态',
    all_priority: '全部优先级',
    sort_by: '排序方式',
    sort_by_created: '创建时间',
    sort_by_updated: '更新时间',
    sort_by_progress: '进度',
    sort_by_priority: '优先级'
  },
  
  // 全局进展页面
  global_history: {
    title: '全局项目进展',
    subtitle: '查看所有项目的进展历史和重要里程碑',
    filter_by_type: '类型筛选',
    all_types: '全部类型',
    milestone: '里程碑',
    progress_update: '进度更新',
    status_change: '状态变更',
    manual_record: '手动记录',
    technical_issue: '遇到技术难题',
    project_inception: '项目立项完成',
    technical_research: '技术调研完成',
    records_count: '条记录',
    previous: '之前',
    current: '现在',
    
    // 记录内容
    record_types: {
      milestone: '里程碑',
      progress_update: '进度更新',
      status_change: '状态变更',
      manual_record: '手动记录'
    }
  },
  
  // 关于挑战页面
  about: {
    title: '一年100个AI产品挑战',
    subtitle: '把梦想落在键盘上，用代码书写AI时代的个人传奇',
    
    stats: {
      launched_projects: '已启动项目',
      average_progress: '平均进度',
      completed_projects: '已完成项目'
    },
    
    // 关于这个挑战
    challenge_info: {
      title: '关于这个挑战',
      why_title: '为什么要在2025年做100个AI产品？',
      
      tech_dividend: {
        title: '技术红利时代',
        content: 'LLM的普及正在带来"软件的超级高产时代"。个人开发者甚至非技术人员都能快速产出大量软件，深入各行各业，解决过去工程界久攻不下的问题。'
      },
      
      personal_breakthrough: {
        title: '个人能力突破',
        content: '通过持续的产品开发实践，验证AI工具的真实能力，积累从想法到产品的完整经验，在AI让我们"真正只做想做的事"之前，先做一件足够挑战自己的事。'
      },
      
      transparent_sharing: {
        title: '透明分享',
        content: '记录每一个产品的构思、开发、上线和反馈过程，分享做产品的经验、踩过的坑、复盘思考，为其他AI产品开发者提供参考。'
      }
    },
    
    // 挑战规则
    challenge_rules: {
      title: '挑战规则',
      subtitle: '明确的目标和标准，确保挑战的可执行性',
      
      target_quantity: {
        title: '目标数量',
        content: '2025年发布100个可用的AI产品（平均约3.6天/个）'
      },
      
      criteria: {
        title: '判定标准',
        content: '能被真实用户使用（哪怕是极小众），有清晰功能与价值'
      },
      
      transparency: {
        title: '过程透明',
        content: '每款产品的灵感、开发记录、上线情况、数据反馈都会公开'
      },
      
      toolstack: {
        title: '工具栈',
        content: '主力使用LLM辅助开发（Cursor、Claude等），加速从想法到上线'
      },
      
      iteration: {
        title: '允许迭代',
        content: '每个产品上线后可继续优化，但不影响下一个产品的推进'
      },
      
      review_rhythm: {
        title: '复盘节奏',
        content: '每完成10个产品，做一次阶段复盘，调整方向和策略'
      }
    },
    
    // 技术工具栈
    tech_stack: {
      title: '技术工具栈',
      subtitle: '充分利用AI工具提升开发效率',
      
      ai_tools: {
        title: 'AI开发工具',
        tools: ['Cursor', 'Claude', 'ChatGPT', 'GitHub Copilot', 'v0.dev', 'Bolt.new']
      },
      
      frontend: {
        title: '前端技术',
        tools: ['Vue.js', 'React', 'Next.js', 'Nuxt.js', 'TypeScript', 'Tailwind CSS', 'Element Plus']
      },
      
      backend: {
        title: '后端技术',
        tools: ['Node.js', 'Python', 'FastAPI', 'Express', 'NestJS', 'Supabase', 'Firebase']
      },
      
      deployment: {
        title: '部署平台',
        tools: ['Vercel', 'Netlify', 'Railway', 'Render', 'Cloudflare', 'AWS', 'Zeabur']
      }
    },
    
    // 如何参与
    how_to_participate: {
      title: '如何参与',
      subtitle: '欢迎以各种方式参与这个挑战',
      
      feedback: {
        title: '反馈产品',
        content: '试用我的产品，告诉我你的感受和建议，帮助我改进产品质量。'
      },
      
      exchange: {
        title: '交流想法',
        content: '如果你也在做类似的事，欢迎互相借鉴，分享经验和资源。'
      },
      
      cooperation: {
        title: '资源合作',
        content: '如果你有需求、数据、渠道等资源，欢迎对接探讨合作机会。'
      },
      
      encouragement: {
        title: '纯粹鼓励',
        content: '一句"加油"，也是燃料。你的关注和支持是我前进的动力。'
      }
    },
    
    // 联系方式
    contact: {
      title: '联系我',
      subtitle: '有任何想法、建议或合作意向，欢迎随时联系',
      email: '邮箱',
      github: 'GitHub',
      wechat: '微信',
      phone: '手机',
      click_email: '点击发邮件',
      click_visit: '点击访问',
      click_copy: '点击复制',
      click_call: '点击拨打'
    },
    
    // 结语
    conclusion: {
      quote: '"2025年，我会把这100个小小的软件，作为我和这个时代对话的方式。它们不一定每个都完美，但每一个都是真诚的尝试。"',
      signature: '—— 继续向前的我'
    }
  },
  
  // 管理后台
  admin: {
    title: '管理后台',
    subtitle: 'AI项目看板管理中心',
    new_project: '新建项目',
    stats: {
      total_projects: '总项目数',
      total_users: '注册用户',
      total_comments: '评论总数'
    },
    project_management: '项目管理',
    config_management: '站点配置',
    user_management: '用户管理',
    comment_management: '评论管理'
  },
  
  // 项目相关
  project: {
    title: '标题',
    description: '描述',
    content: '内容',
    status: '状态',
    priority: '优先级',
    created_at: '创建时间',
    updated_at: '更新时间',
    actions: '操作',
    edit: '编辑',
    delete: '删除',
    view: '查看',
    save: '保存',
    cancel: '取消',
    
    status_options: {
      brainstorming: '构思中',
      planning: '规划中',
      not_started: '未开始',
      in_progress: '进行中',
      development: '开发中',
      testing: '测试中',
      deployed: '已部署',
      completed: '已完成',
      on_hold: '暂停中'
    },
    
    priority_options: {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急'
    }
  },
  
  // 表单和按钮
  form: {
    submit: '提交',
    save: '保存',
    cancel: '取消',
    edit: '编辑',
    delete: '删除',
    confirm: '确认',
    search: '搜索',
    reset: '重置',
    upload: '上传',
    download: '下载',
    go_to: '跳转',
    total: '总共'
  },
  
  // 消息
  message: {
    success: '操作成功',
    error: '操作失败',
    confirm_delete: '确定要删除吗？',
    no_data: '暂无数据',
    loading: '加载中...'
  },
  
  // 认证
  auth: {
    welcome_back: '欢迎回来',
    login_description: '选择您喜欢的方式登录，参与AI产品挑战之旅',
    username: '用户名',
    email: '邮箱',
    password: '密码',
    login_button: '登录',
    register_button: '注册',
    github_login: '使用GitHub登录',
    google_login: '使用Google登录',
    forgot_password: '忘记密码？',
    no_account: '还没有账号？',
    has_account: '已有账号？',
    profile: '个人资料'
  },
  
  // 评论系统
  comment: {
    title: '评论',
    add_comment: '添加评论',
    edit_comment: '编辑评论',
    delete_comment: '删除评论',
    reply: '回复',
    write: '编写',
    preview: '预览',
    submit: '提交评论',
    placeholder: '请输入评论内容，支持Markdown格式...',
    no_comments: '暂无评论，来发表第一条评论吧！',
    load_more: '加载更多',
    upload_image: '上传图片',
    upload_video: '上传视频'
  },
  
  // 语言切换
  language: {
    title: '语言',
    chinese: '中文',
    english: 'English'
  }
} 