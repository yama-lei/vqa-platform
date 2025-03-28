<template>
  <div class="chat-history">
    <div class="history-header">
      <h3>历史对话</h3>
      <el-button @click="createNewChat" type="primary" size="small" circle>
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>
    
    <div class="history-list">
      <el-empty v-if="!chatList.length" description="暂无历史对话" />
      
      <div
        v-else
        v-for="chat in chatList"
        :key="chat.id"
        :class="['history-item', { active: currentChatId === chat.id }]"
        @click="selectChat(chat.id)"
      >
        <div class="item-content">
          <el-icon><ChatLineRound /></el-icon>
          <div class="item-info">
            <div class="item-title">{{ chat.title }}</div>
            <div class="item-time">{{ formatTime(chat.updatedAt) }}</div>
          </div>
        </div>
        <div class="item-actions">
          <el-popconfirm
            title="确定删除此对话？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="deleteChat(chat.id)"
            width="200"
          >
            <template #reference>
              <el-button type="danger" size="small" circle>
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>
    
    <div class="history-footer">
      <el-popconfirm
        title="确定清空所有对话历史？"
        confirm-button-text="确定"
        cancel-button-text="取消"
        @confirm="clearAllChats"
        width="220"
      >
        <template #reference>
          <el-button type="danger" size="small" plain>清空历史</el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { Plus, Delete, ChatLineRound } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { 
  getAllChats, 
  getCurrentChatId, 
  setCurrentChatId, 
  deleteChat as deleteChatFromStorage,
  clearAllChats as clearAllChatsFromStorage
} from '../../../utils/chatStorage';

const props = defineProps({
  modelId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['select-chat', 'create-chat']);

// 聊天列表
const chatList = ref([]);
// 当前选中的聊天ID
const currentChatId = ref('');

// 过滤当前模型的聊天记录
const filteredChatList = computed(() => {
  // 确保modelId是有效值
  if (!props.modelId || !chatList.value || !chatList.value.length) {
    return [];
  }
  return chatList.value.filter(chat => chat.modelId === props.modelId);
});

// 加载聊天历史
const loadChatHistory = () => {
  chatList.value = getAllChats();
  currentChatId.value = getCurrentChatId();
};

// 选择聊天
const selectChat = (chatId) => {
  currentChatId.value = chatId;
  setCurrentChatId(chatId);
  emit('select-chat', chatId);
};

// 创建新聊天
const createNewChat = () => {
  emit('create-chat');
};

// 删除聊天
const deleteChat = (chatId) => {
  const success = deleteChatFromStorage(chatId);
  if (success) {
    loadChatHistory();
    ElMessage.success('对话已删除');
  }
};

// 清空所有聊天
const clearAllChats = () => {
  clearAllChatsFromStorage();
  loadChatHistory();
  ElMessage.success('所有对话历史已清空');
  emit('create-chat');
};

// 格式化日期时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 一天内
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  // 一周内
  else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
  }
  // 超过一周
  else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  }
};

// 监听模型变化
watch(() => props.modelId, () => {
  loadChatHistory();
});

// 组件挂载时加载聊天历史
onMounted(() => {
  loadChatHistory();
});
</script>

<style scoped>
.chat-history {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid #ebeef5;
  background-color: #fff;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f5f7fa;
}

.history-item:hover {
  background-color: #e6f1fc;
}

.history-item.active {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.item-content {
  display: flex;
  align-items: center;
  overflow: hidden;
}

.item-content .el-icon {
  margin-right: 10px;
  font-size: 18px;
  color: #409eff;
}

.item-info {
  flex: 1;
  overflow: hidden;
}

.item-title {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.item-time {
  font-size: 12px;
  color: #909399;
}

.item-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.history-item:hover .item-actions {
  opacity: 1;
}

.history-footer {
  padding: 15px;
  text-align: center;
  border-top: 1px solid #ebeef5;
}

/* 空状态样式 */
.el-empty {
  padding: 30px 0;
}
</style> 