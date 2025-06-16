# 阿里云 ECS 生产环境部署指南（最新版）

## 1. 环境准备

### 1.1 服务器要求
- 操作系统：CentOS 7/8 或 Ubuntu 18.04/20.04
- 架构：x86_64 (amd64)
- 配置：2核4G以上
- 带宽：5Mbps以上
- 磁盘：50GB以上

### 1.2 本地开发环境要求

#### 1.2.1 安装 Docker 环境
- 推荐使用 Docker Desktop、Colima、OrbStack 或 Rancher Desktop 之一。
- Mac 用户如不想手动启动 Docker Desktop，可用 Colima：
```bash
brew install colima
colima start
```
- 验证 Docker 是否可用：
```bash
docker info
```

#### 1.2.2 安装 Node.js
```bash
brew install node@18
```

#### 1.2.3 安装 Git
```bash
brew install git
```

### 1.3 安全组配置
在阿里云控制台配置安全组，开放以下端口：
- 80 端口：HTTP 访问
- 443 端口：HTTPS 访问（如果使用）
- 22 端口：SSH 访问

## 2. 构建与部署流程

### 2.1 本地构建（在开发机器上执行）

1. 启动 Docker 服务（如 Colima、Docker Desktop、OrbStack 等），确保 `docker info` 能正常输出。
2. 确保代码已提交到 git：
```bash
git add .
git commit -m "准备部署"
```
3. 运行构建脚本：
```bash
chmod +x build_image.sh
./build_image.sh
```

#### 构建脚本说明
- 自动检测 Docker 是否启动，未启动会提示。
- 前端依赖只有在 package.json 或 lock 文件变动时才会重新安装，极大加快二次构建速度。
- 使用多阶段 Dockerfile，最大化利用缓存。
- 自动清理旧的 tar 包。
- 需确保项目根目录有 `.dockerignore` 文件，内容如下：

```dockerignore
# Node.js
node_modules
frontend/node_modules
npm-debug.log
yarn-error.log

# Python
__pycache__
*.pyc
*.pyo
*.pyd
backend/.venv
backend/venv

# 版本控制
.git
.gitignore

# 编辑器/系统文件
.DS_Store
.idea
.vscode

# 日志
*.log

# 其他
*.tar
```

- 构建产物为 `ai-educational-saas-<日期时间>.tar`，支持多架构（amd64, arm64）。

### 2.2 文件上传

将以下文件上传到服务器：
```bash
scp ai-educational-saas-*.tar docker_start.sh nginx.conf docker-compose.yml user@your-server:/path/to/project/
```

### 2.3 服务器部署

1. SSH 登录服务器：
```bash
ssh user@your-server
```
2. 进入项目目录：
```bash
cd /path/to/project
```
3. 运行部署脚本：
```bash
chmod +x docker_start.sh
sudo ./docker_start.sh
```

## 3. 目录结构

```
/
├── /data/
│   ├── frontend_dist/  # 前端静态文件
│   ├── static/         # Django 静态文件
│   └── media/          # 用户上传文件
├── /etc/nginx/
│   └── conf.d/
│       └── your_project.conf  # Nginx 配置
└── /path/to/project/
    ├── ai-educational-saas-<日期时间>.tar  # Docker 镜像
    ├── docker_start.sh                      # 部署脚本
    ├── nginx.conf                          # Nginx 配置模板
    └── docker-compose.yml                  # Docker 编排配置
```

## 4. 版本管理
- 镜像标签格式：`ai-educational-saas:<日期时间>`
- 镜像文件格式：`ai-educational-saas-<日期时间>.tar`
- 构建脚本会自动清理旧的 tar 包，只保留最新

## 5. 常见问题

### 5.1 Docker 相关问题
- Docker 未启动：请用 `colima start` 或启动 Docker Desktop/OrbStack
- 构建镜像失败：检查 Docker 是否正常、网络是否通畅、磁盘空间是否足够
- 多架构构建失败：确保 Docker 支持 buildx

### 5.2 端口占用
```bash
sudo netstat -tulpn | grep :80
sudo systemctl stop httpd  # 如果是 Apache
sudo systemctl stop nginx  # 如果是 Nginx
```

### 5.3 权限问题
```bash
sudo chown -R nginx:nginx /data/frontend_dist
sudo chown -R nginx:nginx /data/static
sudo chown -R nginx:nginx /data/media
```

### 5.4 日志查看
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
docker logs <container_id>
```

## 6. 维护与安全建议
- 定期检查日志、清理旧镜像、备份数据
- 配置服务器和应用安全，建议启用 HTTPS

---

如有问题请联系开发负责人。 