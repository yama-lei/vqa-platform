/**
 * 聊天API客户端
 * 用于与后端API通信处理对话请求
 */

// 固定API密钥
const API_KEY = 'lIlI****';

/**
 * 获取API密钥
 * @returns {string} API密钥
 */
export function getApiKey() {
  return API_KEY;
}

/**
 * 检查是否已设置API密钥
 * @returns {boolean} 是否已设置API密钥
 */
export function hasApiKey() {
  return true; // 始终返回true，因为密钥已硬编码
}

/**
 * 可用模型配置
 * 方便未来添加更多模型时进行扩展
 */
export const AVAILABLE_MODELS = {
  'deepseek-chat': {
    name: 'DeepSeek Chat',
    description: '支持文本和图像分析的通用大语言模型',
    supportsMultimodal: true
  },
  'deepseek-reasoner': {
    name: 'DeepSeek Reasoner',
    description: '具有更强推理能力的大语言模型',
    supportsMultimodal: true
  },
  'model-1': {
    name: '模型1',
    description: '基础视觉问答模型',
    supportsMultimodal: true
  },
  'model-2': {
    name: '模型2',
    description: '增强版视觉问答模型',
    supportsMultimodal: true
  }
  // 新模型添加在这里
  // 'new-model': {
  //   name: '新模型',
  //   description: '新模型的描述',
  //   supportsMultimodal: true/false
  // }
};

/**
 * 发送对话请求到后端
 * @param {Object} params - 对话参数
 * @param {string} params.model - 模型名称，默认为'deepseek-chat'
 * @param {string} params.message - 当前用户消息
 * @param {string} [params.image] - 图片内容（base64或URL）
 * @param {Array} params.history - 历史对话记录数组
 * @returns {Promise<Object>} - 包含模型回复的响应对象
 */
export async function sendChatRequest(params) {
  try {
    console.log('发送对话请求到后端:', params);
    
    // 参数准备
    const requestBody = {
      message: params.message,
      image: params.image || null,
      history: params.history || []
    };

    // 仅当选择了非默认模型时，才设置model参数
    if (params.model && params.model !== 'deepseek-chat') {
      requestBody.model = params.model;
    }

    console.log('请求体:', requestBody);

    const response = await fetch('https://api.yama-lei.top/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY  // 使用硬编码的API密钥
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      // 处理常见错误
      if (response.status === 401 || response.status === 403) {
        throw new Error('API密钥无效或未授权');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `服务器响应错误: ${response.status}`);
    }

    const data = await response.json();
    console.log('后端响应数据:', data);

    return {
      text: data.content,
      image: null // 后端目前不返回图片
    };
  } catch (error) {
    console.error('对话API请求失败:', error);
    throw error;
  }
}

/**
 * 获取所有可用模型的列表
 * @returns {Array} - 模型ID列表
 */
export function getAvailableModels() {
  return Object.keys(AVAILABLE_MODELS);
}

/**
 * 获取模型信息
 * @param {String} modelId - 模型ID
 * @returns {Object|null} - 模型信息对象
 */
export function getModelInfo(modelId) {
  return AVAILABLE_MODELS[modelId] || null;
}

/**
 * 检查模型是否支持多模态输入
 * @param {String} modelId - 模型ID
 * @returns {Boolean} - 是否支持多模态输入
 */
export function supportsMultimodalInput(modelId) {
  const modelInfo = AVAILABLE_MODELS[modelId];
  return modelInfo ? modelInfo.supportsMultimodal : false;
} 