# GitHub Pages 部署指南

本文档提供如何将VQA学习平台部署到GitHub Pages的详细步骤。

## 前期准备

1. 确保你有一个GitHub账户
2. 创建一个名为`vqa-platform`的仓库（或根据你的仓库名修改配置）
3. 确保本地已安装Git和Node.js (>=20.0.0)

## 构建与部署步骤

### 1. 克隆仓库并安装依赖

```bash
git clone https://github.com/你的用户名/vqa-platform.git
cd vqa-platform
npm install
```

### 2. 构建项目

使用GitHub Pages专用的构建命令：

```bash
npm run deploy:github
```

这个命令会：
- 构建Vue项目
- 复制404.html到dist目录（用于处理SPA路由）
- 创建CNAME文件（如果你有自定义域名）

### 3. 部署到GitHub Pages

有两种方法可以部署到GitHub Pages：

#### 方法一：手动部署

1. 将dist目录的内容推送到GitHub仓库的gh-pages分支

```bash
# 如果你还没有gh-pages分支
git checkout -b gh-pages

# 清空分支（保留.git目录）
git rm -rf .
git clean -fxd

# 复制dist目录内容到根目录
cp -r dist/* .

# 提交更改
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

2. 在GitHub仓库设置中启用GitHub Pages
   - 进入仓库 -> Settings -> Pages
   - Source选择"gh-pages" 分支
   - 如果有自定义域名，在Custom domain中输入

#### 方法二：使用gh-pages工具（推荐）

1. 安装gh-pages包

```bash
npm install -D gh-pages
```

2. 在package.json中添加脚本（已添加）：

```json
"scripts": {
  "deploy:github": "vite build && cp public/404.html dist/ && echo 'vqa.yama-lei.top' > dist/CNAME && gh-pages -d dist"
}
```

3. 运行部署命令：

```bash
npm run deploy:github
```

## SPA路由问题解决

GitHub Pages不原生支持SPA的客户端路由，我们使用了以下策略解决这个问题：

1. 自定义的404.html页面捕获所有不存在的路由，然后重定向回主页
2. 在index.html中添加脚本处理重定向参数
3. 使用正确的BASE_URL配置

## 自定义域名设置

如果你想使用自定义域名（如vqa.yama-lei.top）：

1. 在DNS提供商处添加CNAME记录，指向`你的用户名.github.io`
2. 在GitHub仓库设置中的Pages部分添加自定义域名
3. 确保CNAME文件已添加到dist目录中

## 常见问题

### 1. 部署后页面空白

检查浏览器控制台错误，通常是资源路径问题。确认：
- vite.config.js中的base设置正确（`/${repoName}/`）
- .env.production中的VITE_BASE_URL正确
- 404.html中的仓库名称设置正确

### 2. 页面刷新后404

这是GitHub Pages上SPA的常见问题。确认：
- 404.html文件存在于根目录
- index.html中的路由处理脚本正常工作

### 3. 自定义域名失效

每次部署后需要确保CNAME文件存在于部署目录中。检查：
- deploy:github脚本中是否正确创建了CNAME文件
- GitHub仓库设置中是否配置了自定义域名

## 更新部署

每次更新代码后，只需重新运行部署命令：

```bash
npm run deploy:github
```

这将重新构建应用并部署到GitHub Pages。 