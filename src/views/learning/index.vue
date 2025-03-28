<template>
  <div class="learning-container">
    <!-- 头部区域 -->
    <div class="header-area">
      <div class="header-content">
        <h1 class="title">学习空间</h1>
        <p class="description">[声明：本页面全部由ai生成]</p>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-section">
      <!-- 学习主题区域 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="section-header">
            <h2>学习主题</h2>
            <div class="section-divider"></div>
          </div>
        </el-col>
      </el-row>

      <!-- 学习主题卡片 -->
      <el-row :gutter="20" class="learning-cards">
        <el-col :xs="24" :sm="12" :lg="8" v-for="(category, index) in learningCategories" :key="index">
          <el-card class="learning-card" shadow="hover">
            <div class="category-icon" :class="category.iconClass">
              <el-icon><component :is="category.icon" /></el-icon>
            </div>
            <h3>{{ category.title }}</h3>
            <p>{{ category.description }}</p>
            <el-collapse>
              <el-collapse-item :title="`查看${category.resources.length}个资源`">
                <ul class="resource-list">
                  <li v-for="(resource, idx) in category.resources" :key="idx">
                    <a :href="resource.url" target="_blank" class="resource-link">
                      <el-icon><Link /></el-icon>
                      {{ resource.name }}
                    </a>
                    <span class="resource-desc">{{ resource.description }}</span>
                  </li>
                </ul>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </el-col>
      </el-row>

      <!-- 代码仓库区域 -->
      <el-row :gutter="20" class="mt-40">
        <el-col :span="24">
          <div class="section-header">
            <h2>代码仓库</h2>
            <div class="section-divider"></div>
          </div>
        </el-col>
      </el-row>

      <!-- 代码仓库卡片 -->
      <el-row :gutter="20" class="repo-cards">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(repo, index) in repositories" :key="index">
          <el-card class="repo-card" shadow="hover">
            <img :src="repo.logo" class="repo-logo" :alt="repo.name">
            <h3>{{ repo.name }}</h3>
            <p>{{ repo.description }}</p>
            <div class="repo-tags">
              <el-tag v-for="(tag, idx) in repo.tags" :key="idx" size="small" class="repo-tag">{{ tag }}</el-tag>
            </div>
            <el-button type="primary" @click="openUrl(repo.url)" class="repo-button">
              <el-icon><Link /></el-icon> 访问仓库
            </el-button>
          </el-card>
        </el-col>
      </el-row>

      <!-- 推荐学习路径 -->
      <el-row :gutter="20" class="mt-40">
        <el-col :span="24">
          <div class="section-header">
            <h2>推荐学习路径</h2>
            <div class="section-divider"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-card class="learning-path-card">
            <el-steps :active="1" finish-status="success" simple>
              <el-step 
                v-for="(step, index) in learningPath" 
                :key="index" 
                :title="step.title" 
                :description="step.description" 
              />
            </el-steps>
            <div class="learning-path-detail">
              <h3>从入门到精通的VQA学习指南</h3>
              <p>视觉问答(VQA)是一个充满挑战的跨领域研究方向，结合了计算机视觉和自然语言处理的技术。按照上述路径学习，可循序渐进地掌握相关知识和技能。</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  Cpu, 
  Connection, 
  DataAnalysis, 
  Monitor, 
  Reading, 
  PictureFilled, 
  Link 
} from '@element-plus/icons-vue';

// 打开URL
const openUrl = (url) => {
  window.open(url, '_blank');
};

