# AI Educational SaaS 生产环境一键部署教程（阿里云 ECS）

本教程适用于在阿里云 ECS（或其他 Linux 云服务器）上，使用 Docker + Nginx 部署本项目的生产环境。

---

## 1. 环境准备

- 一台已安装 Docker、Nginx 的云服务器（推荐 Ubuntu/CentOS）
- 已 clone 本项目代码到服务器
- 服务器有 sudo 权限

### 安装 Docker（如未安装）
```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
sudo systemctl enable docker && sudo systemctl start docker
```

### 安装 Nginx（如未安装）
```bash
sudo apt update && sudo apt install nginx -y   # Ubuntu
# 或
sudo yum install nginx -y                      # CentOS
sudo systemctl enable nginx && sudo systemctl start nginx
```

---

## 2. 配置环境变量

设置你的域名或公网IP（用于 Nginx server_name）：
```bash
export DOMAIN_OR_IP=your-domain.com   # 或 export DOMAIN_OR_IP=123.123.123.123
```

---

## 3. 一键部署

在项目根目录下执行：
```bash
sudo bash docker_start.sh
```
脚本会自动完成：
- 创建静态、媒体、前端目录（/data/static /data/media /data/frontend_dist）
- 用 envsubst 自动替换 nginx.conf 并拷贝到 /etc/nginx/conf.d/your_project.conf
- 重载 Nginx
- 构建 Docker 镜像
- 停止并删除旧容器
- 启动新容器并挂载目录

---

## 4. 目录说明

- `/data/static`         Django 静态文件目录（collectstatic 后）
- `/data/media`          Django 媒体文件目录（用户上传）
- `/data/frontend_dist`  前端构建产物目录（React build）

---

## 5. Nginx 配置说明

- `server_name` 自动替换为 DOMAIN_OR_IP 环境变量
- `/`             访问前端静态资源
- `/api/`         反向代理到 Django API（8000端口）
- `/static/`      访问 Django 静态文件
- `/media/`       访问 Django 媒体文件

---

## 6. 常见问题

- **端口冲突**：如 80/8000 端口被占用，请修改 docker_start.sh 和 nginx.conf
- **权限问题**：确保 /data 相关目录有读写权限，Nginx/Docker 用户可访问
- **HTTPS 配置**：如需 HTTPS，请在 nginx.conf 中添加 SSL 配置
- **数据库**：生产环境建议使用云数据库或独立容器，不建议用 SQLite

---

## 7. 访问服务

- 前端页面：http://your-domain.com
- API 接口：http://your-domain.com/api/

---

## 8. 其他

- 如需自定义 Nginx、Docker、环境变量等，请根据实际需求调整配置文件
- 如需多容器编排（如数据库、Redis），可使用 docker-compose.yml

---

如有问题请联系项目维护者。 