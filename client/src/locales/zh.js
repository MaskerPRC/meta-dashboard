export default {
  // 导航和布局
  nav: {
    title: '导航菜单',
    home: '首页',
    projects: '项目列表',
    ideas: '想法征集',
    global_history: '全局进展',
    resume: '我的简历',
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
    resume: '我的简历',
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
      in_development: '开发中',
      days_remaining: '天倒计时'
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
    title: '项目列表',
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
      progress_log: '进展日志',
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
      issue: '提Issues',
      click_email: '点击发邮件',
      click_visit: '点击访问',
      click_copy: '点击复制',
      click_call: '点击拨打',
      click_issue: '点击提交'
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
      total_comments: '评论总数',
      average_progress: '平均进度'
    },
    project_management: '项目管理',
    config_management: '站点配置',
    user_management: '用户管理',
    comment_management: '评论管理',
    resume_management: '简历管理',

    // AI项目生成器
    ai_generator: {
      title: 'AI智能生成项目',
      step_1: {
        title: '输入描述',
        description: '描述您的项目想法',
        input_label: '项目描述（支持中英文，最多5000字符）',
        placeholder: '例如：我想做一个在线图书管理系统，用户可以搜索图书、借阅图书、查看借阅历史。管理员可以添加新书、管理用户借阅记录。使用Vue.js前端，Node.js后端，MySQL数据库。',
        language_preference: '语言偏好',
        examples_title: '💡 示例描述：',
        start_generate: '开始生成'
      },
      step_2: {
        title: 'AI生成',
        description: 'AI解析并生成项目结构',
        loading_text: 'AI正在分析您的描述...'
      },
      step_3: {
        title: '预览确认',
        description: '预览并确认生成的项目',
        preview_title: 'AI生成的项目预览：',
        ai_generated: 'AI生成',
        project_description: '项目描述：',
        tech_stack: '技术栈：',
        tags: '标签：',
        project_content: '项目内容：',
        regenerate: '重新生成',
        create_project: '创建项目'
      },
      cancel: '取消',
      messages: {
        empty_description: '请输入项目描述',
        generate_success: 'AI项目生成成功！',
        generate_failed: 'AI生成失败，请稍后重试',
        create_success: '项目创建成功！',
        create_failed: '保存项目失败'
      }
    },

    // 项目管理
    projects: {
      search_placeholder: '搜索项目...',
      export_data: '导出数据',
      batch_delete: '批量删除',
      table_headers: {
        id: 'ID',
        project_name: '项目名称',
        status: '状态',
        priority: '优先级',
        progress: '进度',
        actions: '操作'
      },
      actions: {
        edit: '编辑',
        view: '查看',
        delete: '删除'
      },
      empty_text: '暂无项目数据',
      messages: {
        delete_confirm: '确定要删除项目 "{title}" 吗？此操作不可恢复。',
        delete_title: '删除项目',
        delete_success: '项目删除成功',
        delete_failed: '删除项目失败',
        batch_delete_warning: '请选择要删除的项目',
        batch_delete_confirm: '确定要删除选中的 {count} 个项目吗？此操作不可恢复。',
        batch_delete_title: '批量删除项目',
        batch_delete_success: '批量删除成功',
        batch_delete_failed: '批量删除失败',
        export_success: '数据导出成功',
        export_failed: '导出数据失败',
        fetch_failed: '获取项目列表失败'
      }
    },

    // 用户管理
    users: {
      search_placeholder: '搜索用户...',
      empty_text: '暂无用户数据',
      table_headers: {
        id: 'ID',
        avatar: '头像',
        username: '用户名',
        display_name: '显示名称',
        email: '邮箱',
        phone: '手机号',
        auth_method: '认证方式',
        is_admin: '管理员',
        last_login: '最后登录',
        created_at: '注册时间',
        actions: '操作'
      },
      auth_methods: {
        local: '本地账户',
        google: 'Google',
        github: 'GitHub',
        wechat: '微信'
      },
      actions: {
        reset_password: '重置密码',
        delete: '删除'
      },
      messages: {
        fetch_failed: '获取用户列表失败',
        admin_grant_success: '授予管理员权限成功',
        admin_revoke_success: '取消管理员权限成功',
        admin_update_failed: '更新用户权限失败',
        reset_password_title: '重置用户密码',
        reset_password_prompt: '请输入新密码（至少6位）：',
        reset_password_confirm: '确定',
        reset_password_cancel: '取消',
        reset_password_validation: '密码长度至少6位',
        reset_password_success: '密码重置成功',
        reset_password_failed: '重置密码失败',
        delete_confirm: '确定要删除用户 "{username}" 吗？此操作不可恢复。',
        delete_title: '删除用户',
        delete_success: '用户删除成功',
        delete_failed: '删除用户失败'
      }
    },

    // 评论管理
    comments: {
      empty_text: '暂无评论数据',
      table_headers: {
        id: 'ID',
        project: '项目',
        user: '用户',
        content: '评论内容',
        validity_status: '有效性状态',
        created_at: '发布时间',
        actions: '操作'
      },
      attachment_labels: {
        images: '图片',
        videos: '视频'
      },
      actions: {
        revalidate: '重新检测',
        delete: '删除'
      },
      messages: {
        fetch_failed: '获取评论列表失败',
        delete_confirm: '确定要删除这条评论吗？此操作不可恢复。',
        delete_title: '删除评论',
        delete_success: '评论删除成功',
        delete_failed: '删除评论失败'
      }
    },

    // 站点配置管理
    site_config: {
      wechat_group: {
        title: '微信群二维码设置',
        qr_code: '群二维码',
        group_title: '群标题',
        group_description: '群描述',
        upload_qr: '上传微信群二维码',
        change_qr: '更换二维码',
        title_placeholder: '请输入微信群标题',
        description_placeholder: '请输入微信群描述',
        save_all: '保存所有配置',
        reset: '重置'
      },
      messages: {
        image_only: '只能上传图片文件!',
        file_too_large: '图片大小不能超过 5MB!',
        upload_success: '二维码上传成功',
        upload_failed: '上传二维码失败',
        update_success: '配置更新成功',
        update_failed: '更新配置失败',
        save_success: '所有配置保存成功',
        save_failed: '保存配置失败',
        fetch_failed: '获取站点配置失败'
      }
    }
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
     back_to_list: '返回项目列表',
     edit_project: '编辑项目',
     delete_project: '删除项目',
     progress_history: '进展历史',
     view_development_timeline: '查看项目发展轨迹',
         project_details: '项目详情',
    not_found: '项目不存在',
    check_link: '请检查链接是否正确',
    select_status: '选择项目状态',
    select_priority: '选择优先级',
    status_filter: '状态筛选',

    // 编辑页面表单
    form_labels: {
      project_name: '项目名称',
      project_description: '项目描述',
      progress_percentage: '进度百分比',
      github_repo: 'GitHub仓库',
      demo_link: '演示链接',
      start_time: '开始时间',
      expected_completion: '预期完成时间',
      tech_stack: '技术栈',
      project_tags: '项目标签',
      project_content: '项目详细内容',
      progress_log: '进展日志',
      progress_log_input: '进展日志输入'
    },

    // 占位符文本
    placeholders: {
      enter_project_name: '请输入项目名称',
      enter_project_description: '请输入项目简短描述',
      github_repo_url: 'https://github.com/username/repo',
      demo_url: 'https://demo.example.com',
      select_start_time: '选择开始时间',
      select_completion_time: '选择预期完成时间',
      add_tech_stack: '添加技术栈',
      add_tag: '添加标签',
      enter_project_content: '请输入项目详细内容，支持Markdown格式...\n提示：可以直接粘贴图片或视频文件',
      progress_log_placeholder: '描述本次修改的进展情况，如新增功能、解决的问题、下一步计划等...'
    },

    // 编辑器相关
    editor: {
      edit_mode: '编辑',
      preview_mode: '预览',
      split_mode: '分屏',
      insert_template: '插入模板',
      attachments_added: '已添加的图片和视频',
      empty_preview: '暂无内容'
    },

    // 表单验证消息
    validation: {
      project_name_required: '请输入项目名称',
      project_name_length: '项目名称长度应在2-100个字符',
      project_description_required: '请输入项目描述',
      project_description_length: '项目描述长度应在10-500个字符',
      status_required: '请选择项目状态',
      priority_required: '请选择优先级'
    },

    // 操作按钮
    actions_buttons: {
      add_tech_stack: '+ 添加技术栈',
      add_tag: '+ 添加标签',
      cancel: '取消',
      save: '保存',
      create: '创建'
    },

    // 成功/失败消息
    messages: {
      project_update_success: '项目更新成功',
      project_create_success: '项目创建成功',
      save_project_failed: '保存项目失败',
      project_saved: '项目保存成功'
    },

    // 进展日志
    progress_log: {
      title: '进展日志输入',
      tip: '填写进展日志有助于团队了解项目推进情况，此内容将在项目进展历史中显示'
    },

    // 项目模板
    template: {
      default_content: `# 项目简介

简要描述这个AI项目的功能和目标。

## 项目背景

- 为什么要做这个项目？
- 解决了什么问题？

## 主要功能

- [ ] 功能1
- [ ] 功能2
- [ ] 功能3

## 技术亮点

- 使用了哪些AI技术？
- 有哪些创新点？

## 开发过程

### 第一阶段：构思和设计
- 需求分析
- 技术选型
- 原型设计

### 第二阶段：开发实现
- 核心功能开发
- AI模型集成
- 测试优化

### 第三阶段：部署上线
- 部署配置
- 性能调优
- 用户反馈

## 遇到的挑战

- 技术挑战1及解决方案
- 技术挑战2及解决方案

## 收获与反思

- 学到了什么？
- 下次可以怎么改进？

## 相关链接

- [源码仓库]({{github_repo}})
- [在线演示]({{demo_url}})`
    },

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
    },

    // 附件功能
    attachments: {
      title: '项目图片和视频',
      images: '图片',
      videos: '视频',
      upload: '上传图片/视频',
      uploading: '上传中...',
      upload_success: '上传成功',
      upload_failed: '上传失败',
      paste_hint: '提示：可以直接粘贴图片或视频文件',
      remove: '删除',
      preview: '预览',
      file_too_large: '文件大小超出限制',
      invalid_format: '不支持的文件格式',
      max_image_size: '图片大小不能超过 5MB',
      max_video_size: '视频大小不能超过 50MB',
      supported_image_formats: '支持 JPG、PNG、GIF、WebP 格式',
      supported_video_formats: '支持 MP4、WebM 格式'
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
    profile: '个人资料',

    // 个人资料相关
    profile_title: '个人资料',
    profile_subtitle: '管理您的账户信息',
    display_name: '显示名称',
    display_name_placeholder: '请输入显示名称',
    email_placeholder: '请输入邮箱地址',
    update_profile: '更新资料',
    update_password: '修改密码',
    current_password: '当前密码',
    new_password: '新密码',
    current_password_placeholder: '请输入当前密码',
    new_password_placeholder: '请输入新密码（至少6位）',
    profile_updated_success: '个人资料更新成功',
    password_updated_success: '密码修改成功'
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
    upload_video: '上传视频',
    paste_support: '支持直接粘贴图片和视频文件',
    paste_hint: '支持Markdown语法，可直接粘贴图片文件（Ctrl+V）...'
  },

  // 语言切换
  language: {
    title: '语言',
    chinese: '中文',
    english: 'English'
  },

  // 简历管理
  resume: {
    title: '我的简历',
    subtitle: '编辑和管理您的个人简历',
    edit: '编辑简历',
    version_history: '版本历史',
    save: '保存简历',
    saving: '保存中...',

    // 表单
    form: {
      title_label: '简历标题',
      title_placeholder: '输入简历标题...',
      content_label: '简历内容',
      content_placeholder: '在这里编写您的简历内容，支持Markdown格式...',
      settings_label: '简历设置',
      status_placeholder: '选择状态',
      public_label: '公开简历（其他用户可以查看）'
    },

    // 状态
    status: {
      draft: '草稿',
      published: '已发布',
      archived: '已归档'
    },

    // 操作
    actions: {
      view: '查看',
      edit: '编辑',
      delete: '删除',
      archive: '归档',
      export_pdf: '导出PDF',
      full_preview: '全屏预览',
      view_version: '查看版本',
      refresh: '刷新',
      export_data: '导出数据'
    },

    // 版本
    version: {
      current: '当前版本',
      history: '版本历史',
      view_content: '查看内容',
      no_history: '暂无版本历史',
      created_by: '创建者'
    },

    // 消息
    messages: {
      save_success: '简历保存成功',
      save_failed: '保存简历失败',
      fetch_failed: '获取简历失败',
      title_required: '请输入简历标题',
      login_required: '请先登录',
      fetch_versions_failed: '获取版本历史失败',
      archive_confirm: '确定要归档这份简历吗？',
      pdf_export_developing: 'PDF导出功能开发中...'
    },

    // 预览
    preview: {
      title: '简历预览',
      last_updated: '最后更新',
      version_label: '版本',
      export_pdf: '导出PDF',
      close: '关闭'
    },

    // 管理端
    admin: {
      title: '简历管理',
      search_placeholder: '搜索简历标题或用户名...',
      filter_status: '筛选状态',
      table: {
        id: 'ID',
        title: '简历标题',
        user: '用户信息',
        status: '状态',
        version: '版本',
        public: '公开',
        created_at: '创建时间',
        updated_at: '更新时间',
        actions: '操作'
      },
      empty_text: '暂无简历数据',
      version_need_login: '版本历史功能需要用户登录查看，请联系用户获取详情',
      archive_feature_developing: '管理员归档功能待开发'
    }
  },

  // Markdown渲染器
  markdown: {
    media: {
      video_not_supported: '您的浏览器不支持视频播放。',
      invalid_link: '无效链接',
      image_loading_error: '图片加载失败',
      video_loading_error: '视频加载失败'
    }
  },

  // 想法征集
  ideas: {
    title: '想法征集',
    subtitle: '分享你的创意想法，参与投票，一起推动AI项目发展',
    submit_idea: '提交想法',
    login_to_submit: '登录提交想法',
    search_placeholder: '搜索想法标题或描述...',
    filter_by_status: '状态筛选',
    sort_by: '排序方式',
    sort_by_votes: '投票数',
    sort_by_date: '最新创建',
    sort_by_title: '标题',
    ascending: '升序',
    descending: '降序',
    reset_filters: '重置',

    // 统计信息
    stats: {
      total_ideas: '总想法数',
      pending_ideas: '待审核',
      adopted_ideas: '已采纳',
      my_votes_today: '我今日投票'
    },

    // 想法状态
    status: {
      pending: '待审核',
      adopted: '已采纳',
      rejected: '已拒绝'
    },

    // 想法卡片
    card: {
      vote_for_idea: '为想法投票',
      votes_count: '票',
      voters_count: '人投票',
      view_project: '查看项目',
      vote_1: '投1票',
      vote_2: '投2票',
      already_voted: '您已为此想法投票',
      vote_limit_reached: '今日投票已达上限',
      remaining_votes: '今日剩余投票：{count} 票'
    },

    // 提交想法表单
    submit: {
      dialog_title: '提交想法',
      title_label: '想法标题',
      title_placeholder: '简明扼要地描述你的想法（最多200字符）',
      description_label: '想法描述',
      description_placeholder: '详细描述你的想法（最多1000字符）',
      content_label: '详细内容',
      content_placeholder: '可选：提供更详细的实现思路、技术方案等（支持Markdown格式，最多10000字符）',
      submit_button: '提交想法',
      cancel_button: '取消',
      success_message: '想法提交成功，等待管理员审核'
    },

    // 想法详情
    detail: {
      back_to_list: '返回想法列表',
      idea_description: '想法描述',
      idea_content: '详细内容',
      author_info: '提交者信息',
      submitted_at: '提交',
      adoption_info: '采纳信息',
      adopter: '采纳人',
      adopted_at: '采纳时间',
      related_project: '关联项目',
      converted_to_project: '已转化为项目',
      view_project_detail: '查看项目详情',
      idea_not_found: '想法不存在',
      idea_not_found_desc: '该想法可能已被删除或您没有访问权限'
    },

    // 投票相关
    voting: {
      vote_success: '投票成功，您为此想法投了{votes}票',
      vote_failed: '投票失败',
      already_voted: '您已经为此想法投过票了',
      daily_limit_reached: '您今日投票数已达上限，剩余{remaining}票',
      login_required: '请先登录',
      idea_not_votable: '想法不存在或已不可投票'
    },

    // 空状态
    empty: {
      no_ideas: '暂无想法数据',
      submit_first: '提交第一个想法'
    },

    // 管理功能（用于管理端）
    admin: {
      ideas_management: '想法管理',
      adopt_idea: '采纳想法',
      reject_idea: '拒绝想法',
      transform_to_project: 'AI转化为项目',
      adoption_success: '想法采纳成功，可以开始AI转化为项目',
      rejection_success: '想法已拒绝',
      transform_success: 'AI转化成功！项目ID: {projectId}',
      transform_confirm: '确定要将想法"{title}"转化为AI项目吗？这个过程可能需要一些时间。',
      adopt_confirm: '确定要采纳想法"{title}"吗？',
      reject_confirm: '确定要拒绝想法"{title}"吗？',
      reject_reason: '拒绝原因',
      reject_reason_placeholder: '请输入拒绝原因（可选）',
      processing: '正在进行AI转化，请稍等...',
      already_transformed: '该想法已转化为项目'
    }
  }
}