// 学习分类
const learningCategories = ref([
  {
    title: 'PyTorch基础',
    description: '学习PyTorch框架基础知识，为构建深度学习模型打下基础',
    icon: 'Cpu',
    iconClass: 'icon-pytorch',
    resources: [
      {
        name: 'PyTorch官方教程',
        url: 'https://pytorch.org/tutorials/',
        description: '官方文档，从入门到高级应用'
      },
      {
        name: 'PyTorch深度学习实战',
        url: 'https://github.com/yunjey/pytorch-tutorial',
        description: '实用PyTorch示例与代码'
      },
      {
        name: '动手学深度学习-PyTorch版',
        url: 'https://tangshusen.me/Dive-into-DL-PyTorch/',
        description: '全面的PyTorch入门教程'
      }
    ]
  },
  {
    title: '多模态融合算法',
    description: '学习如何将不同模态的信息（如视觉和文本）进行有效融合',
    icon: 'Connection',
    iconClass: 'icon-multimodal',
    resources: [
      {
        name: '多模态深度学习综述',
        url: 'https://arxiv.org/abs/2105.11087',
        description: '多模态学习的全面综述'
      },
      {
        name: 'ViLT: Vision-and-Language Transformer',
        url: 'https://arxiv.org/abs/2102.03334',
        description: '视觉语言预训练模型'
      },
      {
        name: 'VisualBERT介绍',
        url: 'https://arxiv.org/abs/1908.03557',
        description: '用于视觉语言任务的预训练模型'
      },
      {
        name: '多模态融合技术博客',
        url: 'https://lilianweng.github.io/lil-log/2020/10/29/open-domain-question-answering.html',
        description: '多模态融合技术详解'
      }
    ]
  },
  {
    title: '答案生成算法',
    description: '学习如何基于图像内容生成准确、自然的回答',
    icon: 'DataAnalysis',
    iconClass: 'icon-generation',
    resources: [
      {
        name: 'VQA调研与方法',
        url: 'https://arxiv.org/abs/1505.00468',
        description: 'VQA研究的开创性论文'
      },
      {
        name: 'BLIP-2: Bootstrapping',
        url: 'https://arxiv.org/abs/2301.12597',
        description: '视觉语言预训练与生成'
      },
      {
        name: '多模态大型语言模型',
        url: 'https://arxiv.org/abs/2302.00923',
        description: 'LLaMA模型与多模态应用'
      }
    ]
  },
  {
    title: '计算机视觉基础',
    description: '学习图像处理与分析的基础知识',
    icon: 'Monitor',
    iconClass: 'icon-vision',
    resources: [
      {
        name: '斯坦福CS231n课程',
        url: 'http://cs231n.stanford.edu/',
        description: '卷积神经网络视觉识别'
      },
      {
        name: 'OpenCV入门指南',
        url: 'https://docs.opencv.org/master/d9/df8/tutorial_root.html',
        description: '图像处理库入门'
      },
      {
        name: 'YOLO目标检测',
        url: 'https://github.com/ultralytics/yolov5',
        description: '高效目标检测算法'
      }
    ]
  },
  {
    title: '自然语言处理',
    description: '学习文本处理与理解的核心技术',
    icon: 'Reading',
    iconClass: 'icon-nlp',
    resources: [
      {
        name: 'Transformer模型详解',
        url: 'https://arxiv.org/abs/1706.03762',
        description: '注意力机制原理论文'
      },
      {
        name: 'BERT预训练模型',
        url: 'https://arxiv.org/abs/1810.04805',
        description: '双向Transformer表示'
      },
      {
        name: 'HuggingFace Transformers',
        url: 'https://huggingface.co/docs/transformers/index',
        description: 'Transformers库使用指南'
      }
    ]
  },
  {
    title: 'VQA数据集与评估',
    description: '学习VQA任务的常用数据集与评估指标',
    icon: 'PictureFilled',
    iconClass: 'icon-dataset',
    resources: [
      {
        name: 'VQA数据集',
        url: 'https://visualqa.org/',
        description: '视觉问答标准数据集'
      },
      {
        name: 'COCO-QA数据集',
        url: 'https://github.com/ramprs/grad-cam/',
        description: '基于COCO的问答数据'
      },
      {
        name: 'GQA平衡数据集',
        url: 'https://cs.stanford.edu/people/dorarad/gqa/',
        description: '视觉问答推理数据集'
      },
      {
        name: 'VQA评估指标',
        url: 'https://github.com/GT-Vision-Lab/VQA',
        description: 'VQA任务评估工具'
      }
    ]
  }
]);

