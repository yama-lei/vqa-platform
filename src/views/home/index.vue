<template>
  <div class="home-container">
    <!-- 顶部欢迎区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>欢迎来到VQA学习小组平台</h1>
        <p class="hero-subtitle">这是我们小组的交流与学习平台，您可以在这里分享资料、查看文档和参与模型对话</p>
        <div class="hero-buttons">
          <el-button type="primary" size="large" @click="router.push('/resources')">
            <el-icon><Document /></el-icon>浏览资源
          </el-button>
          <el-button type="success" size="large" @click="router.push('/upload')">
            <el-icon><Upload /></el-icon>上传文件
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 功能卡片区域 -->
    <div class="section-title">
      <h2>我们的功能</h2>
      <div class="section-divider"></div>
    </div>
    
    <el-row :gutter="30" class="feature-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="feature-card" @click="router.push('/resources')">
          <div class="feature-icon">
            <el-icon><Document /></el-icon>
          </div>
          <h3>资源中心</h3>
          <p>浏览、查看并下载小组共享的各类学习资料，包括论文、代码和笔记。</p>
          <div class="feature-card-action">
            <el-button type="primary" text>查看资源</el-button>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="feature-card" @click="router.push('/model')">
          <div class="feature-icon model-icon">
            <el-icon><ChatLineRound /></el-icon>
          </div>
          <h3>模型对话</h3>
          <p>与我们训练的VQA模型进行交流，测试模型效果，探索多模态理解能力。</p>
          <div class="feature-card-action">
            <el-button type="primary" text>开始对话</el-button>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="feature-card" @click="router.push('/upload')">
          <div class="feature-icon upload-icon">
            <el-icon><Upload /></el-icon>
          </div>
          <h3>文件上传</h3>
          <p>上传您的学习资料、笔记或分享文件，与小组成员共享研究成果。</p>
          <div class="feature-card-action">
            <el-button type="primary" text>上传文件</el-button>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="feature-card" @click="router.push('/learning')">
          <div class="feature-icon learning-icon">
            <el-icon><Reading /></el-icon>
          </div>
          <h3>学习空间</h3>
          <p>探索VQA相关的学习资源，包括教程、论文和开源项目，提升技术能力。</p>
          <div class="feature-card-action">
            <el-button type="primary" text>开始学习</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 活动时间线区域 -->
    <div class="section-title">
      <h2>近期活动</h2>
      <div class="section-divider"></div>
    </div>
    
    <div class="timeline-container">
      <el-empty v-if="!activities.length" description="暂无活动"></el-empty>
      <el-timeline v-else>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.time"
          :type="activity.type"
          :hollow="index !== 0"
          :size="index === 0 ? 'large' : 'normal'"
        >
          <div class="timeline-content">
            <h3 v-if="index === 0" class="latest-activity">{{ activity.content }}</h3>
            <p v-else>{{ activity.content }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
    
    <!-- 页脚区域 -->
    <div class="footer">
      <p>© {{ new Date().getFullYear() }} VQA学习小组 · 共同学习，共同进步</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Document, ChatLineRound, Upload, Calendar, Reading } from '@element-plus/icons-vue'

const router = useRouter()

// 模拟活动数据
const activities = ref([
{
    content: 'VQA学习小组网站Version 1.1,更新样式与界面',
    time: '2025-03-27',
    type: 'primary'
  },

  {
    content: '第二次线上会议，讨论多模态模型的最新进展',
    time: '2025-03-23',
    type: 'info'
  },
  {
    content: 'VQA学习小组网站Version 1.0偷偷上线',
    time: '2025-03-20',
    type: 'primary'
  },
  {
    content: '第一次线上会议，介绍VQA相关研究方向',
    time: '2025-03-16',
    type: 'info'
  }
])
</script>

<style scoped>
.home-container {
  padding: 0;
  margin: 0;
  background-color: #f9fafc;
  min-height: 100vh;
  overflow-x: hidden;
}

/* 顶部英雄区域 */
.hero-section {
  background: linear-gradient(135deg, #3a8ee6 0%, #5b48d0 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 0 0 40px 0;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 600;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.hero-buttons .el-button {
  padding: 12px 30px;
  border-radius: 8px;
}

.hero-buttons .el-icon {
  margin-right: 8px;
}

/* 部分标题 */
.section-title {
  text-align: center;
  margin: 40px 0 30px;
}

.section-title h2 {
  font-size: 1.8rem;
  color: #303133;
  margin-bottom: 15px;
  font-weight: 600;
}

.section-divider {
  height: 4px;
  width: 60px;
  background: linear-gradient(90deg, #3a8ee6, #5b48d0);
  margin: 0 auto;
  border-radius: 2px;
}

/* 功能卡片 */
.feature-row {
  padding: 0 20px;
  margin-bottom: 50px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  height: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 32px;
  background: #ecf5ff;
  color: #409EFF;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.model-icon {
  background: #f0f9eb;
  color: #67c23a;
}

.upload-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.learning-icon {
  background-color: #6236FF;
  color: white;
}

.feature-card h3 {
  font-size: 1.4rem;
  color: #303133;
  margin-bottom: 15px;
  font-weight: 600;
}

.feature-card p {
  color: #606266;
  margin-bottom: 20px;
  line-height: 1.6;
  flex-grow: 1;
}

.feature-card-action {
  margin-top: auto;
}

/* 时间线区域 */
.timeline-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 50px;
}

.timeline-content h3.latest-activity {
  font-weight: 600;
  color: #409EFF;
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 30px 20px;
  color: #909399;
  background-color: #f5f7fa;
  margin-top: 40px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-buttons .el-button {
    margin-bottom: 10px;
    width: 100%;
    max-width: 300px;
  }
  
  .section-title h2 {
    font-size: 1.5rem;
  }
}
</style> 