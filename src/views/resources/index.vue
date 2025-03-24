<template>
  <div class="resources-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>资源中心</h3>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索资源"
            prefix-icon="Search"
            clearable
            style="width: 300px"
            @input="handleSearch"
          />
        </div>
      </template>
      

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="论文" name="paper"></el-tab-pane>
        <el-tab-pane label="代码" name="code"></el-tab-pane>
        <el-tab-pane label="笔记" name="note"></el-tab-pane>
        <el-tab-pane label="视频" name="video"></el-tab-pane>
      </el-tabs>
      
      <el-empty v-if="!filteredResources.length" description="暂无资源"></el-empty>
      
      <el-table v-else :data="filteredResources" style="width: 100%" v-loading="loading">
        <el-table-column label="资源名称" prop="name">
          <template #default="scope">
            <div class="resource-name" @click="previewResource(scope.row)">
              <el-icon>
                <Document v-if="scope.row.type === 'paper' || scope.row.type === 'note'" />
                <Folder v-if="scope.row.type === 'code'" />
                <VideoPlay v-if="scope.row.type === 'video'" />
              </el-icon>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="type" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'paper'" type="primary">论文</el-tag>
            <el-tag v-if="scope.row.type === 'code'" type="success">代码</el-tag>
            <el-tag v-if="scope.row.type === 'note'" type="warning">笔记</el-tag>
            <el-tag v-if="scope.row.type === 'video'" type="danger">视频</el-tag>
            <el-tag v-if="scope.row.type === 'other'" type="info">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上传时间" prop="uploadTime" width="180"></el-table-column>
        <el-table-column label="上传者" prop="uploader" width="120"></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="downloadResource(scope.row)">下载</el-button>
            <el-button size="small" type="primary" @click="previewResource(scope.row)">预览</el-button>
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
    </el-card>
    
    <!-- 资源预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="currentResource?.name" width="80%" destroy-on-close>
      <div class="preview-container">
        <!-- PDF预览 -->
        <div v-if="currentResource?.type === 'paper' || (currentResource?.type === 'note' && isPdfFile(currentResource?.name))" class="pdf-preview">
          <div class="pdf-actions">
            <el-button type="primary" @click="openInNewTab(currentResource?.url)">在新窗口中预览</el-button>
            <el-button @click="downloadResource(currentResource)">下载文件</el-button>
          </div>
        </div>
        
        <!-- Markdown预览 -->
        <div v-if="currentResource?.type === 'note' && isMarkdownFile(currentResource?.name)" class="markdown-preview" v-html="renderedMarkdown"></div>
        
        <!-- 图片预览 -->
        <div v-if="isImageFile(currentResource?.name)" class="image-preview">
          <el-image :src="currentResource?.url" fit="contain" style="width: 100%; max-height: 600px;"></el-image>
        </div>
        
        <!-- 视频预览 -->
        <div v-if="currentResource?.type === 'video'" class="video-preview">
          <video controls style="width: 100%; max-height: 600px;">
            <source :src="currentResource?.url" :type="getVideoType(currentResource?.name)">
            您的浏览器不支持视频播放
          </video>
        </div>
        
        <!-- 其他文件 -->
        <div v-if="!isPdfFile(currentResource?.name) && !isMarkdownFile(currentResource?.name) && !isImageFile(currentResource?.name) && currentResource?.type !== 'video'" class="other-preview">
          <el-empty description="无法预览此类型文件，请下载后查看"></el-empty>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadResource(currentResource)">下载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { Document, Folder, VideoPlay, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { downloadFile as ossDownload, listFiles, getSignedUrl, createOssClient } from '../../utils/oss'

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

