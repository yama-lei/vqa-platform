<template>
  <div class="model-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="model-card">
          <template #header>
            <div class="card-header">
              <h3>模型对话</h3>
              <el-select v-model="selectedModel" placeholder="选择模型">
                <el-option
                  v-for="model in models"
                  :key="model.id"
                  :label="model.name"
                  :value="model.id"
                />
              </el-select>
            </div>
          </template>
          
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessagesRef">
              <template v-if="messages.length">
                <div
                  v-for="(message, index) in messages"
                  :key="index"
                  :class="['message', message.role === 'user' ? 'user-message' : 'model-message']"
                >
                  <div class="message-avatar">
                    <el-avatar :size="36" :icon="message.role === 'user' ? UserFilled : Comment" />
                  </div>
                  <div class="message-content">
                    <div class="message-bubble">
                      <div v-if="message.role === 'model' && message.loading">
                        <span class="loading-dots">
                          <i></i><i></i><i></i>
                        </span>
                      </div>
                      <div v-else v-html="formatMessage(message.content)"></div>
                    </div>
                    <div class="message-time">{{ message.time }}</div>
                  </div>
                </div>
              </template>
              <div v-else class="empty-chat">
                <el-empty description="开始与模型对话吧！">
                  <el-button type="primary" @click="focusInput">开始对话</el-button>
                </el-empty>
              </div>
            </div>
            
            <div class="chat-input">
              <el-input
                v-model="userInput"
                type="textarea"
                :rows="3"
                placeholder="在这里输入您的问题..."
                resize="none"
                ref="inputRef"
                @keydown.enter.ctrl.prevent="sendMessage"
              />
              <div class="input-actions">
                <el-tooltip content="上传图片">
                  <el-button type="primary" :icon="Picture" circle @click="triggerImageUpload" />
                </el-tooltip>
                <el-button type="primary" @click="sendMessage" :disabled="!userInput.trim() && !imageUrl">
                  发送
                </el-button>
              </div>
              <input
                type="file"
                accept="image/*"
                style="display: none"
                ref="imageInputRef"
                @change="handleImageUpload"
              />
            </div>
            
            <div v-if="imageUrl" class="image-preview">
              <el-image :src="imageUrl" :preview-src-list="[imageUrl]" fit="contain" style="max-height: 150px;" />
              <el-button type="danger" size="small" :icon="Delete" circle @click="removeImage" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { UserFilled, Comment, Picture, Delete } from '@element-plus/icons-vue'
// import { sendVQAQuery } from '../../api/model'

const selectedModel = ref('')
const userInput = ref('')
const messages = ref([])
const chatMessagesRef = ref(null)
const inputRef = ref(null)
const imageInputRef = ref(null)
const imageUrl = ref('')

// 模拟模型列表
const models = ref([
  { id: 'model1', name: 'VQA基础模型' },
  { id: 'model2', name: 'VQA高级模型' }
])

// 格式化消息内容（支持简单的Markdown格式）
const formatMessage = (content) => {
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
  
  return formatted
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() && !imageUrl.value) return
  
  // 添加用户消息
  const time = new Date().toLocaleTimeString()
  messages.value.push({
    role: 'user',
    content: userInput.value,
    image: imageUrl.value,
    time
  })
  
  // 添加模型响应（先显示加载中）
  messages.value.push({
    role: 'model',
    content: '',
    loading: true,
    time
  })
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  // 保存用户输入然后清空
  const userMessage = userInput.value
  const userImage = imageUrl.value
  userInput.value = ''
  removeImage()
  
  // 模拟API请求
  setTimeout(() => {
    // 实际项目中，应该调用后端API
    // sendVQAQuery({
    //   modelId: selectedModel.value,
    //   question: userMessage,
    //   image: userImage
    // })
    
    // 模拟响应
    const modelResponses = [
      "根据图像分析，这是一张包含多个物体的场景。我看到有人、汽车和建筑物。",
      "这张图片展示的是一个户外环境，有树木和蓝天。时间应该是白天。",
      "图中显示的是一只猫，它正在沙发上休息。这是一只橙色的短毛猫。",
      "分析结果表明这是一张食物的图片，看起来像是一盘意大利面。",
      "这是一个室内场景，我能看到一张桌子和几把椅子。这应该是一个会议室或餐厅。"
    ]
    
    const randomResponse = modelResponses[Math.floor(Math.random() * modelResponses.length)]
    
    // 更新模型响应
    const lastMessage = messages.value.pop()
    messages.value.push({
      ...lastMessage,
      content: randomResponse,
      loading: false
    })
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }, 1500)
}

// 滚动到消息底部
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

// 聚焦输入框
const focusInput = () => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

// 触发图片上传
const triggerImageUpload = () => {
  if (imageInputRef.value) {
    imageInputRef.value.click()
  }
}

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 移除图片
const removeImage = () => {
  imageUrl.value = ''
  if (imageInputRef.value) {
    imageInputRef.value.value = ''
  }
}

onMounted(() => {
  // 默认选择第一个模型
  if (models.value.length > 0) {
    selectedModel.value = models.value[0].id
  }
})
</script>

<style scoped>
.model-container {
  min-height: 600px;
}

.model-card {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100% - 40px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
  margin-bottom: 20px;
}

.message {
  display: flex;
  margin-bottom: 20px;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 10px 15px;
  border-radius: 10px;
  word-wrap: break-word;
}

.user-message .message-bubble {
  background-color: #409EFF;
  color: white;
  border-top-right-radius: 0;
}

.model-message .message-bubble {
  background-color: #f1f1f1;
  color: #333;
  border-top-left-radius: 0;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.user-message .message-content {
  align-items: flex-end;
}

.chat-input {
  margin-top: auto;
  position: relative;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.image-preview {
  margin-top: 10px;
  position: relative;
  display: inline-block;
}

.image-preview .el-button {
  position: absolute;
  top: 5px;
  right: 5px;
}

.loading-dots {
  display: inline-flex;
  align-items: center;
}

.loading-dots i {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #aaa;
  margin: 0 2px;
  animation: loading 1.4s infinite ease-in-out both;
}

.loading-dots i:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots i:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading {
  0%, 80%, 100% { 
    transform: scale(0);
  } 
  40% { 
    transform: scale(1.0);
  }
}
</style> 