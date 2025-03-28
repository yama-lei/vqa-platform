<template>
  <!--This Header is not on use!-->
  <div class="header-container">
    <div class="logo">
      <h1>VQA学习小组</h1>
    </div>
    <div class="header-right">
      <el-dropdown>
        <span class="el-dropdown-link">
          <el-avatar :size="32" :src="avatarUrl">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <span class="username">管理员</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item>设置</el-dropdown-item>
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'

const avatarUrl = ref('')
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #fff;
}

.username {
  margin-left: 8px;
}
</style> 