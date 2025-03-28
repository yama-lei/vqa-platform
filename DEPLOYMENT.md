# VQA学习平台部署指南

本文档提供VQA学习平台的部署步骤，确保正确配置以避免资源加载错误。

## 构建项目

1. 安装依赖：
```bash
npm install
```

2. 构建项目：
```bash
npm run deploy
```
这将构建项目并复制必要的重定向文件到dist目录。

## 部署到服务器

### 方式一：使用Netlify（推荐）

1. 创建一个Netlify账户并创建新站点
2. 将dist目录部署到Netlify
3. 确保域名设置正确（vqa.yama-lei.top）
4. Netlify会自动识别并使用_redirects文件配置重定向规则

### 方式二：使用nginx（服务器部署）

1. 将dist目录内容复制到服务器的网站根目录（如/usr/share/nginx/html）

2. 配置nginx：
   - 复制nginx.conf到服务器
   - 根据实际情况修改服务器名称和根目录路径
   - 重新加载nginx配置：`sudo nginx -s reload`

### 方式三：使用Apache

1. 将dist目录内容复制到Apache的网站根目录
2. 确保.htaccess文件在根目录，并且mod_rewrite模块已启用

## 常见问题解决

如果部署后仍然遇到资源加载问题：

1. **检查基础路径**：确保vite.config.js中的base设置正确
2. **检查重定向配置**：确保服务器正确配置了所有路由重定向到index.html
3. **检查网络请求**：使用浏览器开发者工具检查网络请求，观察哪些资源加载失败以及失败原因
4. **检查控制台错误**：查看浏览器控制台的具体错误信息

### 404错误的特殊处理

如果遇到类似"Failed to load resource: the server responded with a status of 404"错误：

1. 确认服务器配置已将所有路由正确重定向到index.html
2. 检查构建生成的文件名与引用路径是否一致
3. 尝试清除浏览器缓存后重新加载页面

## 其他配置说明

- **.env文件**：包含环境变量设置，影响应用的基础路径和API地址等
- **vite.config.js**：包含构建配置，特别是基础路径设置
- **router/index.js**：确保使用环境变量中的基础路径创建路由器

如有更多部署问题，请联系技术支持团队。 