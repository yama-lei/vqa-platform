/**
 * 模型API接口
 * 实现与大语言模型的通信
 */

// API基础配置
const MODEL_API_ENDPOINT = 'https://api.deepseek.com/v1';
const MODEL_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

/**
 * 发送VQA查询到模型
 * @param {Object} params - 查询参数
 * @param {String} params.modelId - 模型ID
 * @param {String} params.question - 问题文本
 * @param {String} params.image - 图片数据(Base64)
 * @param {Array} params.history - 对话历史
 * @returns {Promise<Object>} - 模型响应
 */
export const sendVQAQuery = async (params) => {
  try {
    console.log('发送VQA查询:', params);
    
    // 如果包含图片但模型不支持多模态，使用模拟响应
    if (params.image && !supportsMultimodal(params.modelId)) {
      console.log(`${params.modelId}当前不支持图像分析，使用模拟响应`);
      return simulateModelResponse(params);
    }
    
    // 根据模型ID选择不同的API调用
    switch(params.modelId) {
      case 'deepseek-v3':
        return callDeepseekAPI(params);
      case 'model1':
        return callModel1API(params);
      case 'model2':
        return callModel2API(params);
      default:
        return simulateModelResponse(params);
    }
  } catch (error) {
    console.error('模型API调用失败:', error);
    return {
      success: false,
      error: error.message || '请求模型失败'
    };
  }
};

/**
 * 检查模型是否支持多模态输入
 * @param {String} modelId - 模型ID
 * @returns {Boolean} - 是否支持多模态
 */
const supportsMultimodal = (modelId) => {
  // 目前只有模拟模型支持多模态
  return modelId === 'model1' || modelId === 'model2';
};

/**
 * 调用DeepSeek API
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} - 模型响应
 */
const callDeepseekAPI = async (params) => {
  const endpoint = `${MODEL_API_ENDPOINT}/chat/completions`;
  
  // 构建消息历史
  const messages = [];
  
  // 添加历史消息
  if (params.history && params.history.length > 0) {
    params.history.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });
  }
  
  // 添加当前消息
  messages.push({
    role: 'user',
    content: params.question
  });
  
  const payload = {
    model: 'deepseek-chat',  // 正确的模型名称是'deepseek-chat'，不是'deepseek-v3'
    messages: messages,
    temperature: 0.7,
    max_tokens: 1000
  };
  
  console.log('API请求:', endpoint, payload);
  
  // 发送API请求
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MODEL_API_KEY}`
    },
    body: JSON.stringify(payload)
  });
  
  console.log('API响应状态:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('API错误详情:', errorData);
    throw new Error(`API错误: ${errorData.error?.message || '未知错误'}`);
  }
  
  const data = await response.json();
  console.log('API响应数据:', data);
  
  return {
    success: true,
    text: data.choices[0].message.content,
    model: data.model
  };
};

/**
 * 调用Model1 API (VQA基础模型)
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} - 模型响应
 */
const callModel1API = async (params) => {
  // 模型1的API调用实现
  // 这里可以根据实际API进行适配
  console.log('调用Model1 API');
  
  // 暂时使用模拟响应，后续可以替换为实际API
  return simulateModelResponse({
    ...params,
    modelType: 'vqa-basic'
  });
};

/**
 * 调用Model2 API (VQA高级模型)
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} - 模型响应
 */
const callModel2API = async (params) => {
  // 模型2的API调用实现
  // 这里可以根据实际API进行适配
  console.log('调用Model2 API');
  
  // 暂时使用模拟响应，后续可以替换为实际API
  return simulateModelResponse({
    ...params,
    modelType: 'vqa-advanced'
  });
};

/**
 * 模拟模型响应（在API不可用或测试时使用）
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} - 模拟的模型响应
 */
const simulateModelResponse = async (params) => {
  console.log('使用模拟响应');
  
  // 随机延迟1-2秒
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // 图片分析的模拟响应
  const imageResponses = [
    "根据图像分析，这是一张包含多个物体的场景。我看到有人、汽车和建筑物。",
    "这张图片展示的是一个户外环境，有树木和蓝天。时间应该是白天。",
    "图中显示的是一只猫，它正在沙发上休息。这是一只橙色的短毛猫。",
    "分析结果表明这是一张食物的图片，看起来像是一盘意大利面。",
    "这是一个室内场景，我能看到一张桌子和几把椅子。这应该是一个会议室或餐厅。"
  ];
  
  // 文本问题的模拟响应
  const textResponses = [
    `我理解您的问题是关于"${params.question}"。作为一个语言模型，我可以告诉您这是一个很好的问题。`,
    `您询问的是"${params.question}"。这个问题涉及到多个领域的知识。`,
    `关于"${params.question}"，我需要指出这是一个复杂的话题，有多种观点和角度可以探讨。`,
    `您问的是"${params.question}"。这个问题很有深度，让我来分析一下。`,
    `"${params.question}"是一个很好的起点，让我们深入探讨这个话题。`
  ];
  
  // 模型类型特定响应
  const modelTypePrefix = params.modelType === 'vqa-advanced' 
    ? '作为高级VQA模型，' 
    : params.modelType === 'vqa-basic' 
      ? '作为基础VQA模型，' 
      : '';
  
  // 处理文本问题和图片问题情况
  if (params.image) {
    // 返回图片分析的模拟响应
    const response = imageResponses[Math.floor(Math.random() * imageResponses.length)];
    return {
      success: true,
      text: modelTypePrefix + response,
      model: params.modelId || '模拟视觉模型'
    };
  } else {
    // 返回文本问题的模拟响应
    const response = textResponses[Math.floor(Math.random() * textResponses.length)];
    return {
      success: true,
      text: modelTypePrefix + response,
      model: params.modelId || '模拟文本模型'
    };
  }
}; 