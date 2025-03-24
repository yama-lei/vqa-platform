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
        <div class="unknown-preview">
          <p>该文件类型暂不支持预览，请下载后查看</p>
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
    region: 'oss-cn-nanjing',
    bucket: 'vqaplatform',
    accessKeyId: 'LTAI5tReDFUSL6VJgTseWiGy'.substring(0, 3) + '***' + 'LTAI5tReDFUSL6VJgTseWiGy'.substring('LTAI5tReDFUSL6VJgTseWiGy'.length - 3),
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.unknown-preview {
  color: #909399;
  font-size: 16px;
}
</style> 