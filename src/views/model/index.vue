<template>
  <div class="model-chat-container">
    <!-- 头部区域 -->
    <div class="header-area">
      <div class="header-content">
        <h1 class="title">模型对话</h1>
        <p class="description">与多种AI模型进行对话，探索不同模型的能力</p>
      </div>
    </div>

    <div class="chat-layout">
      <!-- 侧边栏 - 历史记录 -->
      <div class="sidebar">
        <ChatHistory 
          :model-id="selectedModel" 
          @select-chat="handleSelectChat" 
          @create-chat="createNewChat" 
        />
      </div>

      <!-- 主对话区域 -->
      <div class="main-content">
        <!-- 模型选择区 -->
        <div class="model-selector">
          <el-radio-group v-model="selectedModel" @change="handleModelChange" size="large">
            <el-radio-button 
              v-for="modelId in getAvailableModelIds()" 
              :key="modelId" 
              :label="modelId"
            >
              {{ getModelInfoById(modelId)?.name || modelId }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 聊天容器 -->
        <div class="chat-container">
          <!-- 空状态提示 -->
          <div v-if="!messages.length" class="empty-chat">
            <el-icon><ChatRound /></el-icon>
            <h3>{{ getModelWelcomeTitle() }}</h3>
            <p>{{ getModelWelcomeMessage() }}</p>
            <el-button type="primary" @click="focusInput">开始对话</el-button>
          </div>

          <!-- 消息列表 -->
          <div v-else ref="messagesRef" class="messages-list">
            <div v-for="(msg, index) in messages" :key="index" :class="['message-item', msg.role]">
              <div class="message-avatar">
                <el-avatar :icon="msg.role === 'user' ? UserFilled : Assistant" />
              </div>
              <div class="message-content">
                <div class="message-role">{{ msg.role === 'user' ? '用户' : getModelDisplayName() }}</div>
                <div class="message-text" v-if="msg.content.text">{{ msg.content.text }}</div>
                <div class="message-image" v-if="msg.content.image">
                  <el-image 
                    :src="msg.content.image" 
                    fit="contain"
                    :preview-src-list="[msg.content.image]"
                  />
                </div>
              </div>
            </div>
            <div v-if="loading" class="message-item assistant">
              <div class="message-avatar">
                <el-avatar :icon="Assistant" />
              </div>
              <div class="message-content">
                <div class="message-role">{{ getModelDisplayName() }}</div>
                <div class="message-loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-area">
            <div class="image-preview" v-if="imageData">
              <el-image :src="imageData" fit="cover" />
              <el-button 
                type="danger" 
                circle 
                size="small" 
                class="remove-btn"
                @click="removeImage"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>

            <div class="input-container">
              <el-input
                ref="inputRef"
                v-model="inputMessage"
                placeholder="输入您的问题..."
                :disabled="loading"
                @keyup.enter.native="sendMessage"
              />
              
              <div class="action-buttons">
                <el-tooltip content="上传图片" placement="top" :disabled="!supportsMultimodal()">
                  <div>
                    <el-upload
                      ref="uploadRef"
                      action=""
                      :auto-upload="false"
                      :show-file-list="false"
                      :on-change="handleImageChange"
                      accept="image/*"
                    >
                      <el-button
                        :disabled="loading || !supportsMultimodal()"
                        circle
                        :class="{'disabled-upload': !supportsMultimodal()}"
                      >
                        <el-icon><PictureFilled /></el-icon>
                      </el-button>
                    </el-upload>
                  </div>
                </el-tooltip>
                
                <el-button
                  type="primary"
                  :disabled="!canSendMessage || loading"
                  @click="sendMessage"
                >
                  <el-icon><Position /></el-icon>
                  发送
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  ChatRound, 
  UserFilled, 
  Position, 
  PictureFilled, 
  Close
} from '@element-plus/icons-vue';
import { 
  sendChatRequest, 
  supportsMultimodalInput, 
  AVAILABLE_MODELS,
  getModelInfo,
  getAvailableModels
} from '../../api/chat';
import { 
  getAllChats,
  getCurrentChatId,
  getChat,
  createChat,
  updateChat,
  addMessage 
} from '../../utils/chatStorage';
import ChatHistory from './components/ChatHistory.vue';

