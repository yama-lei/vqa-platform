/**
 * 聊天记录本地存储工具
 * 提供聊天记录的存储、检索和清除功能
 */

const STORAGE_KEYS = {
  CHATS: 'vqa_chats',
  CURRENT_CHAT_ID: 'vqa_current_chat_id'
};

/**
 * 获取所有聊天记录
 * @returns {Array} 聊天记录数组
 */
export const getAllChats = () => {
  try {
    const chats = localStorage.getItem(STORAGE_KEYS.CHATS);
    return chats ? JSON.parse(chats) : [];
  } catch (error) {
    console.error('获取聊天记录失败:', error);
    return [];
  }
};

/**
 * 获取当前聊天ID
 * @returns {string|null} 当前聊天ID
 */
export const getCurrentChatId = () => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_CHAT_ID);
};

/**
 * 设置当前聊天ID
 * @param {string} chatId 聊天ID
 */
export const setCurrentChatId = (chatId) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT_ID, chatId);
};

/**
 * 保存聊天记录到本地存储
 * @param {Array} chats 聊天记录数组
 */
const saveChats = (chats) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  } catch (error) {
    console.error('保存聊天记录失败:', error);
  }
};

/**
 * 获取单个聊天记录
 * @param {string} chatId 聊天ID
 * @returns {Object|null} 聊天记录对象
 */
export const getChat = (chatId) => {
  const chats = getAllChats();
  return chats.find(chat => chat.id === chatId) || null;
};

/**
 * 获取当前聊天记录
 * @returns {Object|null} 当前聊天记录对象
 */
export const getCurrentChat = () => {
  const currentChatId = getCurrentChatId();
  if (!currentChatId) return null;
  return getChat(currentChatId);
};

/**
 * 创建新的聊天记录
 * @param {string} modelId 模型ID
 * @returns {string} 新创建的聊天ID
 */
export const createChat = (modelId) => {
  const chats = getAllChats();
  
  // 生成唯一ID
  const chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // 创建新聊天
  const newChat = {
    id: chatId,
    modelId,
    title: '新对话',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: []
  };
  
  // 添加到聊天列表
  chats.unshift(newChat);
  saveChats(chats);
  
  // 设置为当前聊天
  setCurrentChatId(chatId);
  
  return chatId;
};

/**
 * 更新聊天记录
 * @param {string} chatId 聊天ID
 * @param {Object} chatData 聊天数据
 * @returns {boolean} 是否更新成功
 */
export const updateChat = (chatId, chatData) => {
  const chats = getAllChats();
  const index = chats.findIndex(chat => chat.id === chatId);
  
  if (index === -1) return false;
  
  // 更新数据
  chats[index] = {
    ...chats[index],
    ...chatData,
    updatedAt: Date.now()
  };
  
  saveChats(chats);
  return true;
};

/**
 * 向聊天中添加消息
 * @param {string} chatId 聊天ID
 * @param {Object} message 消息对象
 * @returns {boolean} 是否添加成功
 */
export const addMessage = (chatId, message) => {
  const chats = getAllChats();
  const index = chats.findIndex(chat => chat.id === chatId);
  
  if (index === -1) return false;
  
  // 添加消息
  if (!chats[index].messages) {
    chats[index].messages = [];
  }
  
  chats[index].messages.push(message);
  
  // 如果是第一条用户消息，更新标题
  if (message.role === 'user' && chats[index].messages.length <= 2) {
    const title = message.content.text || '图片对话';
    // 截取前20个字符作为标题
    chats[index].title = title.substring(0, 20) + (title.length > 20 ? '...' : '');
  }
  
  // 更新时间
  chats[index].updatedAt = Date.now();
  
  saveChats(chats);
  return true;
};

/**
 * 删除聊天记录
 * @param {string} chatId 聊天ID
 * @returns {boolean} 是否删除成功
 */
export const deleteChat = (chatId) => {
  let chats = getAllChats();
  const originalLength = chats.length;
  
  // 过滤掉要删除的聊天
  chats = chats.filter(chat => chat.id !== chatId);
  
  if (chats.length === originalLength) return false;
  
  saveChats(chats);
  
  // 如果删除的是当前聊天，需要更新当前聊天ID
  if (getCurrentChatId() === chatId) {
    if (chats.length > 0) {
      setCurrentChatId(chats[0].id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT_ID);
    }
  }
  
  return true;
};

/**
 * 清空所有聊天记录
 * @returns {boolean} 是否清空成功
 */
export const clearAllChats = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT_ID);
    return true;
  } catch (error) {
    console.error('清空聊天记录失败:', error);
    return false;
  }
}; 