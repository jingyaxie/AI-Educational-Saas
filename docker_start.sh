#!/bin/bash

# 设置错误时退出
set -e

echo "开始部署..."

# 检查并安装必要的依赖
echo "检查系统依赖..."
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    if [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        yum install -y epel-release
        yum install -y nginx
        systemctl start nginx
        systemctl enable nginx
    elif [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y nginx
        systemctl start nginx
        systemctl enable nginx
    fi
fi

IMAGE_NAME=ai-educational-saas
CONTAINER_NAME=ai-educational-saas
PORT=8000
NGINX_CONF=/etc/nginx/conf.d/your_project.conf
PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
DOMAIN_OR_IP=${DOMAIN_OR_IP:-_}

# 1. 创建必要的目录
echo "创建必要的目录..."
mkdir -p /data/frontend_dist
mkdir -p /data/static
mkdir -p /data/media

# 2. 检查镜像版本
echo "检查镜像版本..."
if [ ! -f .last_commit_id ]; then
    echo "错误：找不到 .last_commit_id 文件"
    exit 1
fi

CURRENT_COMMIT=$(cat .last_commit_id)
IMAGE_TAG="${IMAGE_NAME}:${CURRENT_COMMIT}"
IMAGE_FILE="${IMAGE_NAME}-${CURRENT_COMMIT}.tar"

# 检查镜像文件是否存在
if [ ! -f "${IMAGE_FILE}" ]; then
    echo "错误：找不到镜像文件 ${IMAGE_FILE}"
    echo "请先运行 build_image.sh 构建镜像"
    exit 1
fi

# 检查本地是否已有该版本的镜像
if ! docker image inspect ${IMAGE_TAG} >/dev/null 2>&1; then
    echo "加载新版本镜像..."
    docker load < ${IMAGE_FILE}
else
    echo "使用已存在的镜像版本: ${IMAGE_TAG}"
fi

# 3. 设置 Nginx 配置
echo "配置 Nginx..."
# 备份现有配置
if [ -f /etc/nginx/conf.d/your_project.conf ]; then
    cp /etc/nginx/conf.d/your_project.conf /etc/nginx/conf.d/your_project.conf.backup
fi

# 检查 nginx.conf 是否存在
if [ ! -f nginx.conf ]; then
    echo "错误：nginx.conf 文件不存在！"
    exit 1
fi

# 使用项目中的 nginx.conf
cp nginx.conf /etc/nginx/conf.d/your_project.conf

# 检查 Nginx 配置
echo "检查 Nginx 配置..."
nginx -t

# 如果配置正确，重新加载 Nginx
if [ $? -eq 0 ]; then
    echo "Nginx 配置正确，重新加载..."
    nginx -s reload
else
    echo "Nginx 配置有误，请检查错误信息"
    exit 1
fi

# 4. 启动 Docker 容器
echo "启动 Docker 容器..."
# 更新 docker-compose.yml 中的镜像标签
sed -i "s|image: ${IMAGE_NAME}:.*|image: ${IMAGE_TAG}|" docker-compose.yml

docker compose up -d

echo "部署完成！"
echo "当前部署版本: ${CURRENT_COMMIT}"
echo "前端静态资源目录: /data/frontend_dist"
echo "Django 静态目录: /data/static"
echo "Django 媒体目录: /data/media"
echo "API地址: http://$DOMAIN_OR_IP:$PORT" 