// 代码仓库
const repositories = ref([
  {
    name: 'Hugging Face',
    description: '提供最先进的NLP和CV模型库，包含丰富的预训练模型和工具',
    logo: 'https://huggingface.co/front/assets/huggingface_logo.svg',
    url: 'https://huggingface.co/',
    tags: ['预训练模型', '开源社区', 'Transformers']
  },
  {
    name: 'GitHub',
    description: '开源代码托管平台，可以找到各种VQA相关项目和实现',
    logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    url: 'https://github.com/',
    tags: ['代码托管', '开源社区', '版本控制']
  },
  {
    name: 'PyTorch Hub',
    description: 'PyTorch提供的预训练模型库，包含众多视觉和语言模型',
    logo: 'https://pytorch.org/assets/images/pytorch-logo.png',
    url: 'https://pytorch.org/hub/',
    tags: ['PyTorch', '预训练模型', '深度学习']
  },
  {
    name: 'Papers With Code',
    description: '将论文与开源实现关联的平台，方便查找最新研究及代码',
    logo: 'https://paperswithcode.com/static/logo.png',
    url: 'https://paperswithcode.com/',
    tags: ['研究论文', '代码实现', '基准测试']
  }
]);

// 学习路径
const learningPath = ref([
  {
    title: '基础知识',
    description: 'Python、PyTorch和深度学习基础'
  },
  {
    title: '计算机视觉',
    description: 'CNN、目标检测与图像分割'
  },
  {
    title: '自然语言处理',
    description: 'Transformer、BERT与文本理解'
  },
  {
    title: '多模态融合',
    description: '视觉与语言特征融合方法'
  },
  {
    title: 'VQA模型实现',
    description: '构建完整的视觉问答系统'
  }
]);
</script>

<style scoped>
.learning-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}

/* 头部区域 */
.header-area {
  background: linear-gradient(135deg, #3a8ee6 0%, #5b48d0 100%);
  color: white;
  padding: 30px 20px;
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

/* 内容区域 */
.content-section {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

/* 部分标题 */
.section-header {
  text-align: center;
  margin: 20px 0 30px;
}

.section-header h2 {
  font-size: 1.6rem;
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

/* 学习卡片 */
.learning-cards, .repo-cards {
  margin-bottom: 20px;
}

.learning-card {
  height: 100%;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.learning-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 32px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.icon-pytorch {
  background-color: #EE4C2C;
  color: white;
}

.icon-multimodal {
  background-color: #6236FF;
  color: white;
}

.icon-generation {
  background-color: #41B883;
  color: white;
}

.icon-vision {
  background-color: #FF9500;
  color: white;
}

.icon-nlp {
  background-color: #2C8EFF;
  color: white;
}

.icon-dataset {
  background-color: #F56C6C;
  color: white;
}

.learning-card h3 {
  font-size: 1.3rem;
  margin: 0 0 15px;
  text-align: center;
  color: #303133;
}

.learning-card p {
  color: #606266;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.resource-list {
  padding-left: 5px;
  list-style-type: none;
}

.resource-list li {
  margin-bottom: 12px;
  border-left: 3px solid #409EFF;
  padding-left: 10px;
}

.resource-link {
  color: #409EFF;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

.resource-link:hover {
  text-decoration: underline;
}

.resource-desc {
  display: block;
  color: #909399;
  font-size: 12px;
  margin-top: 3px;
}

/* 仓库卡片 */
.repo-card {
  height: 100%;
  margin-bottom: 20px;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.repo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.repo-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin: 0 auto 15px;
}

.repo-card h3 {
  font-size: 1.2rem;
  margin: 0 0 10px;
  color: #303133;
}

.repo-card p {
  color: #606266;
  font-size: 14px;
  flex-grow: 1;
  margin-bottom: 15px;
}

.repo-tags {
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
}

.repo-tag {
  margin: 0 2px;
}

.repo-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* 学习路径卡片 */
.learning-path-card {
  margin-bottom: 30px;
}

.learning-path-detail {
  margin-top: 30px;
  text-align: center;
  padding: 0 20px;
}

.learning-path-detail h3 {
  font-size: 1.3rem;
  color: #303133;
  margin-bottom: 10px;
}

.learning-path-detail p {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.mt-40 {
  margin-top: 40px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-area {
    padding: 20px 15px;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .description {
    font-size: 0.9rem;
  }
  
  .content-section {
    padding: 0 15px;
  }
  
  .section-header h2 {
    font-size: 1.4rem;
  }
}
</style> 