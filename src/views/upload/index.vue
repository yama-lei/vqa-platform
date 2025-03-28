<template>
  <div class="upload-container">
    <!-- 顶部标题区域 -->
    <div class="page-header">
      <h1>文件上传</h1>
      <p class="header-subtitle">上传分享您的学习资料、论文、代码和笔记</p>
    </div>
    
    <!-- 主内容区域 -->
    <div class="content-section">
      <div class="tabs-container">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="上传文件" name="file">
            <div class="upload-area">
              <el-upload
                class="upload-dragger"
                drag
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :file-list="fileList"
                multiple
              >
                <div class="upload-icon-container">
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                </div>
                <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持的文件类型：PDF、Markdown、代码文件、图片、视频等
                  </div>
                </template>
              </el-upload>
              
              <div v-if="uploadProgress > 0 && uploadStatus === 'uploading'" class="upload-progress">
                <el-progress :percentage="uploadProgress" :stroke-width="10" status=""></el-progress>
                <div class="progress-text">文件上传中...{{ uploadProgress.toFixed(0) }}%</div>
              </div>
              
              <div v-if="uploadStatus === 'success' && lastUploadedFile" class="upload-result success">
                <el-alert
                  title="上传成功"
                  type="success"
                  show-icon
                  :closable="true"
                  :description="`文件 '${lastUploadedFile.fileName}' 已成功上传`"
                >
                  <template #default>
                    <div class="alert-actions">
                      <el-button size="small" @click="openPreview(lastUploadedFile)" class="preview-btn">
                        <el-icon><View /></el-icon>预览文件
                      </el-button>
                      <el-button size="small" type="primary" @click="downloadFile(lastUploadedFile)" class="download-btn">
                        <el-icon><Download /></el-icon>下载文件
                      </el-button>
                    </div>
                  </template>
                </el-alert>
              </div>
              
              <div v-if="uploadStatus === 'error'" class="upload-result error">
                <el-alert
                  title="上传失败"
                  type="error"
                  show-icon
                  :closable="true"
                  :description="uploadErrorMessage"
                ></el-alert>
              </div>
              
              <div class="file-info" v-if="fileList.length">
                <el-divider content-position="center">文件信息</el-divider>
                
                <div class="file-items-container">
                  <div v-for="(file, index) in fileList" :key="index" class="file-item">
                    <div class="file-name">
                      <el-icon class="file-type-icon">
                        <Document v-if="isDocumentFile(file.name)" />
                        <Folder v-else-if="isCodeFile(file.name)" />
                        <Picture v-else-if="isImageFile(file.name)" />
                        <VideoPlay v-else-if="isVideoFile(file.name)" />
                        <Files v-else />
                      </el-icon>
                      <span>{{ file.name }}</span>
                    </div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                </div>
                
                <div class="file-form">
                  <el-form label-position="top" :model="fileForm">
                    <el-form-item label="资源类型">
                      <el-select v-model="fileForm.type" placeholder="选择资源类型" style="width: 100%">
                        <el-option label="论文" value="paper" />
                        <el-option label="代码" value="code" />
                        <el-option label="笔记" value="note" />
                        <el-option label="视频" value="video" />
                        <el-option label="其他" value="other" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="资源描述">
                      <el-input
                        v-model="fileForm.description"
                        type="textarea"
                        :rows="3"
                        placeholder="这一功能暂时没有开发，即使写了描述也没用"
                      />
                    </el-form-item>
                    <el-form-item>
                      <div class="form-buttons">
                        <el-button 
                          type="primary" 
                          @click="handleUpload" 
                          :loading="uploading"
                          :disabled="uploadStatus === 'uploading'"
                          class="upload-button"
                        >
                          <el-icon v-if="!uploading"><Upload /></el-icon>
                          {{ uploading ? '上传中...' : '上传文件' }}
                        </el-button>
                        <el-button 
                          @click="resetUpload" 
                          :disabled="uploading || uploadStatus === 'uploading'"
                          class="reset-button"
                        >
                          <el-icon><RefreshRight /></el-icon>重置
                        </el-button>
                      </div>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="上传历史" name="history">
            <div class="upload-history">
              <el-empty v-if="!uploadHistory.length" description="暂无上传历史" class="empty-history">
                <template #image>
                  <el-icon class="empty-icon"><Document /></el-icon>
                </template>
                <template #description>
                  <p>您还没有上传过任何文件</p>
                </template>
              </el-empty>
              
              <el-table 
                v-else 
                :data="uploadHistory" 
                style="width: 100%"
                class="history-table"
              >
                <el-table-column label="文件名" prop="fileName">
                  <template #default="scope">
                    <div class="file-name-cell">
                      <el-icon class="file-icon">
                        <Document v-if="scope.row.type === 'paper' || scope.row.type === 'note'" />
                        <Folder v-if="scope.row.type === 'code'" />
                        <VideoPlay v-if="scope.row.type === 'video'" />
                        <Files v-if="scope.row.type === 'other'" />
                      </el-icon>
                      <span>{{ scope.row.fileName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="资源类型" prop="type" width="120">
                  <template #default="scope">
                    <el-tag 
                      v-if="scope.row.type === 'paper'" 
                      type="primary" 
                      effect="light"
                      class="resource-tag"
                    >论文</el-tag>
                    <el-tag 
                      v-if="scope.row.type === 'code'" 
                      type="success" 
                      effect="light"
                      class="resource-tag"
                    >代码</el-tag>
                    <el-tag 
                      v-if="scope.row.type === 'note'" 
                      type="warning" 
                      effect="light"
                      class="resource-tag"
                    >笔记</el-tag>
                    <el-tag 
                      v-if="scope.row.type === 'video'" 
                      type="danger" 
                      effect="light"
                      class="resource-tag"
                    >视频</el-tag>
                    <el-tag 
                      v-if="scope.row.type === 'other'" 
                      type="info" 
                      effect="light"
                      class="resource-tag"
                    >其他</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="上传时间" prop="uploadTime" width="180"></el-table-column>
                <el-table-column label="状态" prop="status" width="120">
                  <template #default="scope">
                    <el-tag 
                      :type="scope.row.status === 'success' ? 'success' : 'danger'"
                      effect="light"
                      class="status-tag"
                    >
                      {{ scope.row.status === 'success' ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <div class="operation-buttons">
                      <el-button size="small" @click="openPreview(scope.row)" class="action-btn preview-btn">
                        <el-icon><View /></el-icon>预览
                      </el-button>
                      <el-button size="small" type="primary" @click="downloadFile(scope.row)" class="action-btn download-btn">
                        <el-icon><Download /></el-icon>下载
                      </el-button>
                      <el-button size="small" type="danger" @click="handleDelete(scope.row)" class="action-btn delete-btn">
                        <el-icon><Delete /></el-icon>删除
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <!-- 文件预览对话框 -->
    <el-dialog 
      v-model="previewVisible" 
      :title="previewFile?.fileName || '文件预览'" 
      width="80%" 
      destroy-on-close
      class="preview-dialog"
    >
      <div class="preview-container">
        <div class="unknown-preview">
          <el-icon class="preview-icon"><Document /></el-icon>
          <p>该文件类型暂不支持预览，请下载后查看</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadFile(previewFile)" class="download-preview-btn">
          <el-icon><Download /></el-icon>下载
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UploadFilled, 
  Document, 
  Folder, 
  Picture, 
  VideoPlay, 
  Files,
  View,
  Download,
  Delete,
  RefreshRight,
  Upload
} from '@element-plus/icons-vue'
import { 
  uploadFile, 
  downloadFile as ossDownload, 
  deleteFile, 
  listFiles,
  testOssConnection
} from '../../utils/oss'

const activeTab = ref('file')
const fileList = ref([])
const uploading = ref(false)
const previewVisible = ref(false)
const previewFile = ref(null)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadErrorMessage = ref('')
const lastUploadedFile = ref(null)

// 文件表单
const fileForm = reactive({
  type: '',
  description: ''
})

// 上传历史，实际项目中应该从后端获取或本地存储
const uploadHistory = ref([])

// 处理文件变化
const handleFileChange = (uploadFile) => {
  console.log('文件变化:', uploadFile)
  // 将文件添加到文件列表
  fileList.value = [uploadFile] // 如果要支持多文件，可以用push
  
  // 自动判断文件类型并设置
  fileForm.type = determineFileType(uploadFile.name)
}

// 处理文件移除
const handleFileRemove = (uploadFile) => {
  console.log('文件移除:', uploadFile)
}

// 判断文件类型
const isDocumentFile = (fileName) => {
  return /\.(pdf|doc|docx|txt)$/i.test(fileName)
}

const isCodeFile = (fileName) => {
  return /\.(py|js|java|c|cpp|h|html|css|json|xml)$/i.test(fileName)
}

const isImageFile = (fileName) => {
  return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(fileName)
}

const isVideoFile = (fileName) => {
  return /\.(mp4|avi|mov|wmv|flv|mkv|webm)$/i.test(fileName)
}

// 预览相关检查函数
const isPdf = (fileName) => {
  return /\.pdf$/i.test(fileName || '')
}

const isImage = (fileName) => {
  return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(fileName || '')
}

const isVideo = (fileName) => {
  return /\.(mp4|avi|mov|wmv|flv|mkv|webm)$/i.test(fileName || '')
}

const getVideoType = (fileName) => {
  if (!fileName) return 'video/mp4'
  
  const extension = fileName.split('.').pop().toLowerCase()
  switch (extension) {
    case 'mp4': return 'video/mp4'
    case 'webm': return 'video/webm'
    case 'ogg': return 'video/ogg'
    default: return 'video/mp4'
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

// 添加determineFileType函数
const determineFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  
  if (['pdf', 'doc', 'docx'].includes(extension)) {
    return 'paper'
  } else if (['md', 'txt'].includes(extension)) {
    return 'note'
  } else if (['mp4', 'avi', 'mov', 'webm'].includes(extension)) {
    return 'video'
  } else if (['zip', 'rar', 'tar', 'gz', 'py', 'js', 'java', 'c', 'cpp'].includes(extension)) {
    return 'code'
  } else {
    return 'other'
  }
}

// 处理上传
const handleUpload = async () => {
  if (!fileList.value.length) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  
  if (!fileForm.type) {
    ElMessage.warning('请选择资源类型')
    return
  }
  
  uploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = 'uploading'
  uploadErrorMessage.value = ''
  
  const file = fileList.value[0].raw
  console.log('开始上传文件:', file.name)
  
  try {
    // 对于大文件，先检查是否超过限制
    const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('文件大小超过100MB限制，请选择更小的文件')
    }
    
    // 使用OSS工具上传文件
    const result = await uploadFile(file, fileForm.type)
    
    console.log('上传完成，结果:', result)
    
    if (result.success) {
      // 添加到上传历史
      const fileRecord = {
        fileName: file.name,
        objectName: result.objectName,
        type: fileForm.type,
        description: fileForm.description,
        uploadTime: new Date().toLocaleString(),
        status: 'success',
        url: result.url
      }
      
      // 更新上传历史
      uploadHistory.value.unshift(fileRecord)
      localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory.value))
      
      lastUploadedFile.value = fileRecord
      uploadStatus.value = 'success'
      
      // 显示成功提示
      ElMessage({
        message: `文件 "${file.name}" 上传成功！`,
        type: 'success',
        duration: 3000,
        showClose: true,
        center: true,
        customClass: 'upload-success-message'
      })
      
      // 延迟重置和跳转
      setTimeout(() => {
        resetUpload()
        activeTab.value = 'history'
      }, 3000)
    }
  } catch (error) {
    console.error('上传失败:', error)
    uploadStatus.value = 'error'
    uploadErrorMessage.value = error.message || '上传过程中发生错误'
    ElMessage.error({
      message: `上传失败: ${error.message}`,
      duration: 5000,
      showClose: true,
      center: true
    })
  } finally {
    uploading.value = false
  }
}

// 重置上传
const resetUpload = () => {
  fileList.value = []
  fileForm.type = ''
  fileForm.description = ''
}

// 预览文件
const openPreview = (file) => {
  previewFile.value = file
  previewVisible.value = true
}

// 下载文件
const downloadFile = (file) => {
  if (!file || !file.objectName) {
    ElMessage.warning('文件信息不完整，无法下载')
    return
  }
  
  try {
    ossDownload(file.objectName, file.fileName)
    ElMessage.success('下载已开始')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error(`下载失败: ${error.message}`)
  }
}

// 删除文件
const handleDelete = (file) => {
  ElMessageBox.confirm(
    `确定要删除文件 "${file.fileName}" 吗？此操作无法撤销。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteFile(file.objectName)
      
      // 从历史记录中移除
      uploadHistory.value = uploadHistory.value.filter(item => item.objectName !== file.objectName)
      
      // 保存更新后的历史
      saveUploadHistory()
      
      ElMessage.success('文件已删除')
    } catch (error) {
      console.error('删除文件失败:', error)
      ElMessage.error(`删除文件失败: ${error.message}`)
    }
  }).catch(() => {})
}

// 保存上传历史到本地存储
const saveUploadHistory = () => {
  localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory.value))
}

// 从本地存储加载上传历史
const loadUploadHistory = () => {
  const history = localStorage.getItem('uploadHistory')
  if (history) {
    uploadHistory.value = JSON.parse(history)
  }
}

// 检测OSS连接
const checkOssConnection = async () => {
  try {
    console.log('正在检测OSS连接...');
    await testOssConnection();
    console.log('OSS连接正常');
    
    // 连接成功，尝试获取文件列表
    try {
      const files = await listFiles('', 5);
      console.log('成功获取文件列表，数量:', files.length);
    } catch (listError) {
      console.warn('获取文件列表失败，可能是权限问题:', listError);
    }
  } catch (error) {
    console.error('OSS连接失败:', error);
    uploadStatus.value = 'error';
    
    // 根据错误类型提供更具体的提示
    let errorDetail = '';
    if (error.name === 'SecurityError') {
      errorDetail = '这可能是由于浏览器安全限制或跨域问题导致的。';
    } else if (error.message && error.message.includes('Network')) {
      errorDetail = '这可能是网络连接问题。请检查您的网络连接并确保能够访问阿里云OSS服务。';
    } else if (error.message && error.message.includes('AccessDenied')) {
      errorDetail = '这可能是由于AccessKey权限不足或Bucket权限设置错误导致的。';
    } else if (error.status === 403) {
      errorDetail = '访问被拒绝，请检查您的AccessKey是否有效且具有足够的权限。';
    } else if (error.status === 404) {
      errorDetail = 'Bucket不存在或者路径错误。请检查您的Bucket名称是否正确。';
    }
    
    const troubleshootGuide = `
OSS连接排查指南：
1. 检查AccessKey是否正确
2. 确认Bucket名称和区域设置
3. 验证网络连接状态
4. 检查阿里云控制台中的权限设置
5. 考虑使用STS Token进行安全访问
    `;
    
    uploadErrorMessage.value = `OSS连接失败: ${error.message || '未知错误'}。${errorDetail}\n${troubleshootGuide}`;
    
    ElMessage.error({
      message: '检测到OSS连接问题，上传功能可能无法正常工作',
      duration: 10000
    });
  }
};

// 组件挂载时加载历史记录
onMounted(() => {
  loadUploadHistory();
  
  // 测试OSS连接
  checkOssConnection();
  
  // 可以选择从OSS获取文件列表，实现历史同步
  // listFiles().then(files => {
  //   // 处理文件列表
  // }).catch(error => {
  //   console.error('获取文件列表失败:', error)
  // })
})
</script>

<style scoped>
.upload-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}

/* 顶部标题区域 */
.page-header {
  background: linear-gradient(135deg, #3a8ee6 0%, #5b48d0 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.header-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* 内容区域 */
.content-section {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.tabs-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.custom-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
  height: 50px;
  line-height: 50px;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #3a8ee6, #5b48d0);
  height: 3px;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: #5b48d0;
  font-weight: 600;
}

.upload-area {
  padding: 20px 0;
}

.upload-dragger {
  border: 2px dashed #d9ecff;
  border-radius: 12px;
  transition: all 0.3s;
  background-color: #f5f7fa;
}

.upload-dragger:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.upload-icon-container {
  margin-bottom: 15px;
}

.el-icon--upload {
  font-size: 60px;
  color: #409eff;
  margin-bottom: 10px;
}

.el-upload__text {
  font-size: 18px;
  color: #606266;
  margin-bottom: 10px;
}

.el-upload__text em {
  color: #409eff;
  font-style: normal;
  text-decoration: underline;
  cursor: pointer;
}

.el-upload__tip {
  font-size: 14px;
  color: #909399;
  margin-top: 10px;
}

.file-items-container {
  background-color: #f9fafc;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: white;
  margin-bottom: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.file-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-name {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.file-type-icon {
  margin-right: 10px;
  font-size: 20px;
  color: #5b48d0;
}

.file-size {
  color: #909399;
  font-size: 14px;
}

.file-form {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.form-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  margin-top: 10px;
}

.upload-button {
  background: linear-gradient(90deg, #3a8ee6, #5b48d0);
  border: none;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.reset-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 24px;
}

.upload-progress {
  margin: 30px 0;
}

.upload-progress :deep(.el-progress-bar__outer) {
  border-radius: 8px;
  background-color: #e9f2ff;
}

.upload-progress :deep(.el-progress-bar__inner) {
  border-radius: 8px;
  background: linear-gradient(90deg, #3a8ee6, #5b48d0);
}

.progress-text {
  text-align: center;
  margin-top: 12px;
  color: #5b48d0;
  font-size: 16px;
  font-weight: 500;
}

.upload-result {
  margin: 20px 0;
}

.alert-actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.preview-btn, .download-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 上传历史部分 */
.upload-history {
  min-height: 400px;
  padding: 10px 0;
}

.empty-history {
  padding: 40px 0;
}

.empty-icon {
  font-size: 60px;
  color: #c0c4cc;
  margin-bottom: 15px;
}

.history-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.history-table :deep(th) {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

.file-name-cell {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #5b48d0;
  transition: color 0.3s;
}

.file-name-cell:hover {
  color: #3a8ee6;
}

.file-icon {
  margin-right: 8px;
  font-size: 18px;
}

.resource-tag, .status-tag {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px 12px;
}

.preview-btn, .download-btn {
  margin: 0;
}

.delete-btn {
  margin: 0;
}

/* 预览对话框 */
.preview-dialog :deep(.el-dialog__header) {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #ebeef5;
  background-color: #f5f7fa;
}

.preview-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #303133;
}

.preview-container {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  background-color: #f9fafc;
}

.unknown-preview {
  text-align: center;
  color: #606266;
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.preview-icon {
  font-size: 60px;
  color: #909399;
  margin-bottom: 20px;
}

/* 添加上传成功消息的样式 */
:deep(.upload-success-message) {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
  font-size: 16px;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.upload-success-message .el-message__content) {
  font-size: 16px;
  line-height: 1.5;
}

:deep(.upload-success-message .el-message__icon) {
  font-size: 20px;
  margin-right: 10px;
}

.download-preview-btn {
  background: linear-gradient(90deg, #3a8ee6, #5b48d0);
  border: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .content-section {
    padding: 0 10px;
  }
  
  .operation-buttons {
    flex-wrap: wrap;
  }
  
  .action-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style> 