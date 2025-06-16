# 阿里云 ECS 生产环境部署指南

## 1. 环境准备

### 1.1 服务器要求
- 操作系统：CentOS 7/8 或 Ubuntu 18.04/20.04
- 架构：x86_64 (amd64)
- 配置：2核4G以上
- 带宽：5Mbps以上
- 磁盘：50GB以上

### 1.2 本地开发环境要求

#### 1.2.1 安装 Docker Desktop
1. 访问 Docker 官网下载页面：https://www.docker.com/products/docker-desktop
2. 选择适合你 Mac 的版本：
   - Apple Silicon (M1/M2) 芯片：下载 Apple Silicon 版本
   - Intel 芯片：下载 Intel Chip 版本
3. 下载并安装 Docker Desktop
4. 启动 Docker Desktop
5. 验证安装：
```bash
docker --version
docker-compose --version
```

#### 1.2.2 安装 Node.js
1. 使用 Homebrew 安装：
```bash
brew install node@16
```
2. 验证安装：
```bash
node --version
npm --version
```

#### 1.2.3 安装 Git
1. 使用 Homebrew 安装：
```bash
brew install git
```
2. 验证安装：
```bash
git --version
```

### 1.3 安全组配置
在阿里云控制台配置安全组，开放以下端口：
- 80 端口：HTTP 访问
- 443 端口：HTTPS 访问（如果使用）
- 22 端口：SSH 访问

## 2. 部署流程

### 2.1 本地构建（在开发机器上执行）

1. 确保 Docker Desktop 正在运行：
   - 检查状态栏中的 Docker 图标
   - 或运行 `docker ps` 测试 Docker 是否正常工作

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

构建脚本会：
- 获取当前 git commit ID
- 构建前端代码
- 使用 Docker Buildx 构建多架构镜像（支持 amd64 和 arm64）
- 保存 amd64 架构的镜像为 `ai-educational-saas-<commit_id>.tar`
- 生成 `.last_commit_id` 文件

注意：
- 如果使用 M1/M2 Mac，脚本会自动构建多架构镜像
- 如果使用 Intel Mac，镜像会自动适配目标架构
- 构建的镜像会自动选择适合服务器架构的版本

### 2.2 文件上传

将以下文件上传到服务器：
```bash
# 在本地执行
scp ai-educational-saas-<commit_id>.tar .last_commit_id docker_start.sh nginx.conf docker-compose.yml user@your-server:/path/to/project/
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

部署脚本会：
- 安装必要的依赖（Docker、Docker Compose、Nginx）
- 检查镜像版本
- 加载 Docker 镜像
- 配置 Nginx
- 启动容器

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
    ├── ai-educational-saas-<commit_id>.tar  # Docker 镜像
    ├── .last_commit_id                      # 版本信息
    ├── docker_start.sh                      # 部署脚本
    ├── nginx.conf                          # Nginx 配置模板
    └── docker-compose.yml                  # Docker 编排配置
```

## 4. 版本管理

### 4.1 版本标识
- 使用 git commit ID 作为版本标识
- 镜像标签格式：`ai-educational-saas:<commit_id>`
- 镜像文件格式：`ai-educational-saas-<commit_id>.tar`

### 4.2 版本更新
1. 开发新功能后提交代码
2. 运行 `build_image.sh` 构建新版本
3. 上传新版本文件到服务器
4. 运行 `docker_start.sh` 部署新版本

### 4.3 版本回滚
1. 找到要回滚的版本 commit ID
2. 确保该版本的镜像文件存在
3. 修改 `.last_commit_id` 文件为要回滚的版本
4. 运行 `docker_start.sh` 部署旧版本

## 5. 常见问题

### 5.1 Docker 相关问题
1. Docker Desktop 无法启动：
   - 检查系统要求是否满足
   - 检查是否有其他程序占用端口
   - 尝试重启电脑

2. 构建镜像失败：
   - 检查 Docker 是否正在运行
   - 检查网络连接
   - 检查磁盘空间

3. 多架构构建失败：
   - 确保 Docker Desktop 版本支持 Buildx
   - 检查 Docker 配置是否启用了实验性功能

### 5.2 端口占用
如果 80 端口被占用：
```bash
# 查看占用进程
sudo netstat -tulpn | grep :80

# 停止占用进程
sudo systemctl stop httpd  # 如果是 Apache
# 或
sudo systemctl stop nginx  # 如果是 Nginx
```

### 5.3 权限问题
如果遇到权限问题：
```bash
# 确保目录权限正确
sudo chown -R nginx:nginx /data/frontend_dist
sudo chown -R nginx:nginx /data/static
sudo chown -R nginx:nginx /data/media
```

### 5.4 日志查看
```bash
# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Docker 容器日志
docker logs <container_id>
```

## 6. 维护建议

### 6.1 定期维护
- 定期检查日志文件
- 定期清理旧的镜像文件
- 定期更新系统安全补丁

### 6.2 备份策略
- 定期备份数据库
- 定期备份上传的文件
- 保存重要版本的镜像文件

### 6.3 监控建议
- 配置服务器监控
- 配置应用性能监控
- 配置错误告警

## 7. 安全建议

### 7.1 系统安全
- 定期更新系统
- 配置防火墙
- 使用强密码

### 7.2 应用安全
- 启用 HTTPS
- 配置安全响应头
- 限制文件上传类型

### 7.3 数据安全
- 定期备份数据
- 加密敏感信息
- 控制文件访问权限 