<template>
  <el-menu
    :default-active="activeMenu"
    class="sidebar-menu"
    :router="true"
    background-color="#f5f7f9"
    text-color="#303133"
    active-text-color="#409EFF"
  >
    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-menu-item index="/resources">
      <el-icon><Document /></el-icon>
      <span>资源中心</span>
    </el-menu-item>
    <el-menu-item index="/model">
      <el-icon><ChatLineRound /></el-icon>
      <span>模型对话</span>
    </el-menu-item>
    <el-menu-item index="/upload">
      <el-icon><Upload /></el-icon>
      <span>文件上传</span>
    </el-menu-item>
    <el-menu-item index="/learning">
      <el-icon><Reading /></el-icon>
      <span>学习空间</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  HomeFilled, 
  Document, 
  ChatLineRound, 
  Upload,
  Reading
} from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: none;
  overflow: hidden;
}

.sidebar-menu .el-menu-item {
  margin: 5px 0;
}

.el-menu-item [class^="el-icon"] {
  margin-right: 5px;
}

/* 去除滚动条 */
::-webkit-scrollbar {
  display: none;
}
</style> 