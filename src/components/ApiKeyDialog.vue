<template>
  <el-dialog
    v-model="dialogVisible"
    title="API设置"
    width="500px"
    :close-on-click-modal="false"
    class="api-key-dialog"
  >
    <el-form :model="form" label-position="top">
      <el-form-item label="API密钥 (x-api-key)" required>
        <el-input 
          v-model="form.apiKey" 
          type="password" 
          placeholder="请输入API密钥"
          show-password
        />
        <div class="form-tip">
          API密钥用于访问VQA平台后端服务，请妥善保管
        </div>
      </el-form-item>
      
      <div class="api-info">
        <h4>API说明：</h4>
        <p>此API密钥用于访问 api.yama-lei.top 的视觉问答服务。</p>
        <p>所有API请求都需要在请求头中包含 <code>x-api-key</code> 进行身份验证。</p>
        <p>平台支持以下模型：</p>
        <ul>
          <li><code>deepseek-chat</code>（默认）: 支持文本和图像分析的通用大语言模型</li>
          <li><code>deepseek-reasoner</code>: 具有更强推理能力的大语言模型</li>
        </ul>
        <p>如果您没有API密钥，请联系管理员获取。</p>
      </div>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" @click="saveApiKey" :disabled="!form.apiKey">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getApiKey, setApiKey } from '../api/chat';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'saved']);

// 对话框可见性
const dialogVisible = ref(props.modelValue);

// 表单数据
const form = reactive({
  apiKey: getApiKey() || ''
});

// 监听对话框可见性变化
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val;
});

// 监听对话框内部可见性变化
watch(() => dialogVisible.value, (val) => {
  emit('update:modelValue', val);
});

// 取消对话框
const cancelDialog = () => {
  dialogVisible.value = false;
};

// 保存API密钥
const saveApiKey = () => {
  if (!form.apiKey) {
    ElMessage.warning('请输入API密钥');
    return;
  }
  
  try {
    setApiKey(form.apiKey);
    ElMessage.success('API密钥已保存');
    emit('saved', true);
    dialogVisible.value = false;
  } catch (error) {
    console.error('保存API密钥失败:', error);
    ElMessage.error('保存API密钥失败');
  }
};
</script>

<style scoped>
.api-key-dialog {
  text-align: left;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.api-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.api-info h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
}

.api-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.api-info code {
  background-color: #e9e9eb;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.api-info ul {
  margin: 8px 0;
  padding-left: 20px;
}

.api-info li {
  margin: 5px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 