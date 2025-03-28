<template>
  <div class="resources-container">
    <!-- 顶部标题区域 -->
    <div class="page-header">
      <h1>资源中心</h1>
      <p class="header-subtitle">浏览和下载小组共享的学习资料、论文、代码和笔记</p>
    </div>
    
    <!-- 主内容区域 -->
    <div class="content-section">
      <div class="search-filter-area">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索资源"
          prefix-icon="Search"
          clearable
          class="search-input"
          @input="handleSearch"
        />
        
        <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="resource-tabs">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="论文" name="paper"></el-tab-pane>
          <el-tab-pane label="代码" name="code"></el-tab-pane>
          <el-tab-pane label="笔记" name="note"></el-tab-pane>
          <el-tab-pane label="视频" name="video"></el-tab-pane>
        </el-tabs>
      </div>
      
      <div class="resources-table-container">
        <el-empty v-if="!filteredResources.length" description="暂无资源" class="empty-resources">
          <template #image>
            <el-icon class="empty-icon"><Files /></el-icon>
          </template>
        </el-empty>
        
        <el-table 
          v-else 
          :data="filteredResources" 
          style="width: 100%" 
          v-loading="loading"
          class="resources-table"
        >
          <el-table-column label="资源名称" prop="name">
            <template #default="scope">
              <div class="resource-name" @click="previewResource(scope.row)">
                <el-icon>
                  <Document v-if="scope.row.type === 'paper' || scope.row.type === 'note'" />
                  <Folder v-if="scope.row.type === 'code'" />
                  <VideoPlay v-if="scope.row.type === 'video'" />
                  <Files v-if="scope.row.type === 'other'" />
                </el-icon>
                <span>{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="类型" prop="type" width="120">
            <template #default="scope">
              <el-tag 
                :type="getTagType(scope.row.type)" 
                effect="light"
                class="resource-tag"
              >
                {{ getTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="上传时间" prop="uploadTime" width="180"></el-table-column>
          <el-table-column label="上传者" prop="uploader" width="120"></el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <div class="action-buttons">
                <el-button 
                  size="small" 
                  class="download-btn"
                  @click="downloadResource(scope.row)"
                >
                  <el-icon><Download /></el-icon>下载
                </el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  class="preview-btn"
                  @click="previewResource(scope.row)"
                >
                  <el-icon><View /></el-icon>预览
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="totalResources"
            :current-page="currentPage"
            :page-size="pageSize"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    
    <!-- 资源预览对话框 -->
    <el-dialog 
      v-model="previewDialogVisible" 
      :title="currentResource?.name" 
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
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadResource(currentResource)">
          <el-icon><Download /></el-icon>下载
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { 
  Document, 
  Folder, 
  VideoPlay, 
  Search, 
  Download, 
  View,
  Files
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { downloadFile as ossDownload, listFiles, getSignedUrl, createOssClient } from '../../utils/oss'
import VuePdfEmbed from 'vue-pdf-embed'

const loading = ref(false)
const searchKeyword = ref('')
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const totalResources = ref(0)

const previewDialogVisible = ref(false)
const currentResource = ref(null)
const renderedMarkdown = ref('')
const ossConfig = ref(null) // 添加OSS配置的状态

// 资源列表，实际项目中从后端或本地存储获取
const resources = ref([])

// 获取标签类型
const getTagType = (resourceType) => {
  switch (resourceType) {
    case 'paper': return 'primary'
    case 'code': return 'success'
    case 'note': return 'warning'
    case 'video': return 'danger'
    default: return 'info'
  }
}

// 获取类型显示文本
const getTypeLabel = (resourceType) => {
  switch (resourceType) {
    case 'paper': return '论文'
    case 'code': return '代码'
    case 'note': return '笔记'
    case 'video': return '视频'
    default: return '其他'
  }
}

// 根据当前标签和搜索关键词过滤资源
const filteredResources = computed(() => {
  let result = resources.value

  // 按类型过滤
  if (activeTab.value !== 'all') {
    result = result.filter(item => item.type === activeTab.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      (item.uploader && item.uploader.toLowerCase().includes(keyword))
    )
  }

  totalResources.value = result.length
  return result
})

// 文件类型判断工具函数
const isPdfFile = (fileName) => {
  return /\.pdf$/i.test(fileName || '')
}

const isMarkdownFile = (fileName) => {
  return /\.md$/i.test(fileName || '')
}

const isImageFile = (fileName) => {
  return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(fileName || '')
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

// 标签切换
const handleTabClick = () => {
  currentPage.value = 1
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 分页切换
const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 获取文件类型
const getFileType = (fileName) => {
  if (!fileName) return 'unknown'
  
  // 解码文件名（处理中文）
  const decodedFileName = decodeURIComponent(fileName)
  const typePrefix = decodedFileName.split('/')[0] // 获取类型前缀
  
  // 根据目录前缀确定文件类型
  switch (typePrefix) {
    case 'paper':
      return 'paper'
    case 'code':
      return 'code'
    case 'note':
      return 'note'
    case 'video':
      return 'video'
    default:
      return 'other'
  }
}

// 预览资源
const previewResource = async (resource) => {
  try {
    console.log('开始预览资源:', resource)
    
    // 直接显示预览对话框
    currentResource.value = resource
    previewDialogVisible.value = true
  } catch (error) {
    console.error('预览失败:', error)
    ElMessage.error('预览失败，请尝试下载查看')
  }
}

// 下载资源
const downloadResource = (resource) => {
  if (!resource || !resource.objectName) {
    ElMessage.warning('资源信息不完整，无法下载')
    return
  }
  
  try {
    ossDownload(resource.objectName, resource.name)
    ElMessage.success('下载已开始')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error(`下载失败: ${error.message}`)
  }
}

// 根据文件名判断类型
const determineType = (fileName) => {
  if (!fileName) {
    console.log('文件名为空，返回other类型')
    return 'other'
  }
  
  // 解码文件名（处理中文）
  const decodedFileName = decodeURIComponent(fileName)
  console.log('解码后的文件名:', decodedFileName)
  
  // 获取类型前缀
  const typePrefix = decodedFileName.split('/')[0]
  console.log('类型前缀:', typePrefix)
  
  // 根据目录前缀确定文件类型
  let fileType = 'other'
  switch (typePrefix) {
    case 'paper':
      fileType = 'paper'
      break
    case 'code':
      fileType = 'code'
      break
    case 'note':
      fileType = 'note'
      break
    case 'video':
      fileType = 'video'
      break
    default:
      console.log('未找到类型前缀，返回other类型')
  }
  
  console.log('最终确定的文件类型:', fileType)
  return fileType
}

// 组件挂载时获取资源列表
onMounted(async () => {
  loading.value = true
  try {
    // 获取OSS文件列表
    const fileList = await listFiles()
    console.log('OSS文件列表:', fileList)
    
    // 将OSS文件列表转换为资源格式
    if (fileList && fileList.length > 0) {
      resources.value = fileList.map(file => {
        // 确保使用完整的objectName来判断类型
        const fileType = determineType(file.objectName || file.name)
        console.log(`文件 ${file.objectName || file.name} 的类型被确定为:`, fileType)
        return {
          name: file.name,
          type: fileType,
          url: file.url,
          objectName: file.objectName || file.name,
          uploadTime: new Date(file.lastModified).toLocaleString(),
          uploader: '系统用户',
          description: ''
        }
      })
    }
    
    // 如果有本地上传历史，也合并进来
    convertUploadHistoryToResources()
    
  } catch (error) {
    console.error('获取资源列表失败:', error)
    ElMessage.error('获取资源列表失败')
  } finally {
    loading.value = false
  }
  
  // 获取OSS配置
  ossConfig.value = {
    region: import.meta.env.VITE_OSS_REGION,
    bucket: import.meta.env.VITE_OSS_BUCKET
  }
})

// 将上传历史转换为资源列表格式
const convertUploadHistoryToResources = () => {
  const uploadHistoryStr = localStorage.getItem('uploadHistory')
  if (!uploadHistoryStr) return
  
  try {
    const uploadHistory = JSON.parse(uploadHistoryStr)
    
    // 转换格式并合并到现有资源中
    const convertedResources = uploadHistory.map(item => {
      // 确保使用完整的objectName来判断类型
      const fileType = determineType(item.objectName || item.fileName)
      console.log(`上传历史中的文件 ${item.objectName || item.fileName} 的类型被确定为:`, fileType)
      return {
        name: item.fileName,
        type: fileType,
        url: item.url,
        objectName: item.objectName || item.fileName,
        uploadTime: item.uploadTime,
        uploader: '当前用户',
        description: item.description || ''
      }
    })
    
    // 使用objectName作为唯一标识符来去重
    const existingObjectNames = new Set(resources.value.map(r => r.objectName))
    const newResources = convertedResources.filter(r => !existingObjectNames.has(r.objectName))
    
    resources.value = [...resources.value, ...newResources]
    totalResources.value = resources.value.length
  } catch (error) {
    console.error('转换上传历史失败:', error)
  }
}

// 添加在新窗口打开的方法
const openInNewTab = (url) => {
  if (!url) {
    ElMessage.warning('无法获取文件URL')
    return
  }
  window.open(url, '_blank')
}
</script>

<style scoped>
.resources-container {
  padding: 0;
  background-color: #f9fafc;
  min-height: 100vh;
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

.search-filter-area {
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.search-input {
  max-width: 400px;
  margin-bottom: 20px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.resource-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
}

.resource-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #3a8ee6, #5b48d0);
  height: 3px;
}

.resources-table-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.resources-table :deep(.el-table__header-wrapper) {
  background-color: #f9fafc;
}

.resources-table :deep(th) {
  background-color: #f9fafc;
  font-weight: 600;
  color: #303133;
}

.resource-name {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #5b48d0;
  transition: color 0.3s;
}

.resource-name:hover {
  color: #3a8ee6;
}

.resource-name .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.resource-tag {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.download-btn, .preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
}

.download-btn .el-icon, .preview-btn .el-icon {
  margin-right: 4px;
}

.preview-btn {
  background: linear-gradient(90deg, #3a8ee6, #5b48d0);
  border: none;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 空状态样式 */
.empty-resources {
  padding: 40px 0;
}

.empty-icon {
  font-size: 60px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

/* 预览对话框 */
.preview-dialog :deep(.el-dialog__header) {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #ebeef5;
}

.preview-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.unknown-preview {
  text-align: center;
  color: #606266;
}

.preview-icon {
  font-size: 60px;
  color: #909399;
  margin-bottom: 20px;
}

.unknown-preview p {
  font-size: 16px;
  margin: 0;
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
  
  .search-input {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

.resources-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}
</style> 