// 预览资源
const previewResource = async (resource) => {
  try {
    // 确保URL是最新的预览URL
    if (resource.objectName) {
      // 重新获取带有预览参数的签名URL
      const previewUrl = getSignedUrl(resource.objectName, 'get', 3600)
      currentResource.value = {
        ...resource,
        url: previewUrl
      }
      
      // 如果是PDF文件，使用新窗口打开预览
      if (isPdfFile(resource.name)) {
        window.open(previewUrl, '_blank')
        return
      }
    }
    
    // 如果是Markdown，需要渲染
    if (resource.type === 'note' && isMarkdownFile(resource.name)) {
      const mockMarkdown = `# VQA模型架构笔记\n\n## 简介\n\nVQA（视觉问答）是一项结合计算机视觉和自然语言处理的任务。\n\n## 模型架构\n\n1. 图像编码器\n2. 问题编码器\n3. 多模态融合\n4. 答案预测`
      renderedMarkdown.value = marked(mockMarkdown)
    }
    
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

// 将上传历史转换为资源列表格式
const convertUploadHistoryToResources = () => {
  const uploadHistoryStr = localStorage.getItem('uploadHistory')
  if (!uploadHistoryStr) return
  
  try {
    const uploadHistory = JSON.parse(uploadHistoryStr)
    
    // 转换格式并合并到现有资源中
    const convertedResources = uploadHistory.map(item => ({
      name: item.fileName,
      type: item.type || determineType(item.fileName),
      url: item.url,
      objectName: item.objectName,
      uploadTime: item.uploadTime,
      uploader: '当前用户',
      description: item.description || ''
    }))
    
    // 使用objectName作为唯一标识符来去重
    const existingObjectNames = new Set(resources.value.map(r => r.objectName))
    const newResources = convertedResources.filter(r => !existingObjectNames.has(r.objectName))
    
    resources.value = [...resources.value, ...newResources]
    totalResources.value = resources.value.length
    
    // 清理已经不存在于OSS的资源
    cleanupResources()
  } catch (error) {
    console.error('转换上传历史失败:', error)
  }
}

// 添加清理资源的函数
const cleanupResources = async () => {
  try {
    const fileList = await listFiles()
    const ossFiles = new Set(fileList.map(f => f.objectName))
    
    // 过滤掉不在OSS中的资源
    resources.value = resources.value.filter(r => ossFiles.has(r.objectName))
    
    // 更新本地存储
    const cleanedHistory = resources.value
      .filter(r => r.uploader === '当前用户')
      .map(r => ({
        fileName: r.name,
        objectName: r.objectName,
        type: r.type,
        url: r.url,
        uploadTime: r.uploadTime,
        description: r.description
      }))
    
    localStorage.setItem('uploadHistory', JSON.stringify(cleanedHistory))
  } catch (error) {
    console.error('清理资源失败:', error)
  }
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
      resources.value = fileList.map(file => ({
        name: file.name,
        type: determineType(file.name),
        url: file.url,
        objectName: file.name,
        uploadTime: new Date(file.lastModified).toLocaleString(),
        uploader: '系统用户',
        description: ''
      }))
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
    region: 'oss-cn-nanjing',
    bucket: 'vqaplatform',
    accessKeyId: 'LTAI5tReDFUSL6VJgTseWiGy'.substring(0, 3) + '***' + 'LTAI5tReDFUSL6VJgTseWiGy'.substring('LTAI5tReDFUSL6VJgTseWiGy'.length - 3),
  }
})

// 根据文件名判断类型
const determineType = (fileName) => {
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
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.resource-name {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #409EFF;
}

.resource-name .el-icon {
  margin-right: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.preview-container {
  min-height: 400px;
}

.pdf-preview, .video-preview, .markdown-preview, .image-preview, .other-preview {
  width: 100%;
  height: 600px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: auto;
}

.markdown-preview {
  padding: 20px;
}

.pdf-preview {
  width: 100%;
  height: 600px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}

.pdf-fallback {
  padding: 20px;
  text-align: center;
}

.pdf-fallback p {
  margin-bottom: 15px;
  color: #909399;
}

.pdf-fallback .el-button {
  margin: 0 10px;
}

.pdf-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px;
}
</style> 