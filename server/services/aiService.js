const { openai, defaultConfig, checkOpenAIConfig, createProjectPrompt } = require('../config/openai');

// AI服务类
class AIService {
  constructor() {
    this.isOpenAIAvailable = checkOpenAIConfig();
  }

  /**
   * 使用OpenAI生成项目数据
   * @param {string} userInput - 用户输入的项目描述
   * @param {string} language - 语言偏好 (zh/en)
   * @returns {Promise<Object>} 生成的项目数据
   */
  async generateProjectWithOpenAI(userInput, language = 'zh') {
    try {
      const prompt = createProjectPrompt(userInput, language);
      
      console.log('🤖 调用OpenAI API生成项目...');
      
      const completion = await openai.chat.completions.create({
        model: defaultConfig.model,
        messages: [
          {
            role: "system",
            content: "你是一个专业的项目管理助手，擅长解析项目需求并生成标准化的项目信息。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: defaultConfig.temperature,
        max_tokens: defaultConfig.maxTokens,
        timeout: defaultConfig.timeout
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('OpenAI返回空响应');
      }

      // 解析JSON响应
      const projectData = this.parseAIResponse(response);
      
      console.log('✅ OpenAI项目生成成功');
      return projectData;

    } catch (error) {
      console.error('❌ OpenAI API调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 解析AI响应的JSON数据
   * @param {string} response - AI的文本响应
   * @returns {Object} 解析后的项目数据
   */
  parseAIResponse(response) {
    try {
      // 尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('响应中未找到有效的JSON格式');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // 验证必要字段
      const requiredFields = ['title', 'description', 'content', 'status', 'priority', 'tech_stack', 'tags'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`缺少必要字段: ${field}`);
        }
      }

      // 确保数组字段格式正确
      if (!Array.isArray(parsed.tech_stack)) {
        parsed.tech_stack = [];
      }
      if (!Array.isArray(parsed.tags)) {
        parsed.tags = [];
      }

      // 验证枚举值
      const validStatuses = ['idea', 'planning', 'development', 'testing', 'deployed', 'completed', 'paused'];
      const validPriorities = ['low', 'medium', 'high', 'critical'];

      if (!validStatuses.includes(parsed.status)) {
        parsed.status = 'idea';
      }
      if (!validPriorities.includes(parsed.priority)) {
        parsed.priority = 'medium';
      }

      return parsed;

    } catch (error) {
      console.error('❌ 解析AI响应失败:', error.message);
      console.log('原始响应:', response);
      throw new Error('AI响应格式无效，请重试');
    }
  }

  /**
   * 生成项目数据（带回退机制）
   * @param {string} userInput - 用户输入
   * @param {string} language - 语言偏好
   * @returns {Promise<Object>} 项目数据
   */
  async generateProject(userInput, language = 'zh') {
    // 首先尝试使用OpenAI
    if (this.isOpenAIAvailable) {
      try {
        const aiResult = await this.generateProjectWithOpenAI(userInput, language);
        return {
          ...aiResult,
          ai_generated: true,
          ai_source: 'openai'
        };
      } catch (error) {
        console.warn('⚠️  OpenAI生成失败，回退到模拟AI:', error.message);
        // 继续执行回退逻辑
      }
    }

    // 回退到模拟AI
    console.log('🔄 使用模拟AI生成项目');
    const mockResult = await this.generateProjectWithMock(userInput, language);
    return {
      ...mockResult,
      ai_generated: true,
      ai_source: 'mock'
    };
  }

  /**
   * 模拟AI生成（原有逻辑）
   * @param {string} text - 用户输入
   * @param {string} language - 语言偏好
   * @returns {Promise<Object>} 模拟生成的项目数据
   */
  async generateProjectWithMock(text, language) {
    // 简单的关键词提取和项目结构生成
    const keywords = this.extractKeywords(text);
    const projectType = this.detectProjectType(text);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          title: this.generateTitle(text, keywords),
          description: this.generateDescription(text, keywords),
          content: this.generateContent(text, projectType),
          status: 'idea',
          priority: this.detectPriority(text),
          tech_stack: this.detectTechStack(text),
          tags: ['AI生成', ...keywords.slice(0, 3)],
          estimated_duration: this.estimateDuration(text)
        };
        resolve(result);
      }, 1000); // 模拟AI处理时间
    });
  }

  // 原有的模拟AI方法
  extractKeywords(text) {
    const commonWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
    const words = text.match(/[\u4e00-\u9fa5a-zA-Z]+/g) || [];
    return words
      .filter(word => word.length > 1 && !commonWords.includes(word))
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 10);
  }

  detectProjectType(text) {
    const webKeywords = ['网站', '网页', '前端', '后端', 'web', 'html', 'css', 'javascript'];
    const appKeywords = ['应用', 'app', '移动', '手机', 'android', 'ios'];
    const aiKeywords = ['AI', '人工智能', '机器学习', '深度学习', '算法'];
    const gameKeywords = ['游戏', '娱乐', 'game'];
    
    const lowerText = text.toLowerCase();
    
    if (webKeywords.some(keyword => lowerText.includes(keyword))) return 'web';
    if (appKeywords.some(keyword => lowerText.includes(keyword))) return 'mobile';
    if (aiKeywords.some(keyword => lowerText.includes(keyword))) return 'ai';
    if (gameKeywords.some(keyword => lowerText.includes(keyword))) return 'game';
    
    return 'general';
  }

  generateTitle(text, keywords) {
    const sentences = text.split(/[。！？.!?]/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length < 30) {
      return firstSentence;
    }
    
    if (keywords.length > 0) {
      return `${keywords[0]}项目`;
    }
    
    return '智能生成项目';
  }

  generateDescription(text, keywords) {
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    
    if (sentences.length > 1) {
      return sentences.slice(0, 2).join('。') + '。';
    }
    
    return text.slice(0, 100) + (text.length > 100 ? '...' : '');
  }

  generateContent(text, projectType) {
    const typeTemplates = {
      web: '这是一个Web项目，主要包含前端和后端开发。\n\n',
      mobile: '这是一个移动应用项目，支持多平台开发。\n\n',
      ai: '这是一个AI项目，涉及人工智能和机器学习技术。\n\n',
      game: '这是一个游戏项目，包含游戏设计和开发。\n\n',
      general: '这是一个综合性项目。\n\n'
    };
    
    return (typeTemplates[projectType] || typeTemplates.general) + 
           '原始需求描述：\n' + text;
  }

  detectPriority(text) {
    const highPriorityWords = ['紧急', '重要', '立即', '马上', '优先'];
    const lowPriorityWords = ['以后', '有空', '不急'];
    
    if (highPriorityWords.some(word => text.includes(word))) return 'high';
    if (lowPriorityWords.some(word => text.includes(word))) return 'low';
    
    return 'medium';
  }

  detectTechStack(text) {
    const techMap = {
      'javascript': 'JavaScript',
      'js': 'JavaScript', 
      'react': 'React',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'node': 'Node.js',
      'nodejs': 'Node.js',
      'python': 'Python',
      'java': 'Java',
      'php': 'PHP',
      'mysql': 'MySQL',
      'mongodb': 'MongoDB',
      'redis': 'Redis',
      'docker': 'Docker'
    };
    
    const lowerText = text.toLowerCase();
    const detectedTech = [];
    
    Object.keys(techMap).forEach(key => {
      if (lowerText.includes(key)) {
        detectedTech.push(techMap[key]);
      }
    });
    
    return [...new Set(detectedTech)]; // 去重
  }

  estimateDuration(text) {
    // 简单的项目周期估算
    if (text.length > 1000) return '3-6个月';
    if (text.length > 500) return '1-3个月';
    if (text.length > 200) return '2-4周';
    return '1-2周';
  }
}

module.exports = new AIService(); 