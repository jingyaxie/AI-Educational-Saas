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
DOMAIN_OR_IP="8.217.235.103"  # 如有域名可写 yourdomain.com

# 1. 创建必要的目录
echo "创建必要的目录..."
mkdir -p /data/frontend_dist
mkdir -p /data/static
mkdir -p /data/media

# 2. 查找最新的 tar 文件
LATEST_TAR=$(ls -t ai-educational-saas-*.tar | head -n1)
if [ -z "$LATEST_TAR" ]; then
  echo "[ERROR] 未找到镜像文件 ai-educational-saas-*.tar"
  exit 1
fi

# 3. 提取日期标签
DATE_TAG=$(echo "$LATEST_TAR" | sed -E 's/ai-educational-saas-([0-9]{8}-[0-9]{4})\.tar/\1/')
IMAGE_NAME="ai-educational-saas:$DATE_TAG"

# 4. 检查镜像是否已存在
if ! docker images | grep -q "$IMAGE_NAME"; then
  echo "[INFO] 加载镜像 $IMAGE_NAME ..."
  docker load -i "$LATEST_TAR"
else
  echo "[INFO] 镜像 $IMAGE_NAME 已存在，无需加载。"
fi

# 5. 检查 80 端口是否被占用
if sudo lsof -i:80 | grep LISTEN; then
  echo "[WARN] 80 端口已被占用，将自动查找可用端口..."
  HOST_PORT=8000
  # 自动释放8000及后续端口的占用进程
  while sudo lsof -i:${HOST_PORT} | grep LISTEN; do
    PID=$(sudo lsof -i:${HOST_PORT} | awk 'NR==2{print $2}')
    if [ -n "$PID" ]; then
      echo "[INFO] 端口 $HOST_PORT 被进程 $PID 占用，自动kill..."
      sudo kill $PID
      sleep 1
    fi
    HOST_PORT=$((HOST_PORT+1))
  done
  echo "[INFO] 选用宿主机端口: $HOST_PORT"
else
  HOST_PORT=80
fi

# 清理所有exited的旧容器
EXISTED_CONTAINERS=$(docker ps -a -q -f status=exited)
if [ -n "$EXISTED_CONTAINERS" ]; then
  echo "[INFO] 清理exited的旧容器..."
  docker rm $EXISTED_CONTAINERS
fi

# 5. 自动同步前端构建产物到宿主机 /data/frontend_dist
if [ ! -f /data/frontend_dist/index.html ]; then
  echo "[INFO] /data/frontend_dist/index.html 不存在，自动从镜像中提取..."
  docker run --rm --name temp_copy $IMAGE_NAME \
    sh -c "tar -C /app/frontend_dist -cf - ." > /tmp/frontend_dist.tar
  mkdir -p /data/frontend_dist
  tar -xf /tmp/frontend_dist.tar -C /data/frontend_dist
  sudo chown -R nginx:nginx /data/frontend_dist
  sudo chmod -R 755 /data/frontend_dist
  echo "[INFO] 前端构建产物已同步到 /data/frontend_dist/"
fi

# 6. 启动容器
if [ -f docker-compose.yml ]; then
  echo "[INFO] 使用 docker-compose 启动服务..."
  IMAGE_TAG="$DATE_TAG" docker-compose up -d --remove-orphans
else
  echo "[INFO] 未找到 docker-compose.yml，使用 docker run 启动单一容器..."
  docker rm -f ai-educational-saas || true
  docker run -d --name ai-educational-saas \
    -p $HOST_PORT:80 -p 8000:8000 \
    -v /data/frontend_dist:/app/frontend_dist \
    -v /data/static:/app/static \
    -v /data/media:/app/media \
    $IMAGE_NAME
fi

# 7. 配置 Nginx（如有需要）
if [ -f nginx.conf ]; then
  echo "[INFO] 配置 Nginx..."
  sudo cp nginx.conf /etc/nginx/conf.d/your_project.conf
  sudo nginx -t
  if ! pgrep -x nginx > /dev/null; then
    echo "[INFO] Nginx 未运行，自动启动..."
    sudo systemctl start nginx
  else
    echo "[INFO] Nginx 已运行，重载配置..."
    sudo systemctl reload nginx
  fi
else
  echo "[WARN] 未找到 nginx.conf，跳过 Nginx 配置。"
fi

echo "[INFO] 部署完成，当前镜像: $IMAGE_NAME"
echo "当前部署版本: $DATE_TAG"
echo "前端静态资源目录: /data/frontend_dist"
echo "Django 静态目录: /data/static"
echo "Django 媒体目录: /data/media"
echo "API地址: http://$DOMAIN_OR_IP:$HOST_PORT/" 