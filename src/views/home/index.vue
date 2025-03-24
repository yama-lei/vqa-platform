<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <h2>欢迎来到VQA学习小组平台</h2>
          <p>这是我们小组的交流与学习平台，您可以在这里分享资料、查看文档和参与模型对话</p>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="8">
        <el-card class="feature-card">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>资源中心</span>
            </div>
          </template>
          <div class="card-content">
            <p>浏览、查看并下载小组共享的各类学习资料</p>
            <el-button type="primary" @click="router.push('/resources')">查看资源</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="feature-card">
          <template #header>
            <div class="card-header">
              <el-icon><ChatLineRound /></el-icon>
              <span>模型对话</span>
            </div>
          </template>
          <div class="card-content">
            <p>与我们训练的VQA模型进行交流，测试模型效果</p>
            <el-button type="primary" @click="router.push('/model')">开始对话</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="feature-card">
          <template #header>
            <div class="card-header">
              <el-icon><Upload /></el-icon>
              <span>文件上传</span>
            </div>
          </template>
          <div class="card-content">
            <p>上传您的学习资料、笔记或分享文件</p>
            <el-button type="primary" @click="router.push('/upload')">上传文件</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Calendar /></el-icon>
              <span>近期活动</span>
            </div>
          </template>
          <el-empty v-if="!activities.length" description="暂无活动"></el-empty>
          <el-timeline v-else>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.time"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Document, ChatLineRound, Upload, Calendar } from '@element-plus/icons-vue'

const router = useRouter()

// 模拟活动数据
const activities = ref([
  {
    content: 'VQA模型训练进展分享',
    time: '2023-03-20',
    type: 'primary'
  },
  {
    content: '小组例会 - 讨论最新研究论文',
    time: '2023-03-15',
    type: 'success'
  },
  {
    content: '新增视觉问答数据集分享',
    time: '2023-03-10',
    type: 'info'
  }
])
</script>

<style scoped>
.home-container {
  padding: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.welcome-card {
  text-align: center;
  background-color: #ecf5ff;
}

.welcome-card h2 {
  margin-top: 0;
  color: #409EFF;
}

.card-header {
  display: flex;
  align-items: center;
}

.card-header .el-icon {
  margin-right: 8px;
}

.feature-card .card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100px;
}

.feature-card .card-content p {
  text-align: center;
  margin-bottom: 20px;
}
</style> 