// 模型相关
const Assistant = ref('ChatLineRound');
const selectedModel = ref('deepseek-chat');
const messages = ref([]);
const currentChatId = ref('');

// 输入相关
const inputRef = ref(null);
const inputMessage = ref('');
const imageData = ref('');
const messagesRef = ref(null);
const loading = ref(false);
const uploadRef = ref(null);

// 计算属性：是否可以发送消息
const canSendMessage = computed(() => {
  return !!inputMessage.value.trim() || !!imageData.value;
});

// 检查模型是否支持多模态输入
const supportsMultimodal = () => {
  return supportsMultimodalInput(selectedModel.value);
};

// 获取模型显示名称
const getModelDisplayName = () => {
  const modelInfo = getModelInfo(selectedModel.value);
  return modelInfo ? modelInfo.name : '助手';
};

// 获取模型欢迎标题
const getModelWelcomeTitle = () => {
  const modelInfo = getModelInfo(selectedModel.value);
  return modelInfo ? `欢迎使用 ${modelInfo.name}` : '欢迎开始新对话';
};

// 获取模型欢迎消息
const getModelWelcomeMessage = () => {
  const modelInfo = getModelInfo(selectedModel.value);
  if (!modelInfo) return '请输入您的问题，AI助手将为您提供回答。';
  
  // 根据模型提供合适的欢迎消息
  switch (selectedModel.value) {
    case 'deepseek-chat':
      return 'DeepSeek Chat 是一个功能强大的大语言模型，支持文本和图像分析，可以回答问题、描述图像并进行聊天对话。';
    case 'deepseek-reasoner':
      return 'DeepSeek Reasoner 是一个专注于推理能力的大语言模型，具有更强的逻辑分析和推理能力，适合复杂问题求解。';
    case 'model-1':
      return '模型1是我们小组开发的视觉问答模型，支持文本和图像输入，能够针对上传的图片回答问题。';
    case 'model-2':
      return '模型2是我们小组开发的增强版视觉问答模型，具有更强的分析和理解能力，支持文本和图像输入。';
    default:
      return `${modelInfo.name}：${modelInfo.description}`;
  }
};

// 聚焦输入框
const focusInput = () => {
  nextTick(() => {
    inputRef.value?.focus();
  });
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
};

// 处理图片变更
const handleImageChange = (file) => {
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    imageData.value = e.target.result;
  };
  reader.readAsDataURL(file.raw);
};

