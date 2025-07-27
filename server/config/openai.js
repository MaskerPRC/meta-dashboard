const { OpenAI } = require('openai');

// OpenAI 客户端配置
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1', // 支持自定义API endpoint
});

// 默认配置
const defaultConfig = {
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
  timeout: parseInt(process.env.OPENAI_TIMEOUT) || 30000, // 30秒超时
};

// 检查OpenAI配置是否完整
function checkOpenAIConfig() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY 未配置，将使用模拟AI生成');
    return false;
  }

  console.log('✅ OpenAI 配置已加载');
  return true;
}

// 创建项目生成的prompt模板
function createProjectPrompt(userInput, language = 'zh') {
  const prompts = {
    i18n: `你是一个专业的项目管理助手。用户会用自然语言描述一个项目想法，请你解析并生成标准化的项目信息。

要求：
1. 必须返回有效的JSON格式
2. 所有字段都必须填写，不能为空
3. 技术栈和标签应该是数组格式
4. 优先级只能是：low, medium, high, critical
5. 状态只能是：idea, planning, development, testing, deployed, completed, paused
6. 输出文本语言使用：${language}

用户描述：${userInput}

请按以下JSON格式返回（只返回JSON，不要其他内容）：

{
  "title": "项目标题（不超过50字符）",
  "description": "项目简要描述（不超过200字符）",
  "content": "详细的项目内容和需求分析（500-1000字符）（格式为markdown）",
  "status": "idea",
  "priority": "medium",
  "tech_stack": ["技术1", "技术2", "技术3"],
  "tags": ["标签1", "标签2", "标签3"],
  "estimated_duration": "预估开发周期（如：2周，1个月）"
}`
  };

  return prompts.i18n;
}

module.exports = {
  openai,
  defaultConfig,
  checkOpenAIConfig,
  createProjectPrompt
};
