<template>
  <div class="layout-container">
    <el-container>
      <el-header height="60px">
        <header-component />
      </el-header>
      <el-container>
        <el-aside width="220px">
          <sidebar-component />
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import HeaderComponent from './HeaderComponent.vue'
import SidebarComponent from './SidebarComponent.vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.el-header {
  background-color: #409EFF;
  color: #fff;
  padding: 0;
}

.el-aside {
  background-color: #f5f7f9;
  color: #333;
  overflow: hidden;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
  width: 100%;
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.el-container {
  height: 100%;
  width: 100%;
}
</style> 