// 移除图片
const removeImage = () => {
  imageData.value = '';
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 发送消息
const sendMessage = async () => {
  if (!canSendMessage.value || loading.value) return;
  
  // 如果没有当前聊天ID，创建一个新的聊天
  if (!currentChatId.value) {
    createNewChat();
  }
  
  const userMessage = {
    role: 'user',
    content: {
      text: inputMessage.value.trim(),
      image: imageData.value || null
    }
  };
  
  // 添加用户消息到界面
  messages.value.push(userMessage);
  
  // 保存用户消息到存储
  addMessage(currentChatId.value, userMessage);
  
  // 清空输入
  inputMessage.value = '';
  removeImage();
  
  // 滚动到底部
  scrollToBottom();
  
  // 显示加载状态
  loading.value = true;
  
  try {
    // 准备历史消息格式 - 转换为后端API期望的格式
    // 后端API期望的历史格式是 {role: 'user'/'assistant', content: '消息内容'}
    const history = messages.value.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content.text // 仅发送文本内容
    }));
    
    // 调用API
    const response = await sendChatRequest({
      model: selectedModel.value,
      message: userMessage.content.text,
      image: userMessage.content.image,
      history: history
    });
    
    // 添加模型回复到界面
    messages.value.push({
      role: 'assistant',
      content: {
        text: response.text || '',
        image: null // 后端不返回图片
      }
    });
    
    // 保存模型回复到存储
    addMessage(currentChatId.value, {
      role: 'assistant',
      content: {
        text: response.text || '',
        image: null
      }
    });
    
    // 滚动到底部
    scrollToBottom();
  } catch (error) {
    console.error('Error in chat:', error);
    ElMessage.error('发送失败：' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 创建新聊天
const createNewChat = () => {
  // 确保使用可用的模型ID
  const modelId = AVAILABLE_MODELS[selectedModel.value] ? selectedModel.value : 'deepseek-chat';
  const newChatId = createChat(modelId);
  currentChatId.value = newChatId;
  messages.value = [];
};

// 处理选择聊天
const handleSelectChat = (chatId) => {
  if (chatId === currentChatId.value) return;
  
  const chat = getChat(chatId);
  if (chat) {
    currentChatId.value = chatId;
    selectedModel.value = chat.modelId;
    messages.value = chat.messages || [];
    scrollToBottom();
  }
};

// 处理模型变更
const handleModelChange = () => {
  createNewChat();
};

// 监听模型变化
watch(() => selectedModel.value, () => {
  // 模型变化时可以在这里添加额外逻辑
});

// 组件挂载时初始化
onMounted(() => {
  // 尝试加载当前聊天
  const savedChatId = getCurrentChatId();
  if (savedChatId) {
    const chat = getChat(savedChatId);
    if (chat) {
      currentChatId.value = savedChatId;
      selectedModel.value = chat.modelId;
      messages.value = chat.messages || [];
      return;
    }
  }
  
  // 如果没有当前聊天或找不到聊天记录，创建新聊天
  createNewChat();
});

// 获取所有可用模型ID
const getAvailableModelIds = () => {
  return getAvailableModels();
};

// 根据ID获取模型信息
const getModelInfoById = (modelId) => {
  return getModelInfo(modelId);
};
</script>

<style scoped>
.model-chat-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 50px;
  margin: 0;
  position: relative;
  overflow-x: hidden;
}

/* 头部区域 */
.header-area {
  background: linear-gradient(135deg, #3a8ee6 0%, #5b48d0 100%);
  color: white;
  padding: 20px 20px;
  text-align: center;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 0 0 30px 0;
  position: relative;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.title {
  font-size: 2rem;
  margin: 0 0 10px;
  font-weight: 600;
}

.description {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

/* 聊天布局 */
.chat-layout {
  display: flex;
  width: 90%;
  margin: auto;
  flex: 1;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative; /* 确保相对定位 */
  z-index: 1; /* 设置较低的z-index */
}

/* 侧边栏 */
.sidebar {
  width: 300px;
  background-color: #fff;
  height: calc(100vh - 180px);
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ebeef5;
}

/* 模型选择区 */
.model-selector {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f9fafb;
  text-align: center;
}

/* 聊天容器 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px - 65px); /* 减去头部和模型选择区高度 */
}

/* 空状态 */
.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}

.empty-chat .el-icon {
  font-size: 4rem;
  color: #409eff;
  margin-bottom: 20px;
}

.empty-chat h3 {
  font-size: 1.5rem;
  color: #303133;
  margin-bottom: 10px;
}

.empty-chat p {
  color: #606266;
  margin-bottom: 20px;
  max-width: 500px;
  line-height: 1.6;
}

/* 消息列表 */
.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}

.message-avatar {
  margin-right: 12px;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 50px);
}

.message-role {
  font-size: 0.8rem;
  color: #909399;
  margin-bottom: 4px;
}

.message-text {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-image {
  margin-top: 8px;
  max-width: 400px;
}

.message-image .el-image {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 用户消息 */
.message-item.user .message-text {
  background-color: #ecf5ff;
  color: #303133;
}

/* 助手消息 */
.message-item.assistant .message-text {
  background-color: #f4f4f5;
  color: #303133;
}

/* 加载动画 */
.message-loading {
  display: flex;
  padding: 15px;
  background-color: #f4f4f5;
  border-radius: 8px;
}

.message-loading span {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 2px;
  background-color: #909399;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.message-loading span:nth-child(1) {
  animation-delay: -0.32s;
}

.message-loading span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 输入区域 */
.input-area {
  padding: 15px;
  border-top: 1px solid #ebeef5;
  background-color: #fff;
}

.image-preview {
  position: relative;
  margin-bottom: 10px;
  display: inline-block;
}

.image-preview .el-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.input-container {
  display: flex;
  align-items: center;
}

.input-container .el-input {
  flex: 1;
}

.action-buttons {
  display: flex;
  margin-left: 10px;
}

.action-buttons .el-button {
  margin-left: 8px;
}

.disabled-upload {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-layout {
    flex-direction: column;
    margin: 10px;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
  
  .chat-container {
    height: calc(100vh - 180px - 65px - 200px);
  }
  
  .message-image {
    max-width: 100%;
  }
}
</style> 